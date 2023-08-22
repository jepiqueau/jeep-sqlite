import initSqlJs from 'sql.js';
import { EventEmitter } from '@stencil/core';

import { SQLiteSet, JsonSQLite, SQLiteVersionUpgrade, JsonProgressListener} from '../interfaces/interfaces';

import { UtilsStore } from './utils-store';
import { UtilsImportJSON } from './utils-importJson';
import { UtilsJSON } from './utils-json';
import { UtilsExportJSON } from './utils-exportJson';
import { UtilsUpgrade }  from './utils-upgrade';
import { UtilsSQLite } from './utils-sqlite'

export class Database {
  private _isDBOpen: boolean;
  private dbName: string;
  private store: any;
  private version: number;
  public mDb: any;
  private vUpgDict: Record<number, SQLiteVersionUpgrade> = {};
  private autoSave: boolean = false;
  private wasmPath: string = '/assets';
  private isBackup: boolean = false;
  private isTransactionActive: boolean = false;


  constructor(databaseName: string, version: number,
              upgDict: Record<number, SQLiteVersionUpgrade>,
              store: LocalForage, autoSave: boolean, wasmPath: string) {
    this.dbName = databaseName;
    this.store = store;
    this.version = version;
    this.mDb = null;
    this.vUpgDict = upgDict;
    this._isDBOpen = false;
    this.autoSave = autoSave;
    this.wasmPath = wasmPath;
  }
  public async open(): Promise<void> {
    const config ={
      locateFile: (file: any) => `${this.wasmPath}/${file}`
    }

    return new Promise((resolve,reject) => {
      try {
        initSqlJs(config).then(async (SQL) => {
          // retrieve the database if stored on localforage
          const retDB: Uint8Array = await UtilsStore.getDBFromStore(this.dbName, this.store);
          if(retDB != null) {
            // Open existing database
            this.mDb = new SQL.Database(retDB);
          } else {
            // Create a new database
            this.mDb = new SQL.Database();
            await UtilsStore.setInitialDBToStore( this.dbName, this.store);
          }

          this._isDBOpen = true;
          // get the current version
          let curVersion: number = await UtilsSQLite.getVersion(this.mDb);
          if (this.version > curVersion && (Object.keys(this.vUpgDict)).length > 0) {
            try {
              // copy the db
              const isDB: boolean = await UtilsStore.isDBInStore(this.dbName, this.store);
              if (isDB) {
                await UtilsStore.copyDBToStore(this.dbName, `backup-${this.dbName}`, this.store);
                this.isBackup = true;
              }

              // execute the upgrade flow process
              const changes: number = await UtilsUpgrade.onUpgrade(
                                      this,
                                      this.vUpgDict,
                                      curVersion,
                                      this.version
              );
              if(changes === -1) {
                // restore the database from backup
                try {
                  if(this.isBackup) {
                    await UtilsStore.restoreDBFromStore(this.dbName, 'backup',this.store);
                  }
                } catch (err) {
                  return reject(new Error(`Open: ${err.message}`));
                }
              }
              // delete the backup database
              if(this.isBackup) {
                await UtilsStore.removeDBFromStore(`backup-${this.dbName}`,this.store);
              }


            } catch (err) {
              // restore the database from backup
              try {
                if(this.isBackup) {
                  await UtilsStore.restoreDBFromStore(this.dbName, 'backup',this.store);
                }
              } catch (err) {
                return reject(new Error(`Open: ${err.message}`));
              }
            }

          }
          if( this.autoSave ) {
            try {
              await this.saveToStore();
            } catch (err) {
              this._isDBOpen = false;
              return reject(`Open: ${err}`);
            }
          }
          // set Foreign Keys On
          await UtilsSQLite.setForeignKeyConstraintsEnabled(this.mDb, true);

          return resolve();
        });
      } catch (err) {
        this._isDBOpen = false;
        return reject(`in open ${err}`);
      }

    });
  }
  public isDBOpen(): boolean {
    return this._isDBOpen;
  }
  public async close(): Promise<void> {
    if (this.mDb != null && this._isDBOpen) {
      try {
        // save the database to store
        await this.saveToStore(false);
        // close the database
        this.mDb.close();
        this._isDBOpen = false;


      } catch (err) {
        this._isDBOpen = false;
        return Promise.reject(`in close ${err}`);
      }
    }
    return Promise.resolve();
  }
  public async saveToStore(setFK:boolean = true): Promise<void> {
    if (this.mDb != null && this._isDBOpen) {
      try {
        // save the database to store
        await UtilsStore.setDBToStore(this.mDb, this.dbName, this.store);
        if(setFK) {
          // set Foreign Keys On
          await UtilsSQLite.setForeignKeyConstraintsEnabled(this.mDb, true);
        }
      } catch (err) {
        return Promise.reject(`in saveToStore ${err}`);
      }
    }
    return Promise.resolve();
  }
  public async exportDB(): Promise<Uint8Array> {
    // export the database
    try {
      const data: Uint8Array = this.mDb.export();
      return data;
    } catch (err) {
      const msg = err.message ? err.message : err;
      return Promise.reject(`exportDB: ${msg}`);
    }

  }
  public async getVersion(): Promise<number> {
    if (this.mDb != null && this._isDBOpen) {
      try {
        // save the database to store
        const curVersion: number = await UtilsSQLite.getVersion(this.mDb)
        return Promise.resolve(curVersion);
      } catch (err) {
        this._isDBOpen = false;
        return Promise.reject(`in getVersion ${err}`);
      }
    }
  }

