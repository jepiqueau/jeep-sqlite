import { Component, Method } from '@stencil/core';
import { Database } from '../../utils/database';
import localForage from 'localforage';
import { ConnectionOptions, SQLiteOptions, SQLiteExecuteOptions, SQLiteQueryOptions,
         SQLiteRunOptions, SQLiteSetOptions, SQLiteSet,
         EchoResult, SQLiteChanges, SQLiteResult, SQLiteValues } from '../../interfaces/interfaces';

@Component({
  tag: 'jeep-sqlite',
  styleUrl: 'jeep-sqlite.css',
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
    console.log(`in createConnection database ${dbName}`);
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
      console.log(`in method isDBOpen ${ret}`);
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

  private store: LocalForage;
  private storeName: string;
  private isStore: boolean = false;
  private _dbDict: any = {};

  //*******************************
  //* Component Lifecycle Methods *
  //*******************************

  async componentWillLoad() {
    this.isStore = await this.openStore("jeepSqliteStore","databases");
    console.log(`&&& isStore ${this.isStore}`);
  }

  //******************************
  //* Private Method Definitions *
  //******************************

  private async _createConnection(database: string, version: number): Promise<void> {
    console.log(`in _createConnection ${database}`);
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
      const ret: boolean = mDB.isDBOpen(database + 'SQLite.db');
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
  render() {
    return ;
  }
}
