import initSqlJs from 'sql.js';

import { getDBFromStore, setInitialDBToStore, setDBToStore,
         removeDBFromStore, isDBInStore } from './utils-store';
import { dbChanges, beginTransaction, rollbackTransaction, commitTransaction,
         execute, run, queryAll } from './utils-sqlite';
export class Database {
  private _isDBOpen: boolean;
  private dbName: string;
  private store: any;
  private version: number;
  private mDb: any;

  constructor(databaseName: string, version: number, store: LocalForage) {
    this.dbName = databaseName;
    this.store = store;
    this.version = version;
    this.mDb = null;
    this._isDBOpen = false;
  }
  public async open(): Promise<void> {
    console.log(`&&& in open database ${this.dbName} version ${this.version}`);
    try {
      const SQL = await initSqlJs({
        locateFile: file => `src/assets/${file}`
      });
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
      this._isDBOpen = true;
      console.log(`isDBOpen: ${this._isDBOpen}`);
      return Promise.resolve();
    } catch (err) {
      this._isDBOpen = false;
      return Promise.reject(`in open ${err}`);
    }
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
      const changes = await execute(this.mDb, sql);
      if (changes < 0) {
        return Promise.reject(new Error('ExecuteSQL: changes < 0'));
      }
      if(transaction) await commitTransaction(this.mDb, this._isDBOpen);
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
      const lastId = await run(this.mDb, statement, values);
      if (lastId < 0) {
        return Promise.reject(new Error('RunSQL: lastId < 0'));
      }
      if(transaction) await commitTransaction(this.mDb, this._isDBOpen);
      const changes = (await dbChanges(this.mDb)) - initChanges;
      retRes.changes = changes;
      retRes.lastId = lastId;
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


}
