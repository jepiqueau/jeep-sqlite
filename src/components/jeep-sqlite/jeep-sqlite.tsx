import { Component, Method } from '@stencil/core';
import { Database } from '../../utils/database';
import localForage from 'localforage';
import { ConnectionOptions, SQLiteOptions, SQLiteExecuteOptions, SQLiteQueryOptions,
         SQLiteRunOptions, SQLiteSetOptions, SQLiteSet, SQLiteTableOptions,
         SQLiteSyncDateOptions, SQLiteImportOptions, SQLiteExportOptions, JsonSQLite,
         EchoResult, SQLiteChanges, SQLiteResult, SQLiteValues, SQLiteSyncDate,
         SQLiteJson } from '../../interfaces/interfaces';
import { isJsonSQLite } from '../../utils/utils-json';
import { saveDBToStore } from '../../utils/utils-store';

@Component({
  tag: 'jeep-sqlite',
  styleUrl: 'jeep-sqlite.css',
  assetsDirs: ['assets'],
  shadow: true,
})
export class JeepSqlite {

  //**********************
  //* Method Definitions *
  //**********************

  @Method()
  async echo(value: string): Promise<EchoResult> {
    return {value: value};
  }
  @Method()
  async createConnection(options: ConnectionOptions): Promise<void> {
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    const version: number = options.version ? options.version : 1;
    try {
      await this._createConnection(dbName, version);
      return Promise.resolve();
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async closeConnection(options: SQLiteOptions): Promise<void> {
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    try {
      await this._closeConnection(dbName);
      return Promise.resolve();
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async open(options: SQLiteOptions): Promise<void> {
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    try {
      await this._open(dbName);
      return Promise.resolve();
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async close(options: SQLiteOptions): Promise<void> {
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    try {
      await this._close(dbName);
      return Promise.resolve();
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async execute(options: SQLiteExecuteOptions): Promise<SQLiteChanges> {
    let keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    if (!keys.includes('statements') || options.statements.length === 0) {
      return Promise.reject('Must provide raw SQL statements');
    }
    const dbName: string = options.database;
    const statements: string = options.statements;
    let transaction: boolean= true;
    if (keys.includes('transaction')) transaction = options.transaction;
    try {
      const changes: SQLiteChanges = await this._execute(dbName, statements, transaction);
      return Promise.resolve(changes);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async executeSet(options: SQLiteSetOptions): Promise<SQLiteChanges> {
    let keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    if (!keys.includes('set') || options.set.length === 0) {
      return Promise.reject('Must provide a non-empty set of SQL statements');
    }
    const dbName: string = options.database;
    const setOfStatements: SQLiteSet[] = options.set;
    let transaction: boolean= true;
    if (keys.includes('transaction')) transaction = options.transaction;
    try {
      const changes: SQLiteChanges = await this._executeSet(dbName, setOfStatements, transaction);
      return Promise.resolve(changes);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async run(options: SQLiteRunOptions): Promise<SQLiteChanges> {
    let keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    if (!keys.includes('statement') || options.statement.length === 0) {
      return Promise.reject('Must provide a run statement');
    }
    const dbName: string = options.database;
    const statement: string = options.statement;
    let values: string[]  = [];
    if (keys.includes('values')) {
      values = options.values.length > 0 ? options.values : [];
    }
    let transaction: boolean= true;
    if (keys.includes('transaction')) transaction = options.transaction;
    try {
      const retChanges:  SQLiteChanges = await this._run(dbName, statement, values, transaction);
      return Promise.resolve(retChanges);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async query(options: SQLiteQueryOptions): Promise<SQLiteValues> {
    let keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    if (!keys.includes('statement') || options.statement.length === 0) {
      return Promise.reject('Must provide a query statement');
    }
    let values: string[]  = [];
    if (keys.includes('values')) {
      values = options.values.length > 0 ? options.values : [];
    }
    const dbName: string = options.database;
    const statement: string = options.statement;
    try {
      const retValues = await this._query(dbName, statement, values);
      return Promise.resolve(retValues);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async isDBExists(options: SQLiteOptions): Promise<SQLiteResult> {
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    try {
      const ret: SQLiteResult = await this._isDBExists(dbName);
      return Promise.resolve(ret);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async isDBOpen(options: SQLiteOptions): Promise<SQLiteResult> {
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    try {
      const ret: SQLiteResult = await this._isDBOpen(dbName);
      return Promise.resolve(ret);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async deleteDatabase(options: SQLiteOptions): Promise<void> {
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    try {
      return await this._deleteDatabase(dbName);
    }
    catch (err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async isStoreOpen(): Promise<boolean> {
    return Promise.resolve(this.isStore);
  }
  @Method()
  async copyFromAssets(): Promise<void> {
    try {
      await this._copyFromAssets();
      return Promise.resolve();
    }
    catch (err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async isTableExists(options: SQLiteTableOptions): Promise<SQLiteResult> {
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    if (!keys.includes('table')) {
      return Promise.reject('Must provide a table name');
    }
    const tableName: string = options.table;
    try {
      const ret: SQLiteResult = await this._isTableExists(dbName, tableName);
      return Promise.resolve(ret);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async createSyncTable(options: SQLiteOptions): Promise<SQLiteChanges> {
    let keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    try {
      const ret: SQLiteChanges = await this._createSyncTable(dbName);
      return Promise.resolve(ret);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async getSyncDate(options: SQLiteSyncDateOptions): Promise<SQLiteSyncDate> {
    let keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    try {
      const ret: SQLiteSyncDate = await this._getSyncDate(dbName);
      return Promise.resolve(ret);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async setSyncDate(options: SQLiteSyncDateOptions): Promise<void> {
    let keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    if (!keys.includes('syncdate')) {
      return Promise.reject('Must provide a synchronization date');
    }
    const dbName: string = options.database;
    const syncDate: string = options.syncdate;
    try {
      await this._setSyncDate(dbName, syncDate);
      return Promise.resolve();
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async isJsonValid(options: SQLiteImportOptions): Promise<SQLiteResult> {
    const keys = Object.keys(options);
    if (!keys.includes('jsonstring')) {
      return Promise.reject('Must provide a json object');
    }
    const jsonStrObj: string = options.jsonstring;
    try {
      const ret = await this._isJsonValid(jsonStrObj);
      return Promise.resolve(ret);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async importFromJson(options: SQLiteImportOptions): Promise<SQLiteChanges> {
    const keys = Object.keys(options);
    if (!keys.includes('jsonstring')) {
      return Promise.reject('Must provide a json object');
    }
    const jsonStrObj: string = options.jsonstring;
    try {
      const ret = await this._importFromJson(jsonStrObj);
      return Promise.resolve(ret);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async exportToJson(options: SQLiteExportOptions): Promise<SQLiteJson> {
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    if (!keys.includes('jsonexportmode')) {
      return Promise.reject('Must provide a json export mode');
    }
    const dbName: string = options.database;
    const exportMode: string = options.jsonexportmode;
    try {
      const ret = await this._exportToJson(dbName, exportMode);
      return Promise.resolve(ret);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  //********************************
  //* Component Internal Variables *
  //********************************

  private store: LocalForage;
  private storeName: string;
  private isStore: boolean = false;
  private _dbDict: any = {};
  private databaseList: any;


  //*******************************
  //* Component Lifecycle Methods *
  //*******************************

  async componentWillLoad() {
    this.isStore = await this.openStore("jeepSqliteStore","databases");
    const res = await this.loadJSON('assets/databases/databases.json');
    this.databaseList = JSON.parse(res).databaseList;
  }
  componentDidLoad() {
  }

  //******************************
  //* Private Method Definitions *
  //******************************

  private async _createConnection(database: string, version: number): Promise<void> {
    try {
      const mDB: Database = new Database(database + 'SQLite.db', version, this.store);
      this._dbDict[database] = mDB;
      return Promise.resolve();
    } catch(err) {
      return Promise.reject(err.message);
    }
  }
  private async _closeConnection(database: string): Promise<void> {
    const keys = Object.keys(this._dbDict);
    if (!keys.includes(database)) {
      return Promise.reject(`CloseConnection: No available connection for ${database}`);
    }

    const mDB = this._dbDict[database];
    try {
      if (mDB.isDBOpen()) {
        // close the database
        try {
          await mDB.close();
        } catch (err) {
          return Promise.reject(
            `CloseConnection: close ${database} failed ${err}`);
        }
      }
      // remove the connection from dictionary
      delete this._dbDict[database];
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(`CloseConnection: ${err.message}`);
    }

  }
  private async _open(database: string): Promise<void> {
    const keys = Object.keys(this._dbDict);
    if (!keys.includes(database)) {
      return Promise.reject(`Open: No available connection for ${database}`);
    }

    const mDB = this._dbDict[database];
    try {
      await mDB.open();
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(`Open: ${err.message}`);
    }
  }
  private async _close(database: string): Promise<void> {
    const keys = Object.keys(this._dbDict);
    if (!keys.includes(database)) {
      return Promise.reject(`Close: No available connection for ${database}`);
    }

    const mDB = this._dbDict[database];
    try {
      await mDB.close();
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(`Close: ${err.message}`);
    }
  }
  private async _execute(database:string, statements: string, transaction: boolean): Promise<SQLiteChanges> {
    const keys = Object.keys(this._dbDict);
    if (!keys.includes(database)) {
      return Promise.reject(`Execute: No available connection for ${database}`);
    }

    const mDB = this._dbDict[database];
    try {
      const ret: number = await mDB.executeSQL(statements, transaction);
      const changes: SQLiteChanges = {changes: {changes: ret}};
      return Promise.resolve(changes);
    } catch (err) {
      return Promise.reject(`Execute: ${err.message}`);
    }
  }
  private async _executeSet(database:string, setOfStatements: SQLiteSet[], transaction: boolean): Promise<SQLiteChanges> {
    const keys = Object.keys(this._dbDict);
    if (!keys.includes(database)) {
      return Promise.reject(`ExecuteSet: No available connection for ${database}`);
    }

    const mDB = this._dbDict[database];
    for (const sStmt of setOfStatements) {
      if (!('statement' in sStmt) || !('values' in sStmt)) {
        return Promise.reject(
          'ExecuteSet: Must provide a set as ' + 'Array of {statement,values}',
        );
      }
    }
    try {
      const ret: any = await mDB.execSet(setOfStatements, transaction);
      const changes: SQLiteChanges = {changes: {changes: ret.changes, lastId: ret.lastId}};
      return Promise.resolve(changes);
    } catch (err) {
      return Promise.reject(`ExecuteSet: ${err.message}`);
    }
  }
    private async _run(database: string, statement: string, values: any[], transaction: boolean): Promise<SQLiteChanges> {
    const keys = Object.keys(this._dbDict);
    if (!keys.includes(database)) {
      return Promise.reject(`Run: No available connection for ${database}`);
    }

    const mDB = this._dbDict[database];
    try {
      const ret: any = await mDB.runSQL(statement, values, transaction);
      const changes: SQLiteChanges = {changes: {changes: ret.changes, lastId: ret.lastId}};
      return Promise.resolve(changes);
    } catch (err) {
      return Promise.reject(`Run: ${err.message}`);
    }
  }
  private async _query(database: string, statement: string, values: any[]): Promise<SQLiteValues> {
    const keys = Object.keys(this._dbDict);
    if (!keys.includes(database)) {
      return Promise.reject(`Query: No available connection for ${database}`);
    }
    const mDB = this._dbDict[database];
    let ret: any[] = [];
    try {
      ret = await mDB.selectSQL(statement, values);
      return Promise.resolve({ values: ret });
    } catch (err) {
      return Promise.reject(`Query failed: ${err.message}`);
    }
  }
  private async _isDBExists(database:string,): Promise<SQLiteResult> {
    const keys = Object.keys(this._dbDict);
    if (!keys.includes(database)) {
      return Promise.reject(`IsDBExists: No available connection for ${database}`);
    }

    const mDB = this._dbDict[database];
    try {
      const ret: boolean = await mDB.isDBExists(database + 'SQLite.db');
      const result: SQLiteResult = {result: ret};
      return Promise.resolve(result);
    } catch (err) {
      return Promise.reject(`IsDBExists: ${err.message}`);
    }

  }
  private async _isDBOpen(database:string,): Promise<SQLiteResult> {
    const keys = Object.keys(this._dbDict);
    if (!keys.includes(database)) {
      return Promise.reject(`IsDBOpen: No available connection for ${database}`);
    }

    const mDB = this._dbDict[database];
    try {
      const ret: boolean = await mDB.isDBOpen(database + 'SQLite.db');
      const result = {result: ret};
      return Promise.resolve(result);
    } catch (err) {
      return Promise.reject(`IsDBOpen: ${err.message}`);
    }
  }
  private async _deleteDatabase(database: string): Promise<void> {
    const keys = Object.keys(this._dbDict);
    if (!keys.includes(database)) {
      return Promise.reject(`DeleteDatabase: No available connection for ${database}`);
    }

    const mDB = this._dbDict[database];
    try {
      await mDB.deleteDB(database + 'SQLite.db');
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(`DeleteDatabase: ${err.message}`);
    }
  }
  private async _isTableExists(database: string, table: string): Promise<SQLiteResult> {
    const keys = Object.keys(this._dbDict);
    if (!keys.includes(database)) {
      return Promise.reject(`IsTableExists: No available connection for ${database}`);
    }

    const mDB = this._dbDict[database];
    try {
      const ret: boolean = await mDB.isTable(table);
      const result = {result: ret};
      return Promise.resolve(result);
    } catch (err) {
      return Promise.reject(`IsTableExists: ${err.message}`);
    }
  }
  private async _createSyncTable(database: string): Promise<SQLiteChanges> {
    const keys = Object.keys(this._dbDict);
    if (!keys.includes(database)) {
      return Promise.reject(
        'CreateSyncTable: No available connection for ' + `${database}`,
      );
    }

    const mDB = this._dbDict[database];
    try {
      const ret: number = await mDB.createSyncTable();
      return Promise.resolve({ changes: { changes: ret } });
    } catch (err) {
      return Promise.reject(`CreateSyncTable: ${err.message}`);
    }
  }
  private async _getSyncDate(database: string): Promise<SQLiteSyncDate>  {
    const keys = Object.keys(this._dbDict);
    if (!keys.includes(database)) {
      return Promise.reject(
        'GetSyncDate: No available connection for ' + `${database}`,
      );
    }

    const mDB = this._dbDict[database];
    try {
      const ret: number = await mDB.getSyncDate();
      return Promise.resolve({syncDate:ret});
    } catch (err) {
      return Promise.reject(`GetSyncDate: ${err.message}`);
    }

  }
  private async _setSyncDate(database: string, syncDate: string): Promise<void> {
    const keys = Object.keys(this._dbDict);
    if (!keys.includes(database)) {
      return Promise.reject(
        'SetSyncDate: No available connection for ' + `${database}`,
      );
    }

    const mDB = this._dbDict[database];
    try {
      const ret = await mDB.setSyncDate(syncDate);
      if(ret.result) {
        return Promise.resolve();
      } else {
        return Promise.reject(`SetSyncDate: ${ret.message}`);
      }
    } catch (err) {
      return Promise.reject(`SetSyncDate: ${err.message}`);
    }

  }
  async _isJsonValid(jsonStrObj: string): Promise<SQLiteResult> {
    const jsonObj = JSON.parse(jsonStrObj);
    const isValid = await isJsonSQLite(jsonObj);
    if (!isValid) {
      return Promise.reject('IsJsonValid: Stringify Json Object not Valid');
    } else {
      return Promise.resolve({ result: true });
    }
  }
  async _importFromJson(jsonStrObj: string): Promise<SQLiteChanges> {
    const jsonObj = JSON.parse(jsonStrObj);
    const isValid = await isJsonSQLite(jsonObj);
    if (!isValid) {
      return Promise.reject('ImportFromJson: Stringify Json Object not Valid');
    }
    const vJsonObj: JsonSQLite = jsonObj;
    const dbName = `${vJsonObj.database}SQLite.db`;
    const dbVersion: number = vJsonObj.version ?? 1;
    // Create the database
    const mDb: Database = new Database(dbName, dbVersion, this.store);
    try {
      // Open the database
      await mDb.open();
      // Import the JsonSQLite Object
      const changes = await mDb.importJson(vJsonObj);
      // Close the database
      await mDb.close();
      return Promise.resolve({ changes: { changes: changes } });
    } catch (err) {
      return Promise.reject(`ImportFromJson: ${err.message}`);
    }
  }
  async _exportToJson(database: string, exportMode: string): Promise<SQLiteJson> {
    const keys = Object.keys(this._dbDict);
    if (!keys.includes(database)) {
      return Promise.reject(
        'ExportToJson: No available connection for ' + `${database}`,
      );
    }
    const mDb = this._dbDict[database];
    try {
      const ret: any = await mDb.exportJson(exportMode);
      const keys = Object.keys(ret);
      if (keys.includes('message')) {
        return Promise.reject(`ExportToJson: ${ret.message}`);
      } else {
        return Promise.resolve({ export: ret });
      }
    } catch (err) {
      return Promise.reject(`ExportToJson: ${err.message}`);
    }

  }
  async _copyFromAssets(): Promise<void> {
    try {
      for( const dbName of this.databaseList) {
        await this.copyDatabase(`assets/databases/${dbName}`);
      }
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(`CopyFromAssets: ${err.message}`);
    }
  }
  private async copyDatabase(dbAssetName: string): Promise<void> {
    return new Promise ((resolve,reject) => {
      var xhr = new XMLHttpRequest();
      var uInt8Array: Uint8Array;
      xhr.open('GET', dbAssetName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onerror = () => {
        reject(`CopyDatabase: failed`);
      }
      xhr.onload =  () => {
          uInt8Array = new Uint8Array(xhr.response);
      };
      xhr.onloadend= async () => {
        const dbName = this.setPathSuffix(dbAssetName);
        await saveDBToStore(dbName, uInt8Array, this.store);
        resolve();
      };
      xhr.send();
    });
  }
  private async loadJSON(jsonFileName: string): Promise<string> {
    return new Promise ((resolve,reject) => {
      var xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
      xobj.open('GET', jsonFileName, true);
      xobj.onerror = () => {
        reject(`LoadJSON: failed`);
      }

      xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == 200) {
        // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
        resolve(xobj.responseText);
        }
      };
      xobj.send(null);
    });
  }
  private async openStore(dbName: string, tableName: string): Promise<boolean> {
    let ret = false;
    const config: any = this.setConfig(dbName, tableName);
    this.store = localForage.createInstance(config);
    if (this.store != null) {
      this.storeName = dbName;
      console.log(`this.storeName ${JSON.stringify(this.storeName)}`);
      ret = true;
    }
    return ret;
  }

  private setConfig(dbName: string, tableName: string): any {
    const config: any = {
      name: dbName,
      storeName: tableName,
      driver: [localForage.INDEXEDDB],
      version: 1,
    };
    return config;
  }
  private setPathSuffix(db: string): string {
    let toDb: string = db.slice(db.lastIndexOf("/") + 1);
    if (db.length > 9) {
      const last9: string = db.slice(-9);
      if (last9 != 'SQLite.db') {
        toDb = db.slice(db.lastIndexOf("/") + 1, -3) + 'SQLite.db';
      }
    } else {
      toDb = toDb + 'SQLite.db';
    }
    return toDb;
  }
  render() {
    return ;
  }
}
