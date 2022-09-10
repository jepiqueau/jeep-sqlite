import initSqlJs from 'sql.js';
import { EventEmitter } from '@stencil/core';

import { SQLiteSet, JsonSQLite, SQLiteVersionUpgrade, JsonProgressListener} from '../interfaces/interfaces';

import { getDBFromStore, setInitialDBToStore, setDBToStore, copyDBToStore,
         removeDBFromStore, isDBInStore, restoreDBFromStore } from './utils-store';
import { dbChanges, beginTransaction, rollbackTransaction, commitTransaction,
         execute, executeSet, run, queryAll, isTableExists, getVersion, isSqlDeleted,
         isLastModified, getTableList, setForeignKeyConstraintsEnabled } from './utils-sqlite';
import { createDatabaseSchema, createTablesData, createViews} from './utils-importJson';
import { isJsonSQLite } from './utils-json';
import { createExportObject, getSynchroDate, setLastExportDate, delExportedRows } from './utils-exportJson';
import { onUpgrade }  from './utils-upgrade';

export class Database {
  private _isDBOpen: boolean;
  private dbName: string;
  private store: any;
  private version: number;
  private mDb: any;
  private vUpgDict: Record<number, SQLiteVersionUpgrade> = {};
  private autoSave: boolean = false;
  private wasmPath: string = '/assets';
  private isBackup: boolean = false;