  public async isDBExists(database: string): Promise<boolean> {
    try {
      const isExists: boolean = await UtilsStore.isDBInStore(database, this.store);
      return Promise.resolve(isExists);
    } catch (err) {
      return Promise.reject(`in isDBExists ${err}`);
    }
  }
  public async deleteDB(database: string): Promise<void> {
    try {
      // test if file exists
      const isExists: boolean = await this.isDBExists(database);
      if (isExists && !this._isDBOpen) {
        // open the database
          await this.open();
      }
      // close the database
      await this.close();
      // delete the database
      if (isExists) {
        await UtilsStore.removeDBFromStore(database, this.store);
      }
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(new Error(`DeleteDB: ${err.message}`));
    }

  }
  public async beginTransaction(): Promise<number> {
    if (!this._isDBOpen) {
      let msg = `BeginTransaction: Database ${this.dbName} `;
      msg += `not opened`;
      return Promise.reject(new Error(msg));
    }
    try {
      console.log(`&&&&& in jeep database before beginTransaction: ${this.isTransActive()}`)
      await UtilsSQLite.beginTransaction(this.mDb, true);
      this.setIsTransActive(true);
      console.log(`&&&&& in jeep database after beginTransaction: ${this.isTransActive()}`)

      return 0;
    } catch(err) {
      let msg = `BeginTransaction: ${err.message}`;
      console.log(`&&&&& in jeep database begin Transaction Error: ${err.message}`)
      return Promise.reject(new Error(`${msg}`));
    }

  }
  public async commitTransaction(): Promise<number> {
    if (!this._isDBOpen) {
      let msg = `CommitTransaction: Database ${this.dbName} `;
      msg += `not opened`;
      return Promise.reject(new Error(msg));
    }
    try {
      console.log(`&&&&& in jeep database before commitTransaction: ${this.isTransActive()}`)
      await UtilsSQLite.commitTransaction(this.mDb, true);
      this.setIsTransActive(false);
      console.log(`&&&&& in jeep database after commitTransaction: ${this.isTransActive()}`)
      return 0
    } catch(err) {
      let msg = `CommitTransaction: ${err.message}`;
      console.log(`&&&&& in jeep database commitTransaction Error: ${err.message}`)
      return Promise.reject(new Error(`${msg}`));
    }

  }
  public async rollbackTransaction(): Promise<number> {
    if (!this._isDBOpen) {
      let msg = `RollbackTransaction: Database ${this.dbName} `;
      msg += `not opened`;
      return Promise.reject(new Error(msg));
    }
    try {
      console.log(`&&&&& in jeep database before rollbackTransaction: ${this.isTransActive()}`)
      await UtilsSQLite.rollbackTransaction(this.mDb, true);
      this.setIsTransActive(false);
      console.log(`&&&&& in jeep database after rollbackTransaction: ${this.isTransActive()}`)
      return 0
    } catch(err) {
      let msg = `RollbackTransaction: ${err.message}`;
      console.log(`&&&&& in jeep database rollbackTransaction Error: ${err.message}`)
      return Promise.reject(new Error(`${msg}`));
    }

  }
  public isTransActive(): boolean {
    return this.isTransactionActive;
  }
  public setIsTransActive(value: boolean) {
    this.isTransactionActive = value;
  }
  public async executeSQL(sql: string, transaction: boolean = true): Promise<number> {
    if (!this._isDBOpen) {
      let msg = `ExecuteSQL: Database ${this.dbName} `;
      msg += `not opened`;
      return Promise.reject(new Error(msg));
    }
    let initChanges = -1;
    console.log(`>>>> in executeSQL: ${sql}, ${transaction} , ${this.isTransactionActive}`)
    try {
      initChanges = await UtilsSQLite.dbChanges(this.mDb);
      if(transaction && !this.isTransactionActive ) {
        await this.beginTransaction();
      }
    } catch(err) {
      let msg = `executeSQL: ${err.message}`;
      return Promise.reject(new Error(`${msg}`));
    }
    try {
      const mChanges = await UtilsSQLite.execute(this.mDb, sql, false);
      if (mChanges < 0) {
        return Promise.reject(new Error('ExecuteSQL: changes < 0'));
      }
      console.log(`>>>> in executeSQL before commit : ${sql}, ${transaction} , ${this.isTransactionActive}`)
      if(transaction && this.isTransactionActive) {
        console.log(`>>>> in executeSQL going to commit`);
        await this.commitTransaction();
        console.log(`>>>> in executeSQL after commit : ${sql}, ${transaction} , ${this.isTransactionActive}`)
      }
      const changes = (await UtilsSQLite.dbChanges(this.mDb)) - initChanges;
      return Promise.resolve(changes);
    } catch (err) {
      let msg = `ExecuteSQL: ${err.message}`;
      try {
        if(transaction && this.isTransactionActive) await this.rollbackTransaction();
      } catch (err) {
        msg += ` : ${err.message}`;
      }
      return Promise.reject(new Error(`ExecuteSQL: ${msg}`));
    } finally {
      if(transaction) this.isTransactionActive = false;
      if( this.autoSave ) {
        try {
          await this.saveToStore();
        } catch (err) {
          this._isDBOpen = false;
          return Promise.reject(`ExecuteSQL: ${err}`);
        }
      }
      console.log(`>>>> in executeSQL end :  ${transaction} , ${this.isTransactionActive}`)

    }
  }
  public async execSet(set: SQLiteSet[], transaction: boolean = true, returnMode ='no'): Promise<any> {
    if (!this._isDBOpen) {
      let msg = `ExecSet: Database ${this.dbName} `;
      msg += `not opened`;
      return Promise.reject(new Error(msg));
    }
    const retRes: any = { changes: -1, lastId: -1 };
    let initChanges = -1;
    try {
      initChanges = await UtilsSQLite.dbChanges(this.mDb);
      if(transaction && !this.isTransactionActive) {
        await this.beginTransaction();
      }
    } catch(err) {
      let msg = `ExecSet: ${err.message}`;
      return Promise.reject(new Error(`${msg}`));
    }
    try {
      const retObj: any = await UtilsSQLite.executeSet(this.mDb, set, false, returnMode);
      let lastId: number = retObj["lastId"];
      if (lastId < 0) {
        return Promise.reject(new Error('ExecSet: changes < 0'));
      }
      if(transaction && this.isTransactionActive) await this.commitTransaction();
      const changes = (await UtilsSQLite.dbChanges(this.mDb)) - initChanges;
      retRes.changes = changes;
      retRes.lastId = lastId;
      retRes.values = retObj["values"] ? retObj["values"] : []
      return Promise.resolve(retRes);
    } catch (err) {
      let msg = `ExecSet: ${err.message}`;
      try {
        if(transaction && this.isTransactionActive) await this.rollbackTransaction();
      } catch (err) {
        msg += ` : ${err.message}`;
      }
      return Promise.reject(new Error(`ExecSet: ${msg}`));
    } finally {
      if(transaction) this.isTransactionActive = false;
      if( this.autoSave ) {
        try {
          await this.saveToStore();
        } catch (err) {
          this._isDBOpen = false;
          return Promise.reject(`ExecSet: ${err}`);
        }
      }
    }
  }
  public async selectSQL(sql: string, values: string[]): Promise<any[]> {
    if (!this._isDBOpen) {
      let msg = `SelectSQL: Database ${this.dbName} `;
      msg += `not opened`;
      return Promise.reject(new Error(msg));
    }
    try {
      let retArr: any[] = await UtilsSQLite.queryAll(this.mDb, sql, values);
      return Promise.resolve(retArr);
    } catch (err) {
      return Promise.reject(new Error(`SelectSQL: ${err.message}`));
    }
  }
  public async runSQL(statement: string, values: any[], transaction: boolean = true,
                      returnMode: string): Promise<any> {
    let lastId = -1;
    if (!this._isDBOpen) {
      let msg = `RunSQL: Database ${this.dbName} `;
      msg += `not opened`;
      return Promise.reject(new Error(msg));
    }
    console.log(`>>>> in runSQL: ${statement}, ${transaction} , ${this.isTransactionActive}`)
    console.log(`>>>> in runSQL: ${values}, ${transaction} , ${this.isTransactionActive}`)
    const retRes: any = { changes: -1, lastId: -1 };
    let initChanges = -1;
    try {
      initChanges = await UtilsSQLite.dbChanges(this.mDb);

      if(transaction && !this.isTransactionActive) {
        console.log(`>>>> in runSQL going to beginTransaction`)
        await this.beginTransaction();
      }
     } catch(err) {
      let msg = `RunSQL: ${err.message}`;
      return Promise.reject(new Error(`${msg}`));
    }
    try {
      const retObj = await UtilsSQLite.run(this.mDb, statement, values, false, returnMode);
      lastId = retObj["lastId"];
      if (lastId < 0) {
        return Promise.reject(new Error('RunSQL: lastId < 0'));
      }
      if(transaction && this.isTransactionActive) {
        console.log(`>>>> in runSQL going to commitTransaction`)
        await this.commitTransaction();
        console.log(`>>>> in runSQL after commit : ${statement}, ${transaction} , ${this.isTransactionActive}`)
      }
      const changes = (await UtilsSQLite.dbChanges(this.mDb)) - initChanges;
      retRes.changes = changes;
      retRes.lastId = lastId;
      retRes.values = retObj["values"] ? retObj["values"] : []
      return Promise.resolve(retRes);
    } catch (err) {
      let msg = `RunSQL: ${err.message}`;
      try {
        if(transaction && this.isTransactionActive) {
          console.log(`>>>> in runSQL going to rollbackTransaction`)
          await this.rollbackTransaction();
        }
      } catch (err) {
        msg += ` : ${err.message}`;
      }
      return Promise.reject(new Error(`${msg}`));
    } finally {
      if(transaction) this.setIsTransActive(false);
      if( this.autoSave ) {
        try {
          await this.saveToStore();
        } catch (err) {
          this._isDBOpen = false;
          return Promise.reject(`ExecSet: ${err}`);
        }
      }
    }
  }
  async getTableNames(): Promise<any[]> {
    if (!this._isDBOpen) {
      let msg = `GetTableNames: Database ${this.dbName} `;
      msg += `not opened`;
      return Promise.reject(new Error(msg));
    }
    try {
      let retArr: any[] = await UtilsSQLite.getTableList(this.mDb);
      return Promise.resolve(retArr);
    } catch (err) {
      return Promise.reject(new Error(`GetTableNames: ${err.message}`));
    }

  }
  async isTable(tableName: string): Promise<boolean> {
    if (!this._isDBOpen) {
      let msg = `isTable: Database ${this.dbName} `;
      msg += `not opened`;
      return Promise.reject(new Error(msg));
    }
    try {
      const retB = await UtilsSQLite.isTableExists(this.mDb, tableName);
      return Promise.resolve(retB);
    } catch (err) {
      const msg = `IsTable: ${err.message}`;
      return Promise.reject(new Error(msg));
    }
  }
  async createSyncTable(): Promise<number> {
    if (!this._isDBOpen) {
      let msg = `createSyncTable: Database ${this.dbName} `;
      msg += `not opened`;
      return Promise.reject(new Error(msg));
    }
    let changes = -1;
    try {
      const retB = await UtilsSQLite.isTableExists(this.mDb, 'sync_table');
      if(!retB) {
        const isLastMod = await UtilsSQLite.isLastModified(this.mDb, this._isDBOpen);
        const isDel = await UtilsSQLite.isSqlDeleted(this.mDb, this._isDBOpen);
        if(isLastMod && isDel) {
          const date: number = Math.round(new Date().getTime() / 1000);
          let stmts = `
                          CREATE TABLE IF NOT EXISTS sync_table (
                              id INTEGER PRIMARY KEY NOT NULL,
                              sync_date INTEGER
                              );`;
          stmts += `INSERT INTO sync_table (sync_date) VALUES (
                              "${date}");`;
          changes = await UtilsSQLite.execute(this.mDb, stmts, false);
          return Promise.resolve(changes);
        } else {
          return Promise.reject(new Error('No last_modified/sql_deleted columns in tables'));
        }
      } else {
        return Promise.resolve(0);
      }
    } catch (err) {
      const msg = `CreateSyncTable: ${err.message}`;
      return Promise.reject(new Error(msg));
    }
  }
  async getSyncDate(): Promise<number> {
    if (!this._isDBOpen) {
      let msg = `getSyncDate: Database ${this.dbName} `;
      msg += `not opened`;
      return Promise.reject(new Error(msg));
    }
    try {
      const isTable = await UtilsSQLite.isTableExists(this.mDb, 'sync_table');
      if(!isTable) {
        return Promise.reject(new Error('No sync_table available'));
      }
      const res = await UtilsExportJSON.getSynchroDate(this.mDb);
      return Promise.resolve(res);
    } catch (err) {
      const msg = `getSyncDate: ${err.message}`;
      return Promise.reject(new Error(msg));
    }
  }
  async setSyncDate(syncDate: string): Promise<any> {
    if (!this._isDBOpen) {
      let msg = `SetSyncDate: Database ${this.dbName} `;
      msg += `not opened`;
      return { result: false, message: msg };
    }
    try {
      const isTable = await UtilsSQLite.isTableExists(this.mDb, 'sync_table');
      if(!isTable) {
        return Promise.reject(new Error('No sync_table available'));
      }
      const sDate: number = Math.round(new Date(syncDate).getTime() / 1000);
      let stmt = `UPDATE sync_table SET sync_date = `;
      stmt += `${sDate} WHERE id = 1;`;
      const changes: number = await UtilsSQLite.execute(this.mDb, stmt, false);
      if (changes < 0) {
        return { result: false, message: 'setSyncDate failed' };
      } else {
        return { result: true };
      }
    } catch (err) {
      return { result: false, message: `setSyncDate failed: ${err.message}` };
    }
  }
  async importJson(jsonData: JsonSQLite, importProgress: EventEmitter<JsonProgressListener>): Promise<any> {
    let changes = 0;
    if (this._isDBOpen) {
      try {
        // set Foreign Keys Off
        await UtilsSQLite.setForeignKeyConstraintsEnabled(this.mDb, false);

        if (jsonData.tables && jsonData.tables.length > 0) {

          // create the database schema
          changes = await UtilsImportJSON.createDatabaseSchema(this, jsonData);
          let msg = `Schema creation completed changes: ${changes}`;
          importProgress.emit({progress:msg});

          if (changes != -1) {
            // create the tables data
            changes += await UtilsImportJSON.createTablesData(this, jsonData, importProgress);
            let msg = `Tables data creation completed changes: ${changes}`;
            importProgress.emit({progress:msg});
          }
        }
        if (jsonData.views && jsonData.views.length > 0) {
          // create the views
          changes += await UtilsImportJSON.createViews(this, jsonData);
        }
        // set Foreign Keys On
        await UtilsSQLite.setForeignKeyConstraintsEnabled(this.mDb, true);

        await this.saveToStore();

        return Promise.resolve(changes);
      } catch (err) {
        return Promise.reject(new Error(`ImportJson: ${err.message}`));
      }
    } else {
      return Promise.reject(new Error(`ImportJson: database is closed`));
    }
  }
  async exportJson(mode: string, exportProgress: EventEmitter<JsonProgressListener>): Promise<any> {
    const inJson: JsonSQLite = {} as JsonSQLite;
    inJson.database = this.dbName.slice(0, -9);
    inJson.version = this.version;
    inJson.encrypted = false;
    inJson.mode = mode;
    if (this._isDBOpen) {
      try {
        const isTable = await UtilsSQLite.isTableExists(this.mDb, 'sync_table');
        if(isTable) {
          await UtilsExportJSON
                  .setLastExportDate(this.mDb, (new Date()).toISOString());
        }
        const retJson: JsonSQLite = await UtilsExportJSON
                      .createExportObject(this.mDb, inJson, exportProgress);
        const keys = Object.keys(retJson);
        if(keys.length === 0) {
          const msg = `ExportJson: return Object is empty `+
                      `No data to synchronize`;
          return Promise.reject(new Error(msg));
        }
        const isValid = UtilsJSON.isJsonSQLite(retJson);
        if (isValid) {
          return Promise.resolve(retJson);
        } else {
          return Promise.reject(new Error(`ExportJson: retJson not valid`));
        }
      } catch (err) {
        return Promise.reject(new Error(`ExportJson: ${err.message}`));
      }
    } else {
      return Promise.reject(new Error(`ExportJson: database is closed`));
    }
  }
  async deleteExportedRows() : Promise<void> {
    if (this._isDBOpen) {
      try {
        await UtilsExportJSON.delExportedRows(this.mDb);
        return Promise.resolve();
      } catch (err) {
        return Promise.reject(new Error(`deleteExportedRows: ${err.message}`));
      }
    } else {
      return Promise.reject(new Error(`deleteExportedRows: database is closed`));
    }

  }
}