  constructor(databaseName: string, version: number, upgDict: Record<number, SQLiteVersionUpgrade>,
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
          const retDB: Uint8Array = await getDBFromStore(this.dbName, this.store);
          if(retDB != null) {
            // Open existing database
            this.mDb = new SQL.Database(retDB);
          } else {
            // Create a new database
            this.mDb = new SQL.Database();
            await setInitialDBToStore( this.dbName, this.store);
          }

          // get the current version
          let curVersion: number = await getVersion(this.mDb);
          this._isDBOpen = true;
          if (this.version > curVersion && (Object.keys(this.vUpgDict)).length > 0) {
            try {
              // copy the db
              const isDB: boolean = await isDBInStore(this.dbName, this.store);
              if (isDB) {
                await copyDBToStore(this.dbName, `backup-${this.dbName}`, this.store);
                this.isBackup = true;
              }

              // execute the upgrade flow process
              const changes: number = await onUpgrade(
                                      this.mDb,
                                      this.vUpgDict,
                                      curVersion,
                                      this.version
              );
              if(changes === -1) {
                // restore the database from backup
                try {
                  if(this.isBackup) {
                    await restoreDBFromStore(this.dbName, `backup-${this.dbName}`,this.store);
                  }
                } catch (err) {
                  return reject(new Error(`Open: ${err.message}`));
                }
              }
              // delete the backup database
              if(this.isBackup) {
                await removeDBFromStore(`backup-${this.dbName}`,this.store);
              }

            } catch (err) {
              // restore the database from backup
              try {
                if(this.isBackup) {
                  await restoreDBFromStore(this.dbName, 'backup',this.store);
                }
              } catch (err) {
                return reject(new Error(`Open: ${err.message}`));
              }
            }

          }
          if( this.autoSave ) {
            try {
              await setDBToStore(this.mDb, this.dbName, this.store);
            } catch (err) {
              this._isDBOpen = false;
              return reject(`in open ${err}`);
            }
          }
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
        await setDBToStore(this.mDb, this.dbName, this.store);
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
  public async saveToStore(): Promise<void> {
    if (this.mDb != null && this._isDBOpen) {
      try {
        // save the database to store
        await setDBToStore(this.mDb, this.dbName, this.store);
      } catch (err) {
        return Promise.reject(`in saveToStore ${err}`);
      }
    }
    return Promise.resolve();
  }
  public async getVersion(): Promise<number> {
    if (this.mDb != null && this._isDBOpen) {
      try {
        // save the database to store
        const curVersion: number = await getVersion(this.mDb)
        return Promise.resolve(curVersion);
      } catch (err) {
        this._isDBOpen = false;
        return Promise.reject(`in getVersion ${err}`);
      }
    }
  }

  public async isDBExists(database: string): Promise<boolean> {
    try {
      const isExists: boolean = await isDBInStore(database, this.store);
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
        await removeDBFromStore(database, this.store);
      }
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(new Error(`DeleteDB: ${err.message}`));
    }

  }
  public async executeSQL(sql: string, transaction: boolean = true): Promise<number> {
    if (!this._isDBOpen) {
      let msg = `ExecuteSQL: Database ${this.dbName} `;
      msg += `not opened`;
      return Promise.reject(new Error(msg));
    }
    try {
      if(transaction) await beginTransaction(this.mDb, this._isDBOpen);
      const changes = await execute(this.mDb, sql, false);
      if (changes < 0) {
        return Promise.reject(new Error('ExecuteSQL: changes < 0'));
      }
      if(transaction) await commitTransaction(this.mDb, this._isDBOpen);
      if( this.autoSave ) {
        try {
          await setDBToStore(this.mDb, this.dbName, this.store);
        } catch (err) {
          this._isDBOpen = false;
          return Promise.reject(`in close ${err}`);
        }
      }
      return Promise.resolve(changes);
    } catch (err) {
      let msg = `ExecuteSQL: ${err.message}`;
      try {
        if(transaction) await rollbackTransaction(this.mDb, this._isDBOpen);
      } catch (err) {
        msg += ` : ${err.message}`;
      }
      return Promise.reject(new Error(`ExecuteSQL: ${msg}`));
    }
  }
  public async execSet(set: SQLiteSet[], transaction: boolean = true): Promise<any> {
    if (!this._isDBOpen) {
      let msg = `ExecSet: Database ${this.dbName} `;
      msg += `not opened`;
      return Promise.reject(new Error(msg));
    }
    const retRes: any = { changes: -1, lastId: -1 };
    let initChanges = -1;
    try {
      initChanges = await dbChanges(this.mDb);
      if(transaction) await beginTransaction(this.mDb, this._isDBOpen);
      const lastId = await executeSet(this.mDb, set, false);
      if (lastId < 0) {
        return Promise.reject(new Error('ExecSet: changes < 0'));
      }
      if(transaction) await commitTransaction(this.mDb, this._isDBOpen);
      const changes = (await dbChanges(this.mDb)) - initChanges;
      retRes.changes = changes;
      retRes.lastId = lastId;
      if( this.autoSave ) {
        try {
          await setDBToStore(this.mDb, this.dbName, this.store);
        } catch (err) {
          this._isDBOpen = false;
          return Promise.reject(`in close ${err}`);
        }
      }
      return Promise.resolve(retRes);
    } catch (err) {
      let msg = `ExecSet: ${err.message}`;
      try {
        if(transaction) await rollbackTransaction(this.mDb, this._isDBOpen);
      } catch (err) {
        msg += ` : ${err.message}`;
      }
      return Promise.reject(new Error(`ExecSet: ${msg}`));
    }
  }
  public async selectSQL(sql: string, values: string[]): Promise<any[]> {
    if (!this._isDBOpen) {
      let msg = `SelectSQL: Database ${this.dbName} `;
      msg += `not opened`;
      return Promise.reject(new Error(msg));
    }
    try {
      let retArr: any[] = await queryAll(this.mDb, sql, values);
      return Promise.resolve(retArr);
    } catch (err) {
      return Promise.reject(new Error(`SelectSQL: ${err.message}`));
    }
  }
  public async runSQL(statement: string, values: any[], transaction: boolean = true): Promise<any> {
    if (!this._isDBOpen) {
      let msg = `RunSQL: Database ${this.dbName} `;
      msg += `not opened`;
      return Promise.reject(new Error(msg));
    }
    const retRes: any = { changes: -1, lastId: -1 };
    let initChanges = -1;
    try {
      initChanges = await dbChanges(this.mDb);
      if(transaction) await beginTransaction(this.mDb, this._isDBOpen);
      const lastId = await run(this.mDb, statement, values, false);
      if (lastId < 0) {
        return Promise.reject(new Error('RunSQL: lastId < 0'));
      }
      if(transaction) await commitTransaction(this.mDb, this._isDBOpen);
      const changes = (await dbChanges(this.mDb)) - initChanges;
      retRes.changes = changes;
      retRes.lastId = lastId;
      if( this.autoSave ) {
        try {
          await setDBToStore(this.mDb, this.dbName, this.store);
        } catch (err) {
          this._isDBOpen = false;
          return Promise.reject(`in close ${err}`);
        }
      }
      return Promise.resolve(retRes);
    } catch (err) {
      let msg = `RunSQL: ${err.message}`;
      try {
        if(transaction) await rollbackTransaction(this.mDb, this._isDBOpen);
      } catch (err) {
        msg += ` : ${err.message}`;
      }
      return Promise.reject(new Error(`RunSQL: ${msg}`));
    }
  }
  async getTableNames(): Promise<any[]> {
    if (!this._isDBOpen) {
      let msg = `GetTableNames: Database ${this.dbName} `;
      msg += `not opened`;
      return Promise.reject(new Error(msg));
    }
    try {
      let retArr: any[] = await getTableList(this.mDb);
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
      const retB = await isTableExists(this.mDb, tableName);
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
      const retB = await isTableExists(this.mDb, 'sync_table');
      if(!retB) {
        const isLastMod = await isLastModified(this.mDb, this._isDBOpen);
        const isDel = await isSqlDeleted(this.mDb, this._isDBOpen);
        if(isLastMod && isDel) {
          const date: number = Math.round(new Date().getTime() / 1000);
          let stmts = `
                          CREATE TABLE IF NOT EXISTS sync_table (
                              id INTEGER PRIMARY KEY NOT NULL,
                              sync_date INTEGER
                              );`;
          stmts += `INSERT INTO sync_table (sync_date) VALUES (
                              "${date}");`;
          changes = await execute(this.mDb, stmts, false);
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
      const isTable = await isTableExists(this.mDb, 'sync_table');
      if(!isTable) {
        return Promise.reject(new Error('No sync_table available'));
      }
      const res = await getSynchroDate(this.mDb);
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
      const isTable = await isTableExists(this.mDb, 'sync_table');
      if(!isTable) {
        return Promise.reject(new Error('No sync_table available'));
      }
      const sDate: number = Math.round(new Date(syncDate).getTime() / 1000);
      let stmt = `UPDATE sync_table SET sync_date = `;
      stmt += `${sDate} WHERE id = 1;`;
      const changes: number = await execute(this.mDb, stmt, false);
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
        await setForeignKeyConstraintsEnabled(this.mDb, false);

        if (jsonData.tables && jsonData.tables.length > 0) {

          // create the database schema
          changes = await createDatabaseSchema(this.mDb, jsonData);
          let msg = `Schema creation completed changes: ${changes}`;
          importProgress.emit({progress:msg});

          if (changes != -1) {
            // create the tables data
            changes += await createTablesData(this.mDb, jsonData, importProgress);
            let msg = `Tables data creation completed changes: ${changes}`;
            importProgress.emit({progress:msg});
          }
        }
        if (jsonData.views && jsonData.views.length > 0) {
          // create the views
          changes += await createViews(this.mDb, jsonData);
        }
        // set Foreign Keys On
        await setForeignKeyConstraintsEnabled(this.mDb, true);

//        if( this.autoSave ) {
//          try {
            await setDBToStore(this.mDb, this.dbName, this.store);
//          } catch (err) {
//            this._isDBOpen = false;
//            return Promise.reject(`in close ${err}`);
//          }
//        }

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
        const isTable = await isTableExists(this.mDb, 'sync_table');
        if(isTable) {
          await setLastExportDate(this.mDb, (new Date()).toISOString());
        }
        const retJson: JsonSQLite = await createExportObject(this.mDb, inJson, exportProgress);
        const keys = Object.keys(retJson);
        if(keys.length === 0) {
          const msg = `ExportJson: return Object is empty `+
                      `No data to synchronize`;
          return Promise.reject(new Error(msg));
        }
        const isValid = isJsonSQLite(retJson);
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
        await delExportedRows(this.mDb);
        return Promise.resolve();
      } catch (err) {
        return Promise.reject(new Error(`deleteExportedRows: ${err.message}`));
      }
    } else {
      return Promise.reject(new Error(`deleteExportedRows: database is closed`));
    }

  }
}
