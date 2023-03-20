import { Component, Method, Event, EventEmitter, Prop, State, Watch, Element } from '@stencil/core';
import { Database } from '../../utils/database';
import localForage from 'localforage';
import { EchoOptions, ConnectionOptions, SQLiteOptions, SQLiteExecuteOptions, SQLiteQueryOptions,
         SQLiteRunOptions, SQLiteSetOptions, SQLiteSet, SQLiteTableOptions,
         SQLiteSyncDateOptions, SQLiteImportOptions, SQLiteExportOptions, JsonSQLite,
         SQLiteUpgradeOptions, SQLiteVersionUpgrade, AllConnectionsOptions,
         EchoResult, SQLiteChanges,SQLiteResult, SQLiteValues, SQLiteSyncDate,
         SQLiteJson, JsonProgressListener, SQLiteVersion,  SQLiteFromAssetsOptions,
         SQLiteHTTPOptions, HTTPRequestEndedListener, PickOrSaveDatabaseEndedListener,
         SQLiteLocalDiskOptions, ButtonOptions } from '../../interfaces/interfaces';
import { isJsonSQLite } from '../../utils/utils-json';
import { saveDBToStore, isDBInStore, getDBListFromStore, removeDBFromStore } from '../../utils/utils-store';
import * as JSZip from 'jszip';
import { fileOpen, fileSave, supported } from 'browser-fs-access';

@Component({
  tag: 'jeep-sqlite',
  styleUrl: 'jeep-sqlite.css',
  assetsDirs: ['assets'],
  shadow: true,
})
export class JeepSqlite {

 @Element()  el!: HTMLJeepSqliteElement;
  //************************
  //* Property Definitions *
  //************************

  /**
   * AutoSave
   */
  @Prop({
    attribute: "autosave",
    reflect: true
  }) autoSave: boolean = false;
  /**
   * WasmPath
   */
   @Prop({
    attribute: "wasmpath",
    reflect: true
  }) wasmPath: string;
  /**
   * Pick Button Text
   */
  @Prop({
    attribute: "picktext",
    reflect: true
  }) pickText: string;
  /**
   * Save Button Text
   */
  @Prop({
    attribute: "savetext",
    reflect: true
  }) saveText: string;
  /**
   * Button Options
   */
  @Prop({
    attribute: "buttonoptions",
    reflect: true
  }) buttonOptions: string;

  //*********************
  //* State Definitions *
  //*********************

  @State() innerAutoSave: boolean;
  @State() innerWasmPath: string;
  @State() innerPickText: string;
  @State() innerSaveText: string;
  @State() innerButtonOptions: ButtonOptions

  //*****************************
  //* Watch on Property Changes *
  //*****************************

  @Watch('autoSave')
  parseAutoSave(newValue: boolean) {
    this.innerAutoSave = newValue;
  }
  @Watch('wasmPath')
  parseWasmPath(newValue: string) {
    this.innerWasmPath = newValue;
  }
  @Watch('pickText')
  parsePickText(newValue: string) {
    this.innerPickText = newValue;
  }
  @Watch('saveText')
  parseSaveText(newValue: string) {
    this.innerSaveText = newValue;
  }
  @Watch('buttonOptions')
  parseButtonOptions(newValue: string) {
    this.innerButtonOptions = JSON.parse(newValue);
    console.log(`innerButtonOptions: ${JSON.stringify(this.innerButtonOptions)}`)
    const keys = Object.keys(this.innerButtonOptions);
    for (const key of keys) {
      switch(key) {
        case "top": {
          this.el.style.setProperty('--jeep-sqlite-top',this.innerButtonOptions[key]);
          break;
        }
        case "right": {
          this.el.style.setProperty('--jeep-sqlite-right',this.innerButtonOptions[key]);
          break;
        }
        case "fontSize": {
          this.el.style.setProperty('--jeep-sqlite-font-size',this.innerButtonOptions[key]);
          break;
        }
        case "padding": {
          this.el.style.setProperty('--jeep-sqlite-padding',this.innerButtonOptions[key]);
          break;
        }
        case "backgroundColor": {
          this.el.style.setProperty('--jeep-sqlite-background-color',this.innerButtonOptions[key]);
          break;
        }
        case "color": {
          this.el.style.setProperty('--jeep-sqlite-color',this.innerButtonOptions[key]);
          break;
        }
      }
    }
  }

  //*********************
  //* Event Definitions *
  //*********************

  @Event({eventName:'jeepSqliteImportProgress',
      composed: true,
      cancelable: true,
      bubbles: true,
  }) importProgress: EventEmitter<JsonProgressListener>;
  @Event({eventName:'jeepSqliteExportProgress',
      composed: true,
      cancelable: true,
      bubbles: true,
  }) exportProgress: EventEmitter<JsonProgressListener>;
  @Event({eventName:'jeepSqliteHTTPRequestEnded',
      composed: true,
      cancelable: true,
      bubbles: true,
  }) HTTPRequestEnded: EventEmitter<HTTPRequestEndedListener>;
  @Event({eventName:'jeepSqlitePickDatabaseEnded',
      composed: true,
      cancelable: true,
      bubbles: true,
  }) PickDatabaseEnded: EventEmitter<PickOrSaveDatabaseEndedListener >;
  @Event({eventName:'jeepSqliteSaveDatabaseToDisk',
      composed: true,
      cancelable: true,
      bubbles: true,
  }) SaveDatabaseEnded: EventEmitter<PickOrSaveDatabaseEndedListener >;

  //**********************
  //* Method Definitions *
  //**********************

  @Method()
  async echo(options: EchoOptions): Promise<EchoResult> {
    return options;
  }
  @Method()
  async createConnection(options: ConnectionOptions): Promise<void> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    const version: number = options.version ? options.version : 1;
    const readonly: boolean = options.readonly ? options.readonly : false;
    try {
      await this._createConnection(dbName, version, readonly);
      return Promise.resolve();
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async isConnection(options: SQLiteOptions): Promise<SQLiteResult> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    const readonly: boolean = options.readonly ? options.readonly : false;
    const ret: SQLiteResult = await this._isConnection(dbName, readonly);
    return Promise.resolve(ret);
  }
  @Method()
  async closeConnection(options: SQLiteOptions): Promise<void> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    const readonly: boolean = options.readonly ? options.readonly : false;
    try {
      await this._closeConnection(dbName, readonly);
      return Promise.resolve();
    } catch(err) {
      return Promise.reject(err);
    }
  }

@Method()
  async open(options: SQLiteOptions): Promise<void> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    const readonly: boolean = options.readonly ? options.readonly : false;
    try {
      await this._open(dbName, readonly);
      return Promise.resolve();
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async close(options: SQLiteOptions): Promise<void> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    const readonly: boolean = options.readonly ? options.readonly : false;
    try {
      await this._close(dbName, readonly);
      return Promise.resolve();
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async getVersion(options: SQLiteOptions): Promise<SQLiteVersion> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    const readonly: boolean = options.readonly ? options.readonly : false;
    try {
      const res: SQLiteVersion = await this._getVersion(dbName, readonly);
      return Promise.resolve(res);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async execute(options: SQLiteExecuteOptions): Promise<SQLiteChanges> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
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
    const readonly: boolean = options.readonly ? options.readonly : false;
    if (keys.includes('transaction')) transaction = options.transaction;
    try {
      const changes: SQLiteChanges = await this._execute(dbName, statements, transaction, readonly);
      return Promise.resolve(changes);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async executeSet(options: SQLiteSetOptions): Promise<SQLiteChanges> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
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
    const readonly: boolean = options.readonly ? options.readonly : false;
    try {
      const changes: SQLiteChanges = await this._executeSet(dbName, setOfStatements, transaction, readonly);
      return Promise.resolve(changes);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async run(options: SQLiteRunOptions): Promise<SQLiteChanges> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    let keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    if (!keys.includes('statement') || options.statement.length === 0) {
      return Promise.reject('Must provide a run statement');
    }
    const dbName: string = options.database;
    const statement: string = options.statement;
    let values: any[]  = [];
    if (keys.includes('values')) {
      values = options.values.length > 0 ? options.values : [];
    }
    let transaction: boolean= true;
    if (keys.includes('transaction')) transaction = options.transaction;
    const readonly: boolean = options.readonly ? options.readonly : false;
    try {
      const retChanges:  SQLiteChanges = await this._run(dbName, statement, values, transaction, readonly);
      return Promise.resolve(retChanges);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async query(options: SQLiteQueryOptions): Promise<SQLiteValues> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    let keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    if (!keys.includes('statement') || options.statement.length === 0) {
      return Promise.reject('Must provide a query statement');
    }
    let values: any[]  = [];
    if (keys.includes('values')) {
      values = options.values.length > 0 ? options.values : [];
    }
    const dbName: string = options.database;
    const statement: string = options.statement;
    const readonly: boolean = options.readonly ? options.readonly : false;
    try {
      const retValues = await this._query(dbName, statement, values, readonly);
      return Promise.resolve(retValues);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async getTableList(options: SQLiteOptions): Promise<SQLiteValues> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    let keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    const readonly: boolean = options.readonly ? options.readonly : false;
    try {
      const retValues = await this._getTableList(dbName, readonly);
      return Promise.resolve(retValues);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async isDBExists(options: SQLiteOptions): Promise<SQLiteResult> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    const readonly: boolean = options.readonly ? options.readonly : false;
    try {
      const ret: SQLiteResult = await this._isDBExists(dbName, readonly);
      return Promise.resolve(ret);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async isDBOpen(options: SQLiteOptions): Promise<SQLiteResult> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    const readonly: boolean = options.readonly ? options.readonly : false;
    try {
      const ret: SQLiteResult = await this._isDBOpen(dbName, readonly);
      return Promise.resolve(ret);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async deleteDatabase(options: SQLiteOptions): Promise<void> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    const readonly: boolean = options.readonly ? options.readonly : false;
    try {
      return await this._deleteDatabase(dbName, readonly);
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
  async copyFromAssets(options: SQLiteFromAssetsOptions): Promise<void> {
    let overwrite: boolean;
    if(options != null) {
      const keys = Object.keys(options);
      overwrite = keys.includes('overwrite') ? options.overwrite : true;
    } else {
      overwrite = true;
    }
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    try {
      await this._copyFromAssets(overwrite);
      return Promise.resolve();
    }
    catch (err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async isTableExists(options: SQLiteTableOptions): Promise<SQLiteResult> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    if (!keys.includes('table')) {
      return Promise.reject('Must provide a table name');
    }
    const tableName: string = options.table;
    const readonly: boolean = options.readonly ? options.readonly : false;
    try {
      const ret: SQLiteResult = await this._isTableExists(dbName, tableName, readonly);
      return Promise.resolve(ret);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async createSyncTable(options: SQLiteOptions): Promise<SQLiteChanges> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    let keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    const readonly: boolean = options.readonly ? options.readonly : false;
    try {
      const ret: SQLiteChanges = await this._createSyncTable(dbName, readonly);
      return Promise.resolve(ret);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async getSyncDate(options: SQLiteSyncDateOptions): Promise<SQLiteSyncDate> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    let keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    const readonly: boolean = options.readonly ? options.readonly : false;
    try {
      const ret: SQLiteSyncDate = await this._getSyncDate(dbName, readonly);
      return Promise.resolve(ret);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async setSyncDate(options: SQLiteSyncDateOptions): Promise<void> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    let keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    if (!keys.includes('syncdate')) {
      return Promise.reject('Must provide a synchronization date');
    }
    const dbName: string = options.database;
    const syncDate: string = options.syncdate;
    const readonly: boolean = options.readonly ? options.readonly : false;
    try {
      await this._setSyncDate(dbName, syncDate, readonly);
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
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
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
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    if (!keys.includes('jsonexportmode')) {
      return Promise.reject('Must provide a json export mode');
    }
    const dbName: string = options.database;
    const exportMode: string = options.jsonexportmode;
    const readonly: boolean = options.readonly ? options.readonly : false;
    try {
      const ret = await this._exportToJson(dbName, exportMode, readonly);
      return Promise.resolve(ret);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async deleteExportedRows(options: SQLiteOptions): Promise<void> {
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    const readonly: boolean = options.readonly ? options.readonly : false;
   try {
      await this._deleteExportedRows(dbName, readonly);
      return Promise.resolve();
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async addUpgradeStatement(options: SQLiteUpgradeOptions): Promise<void> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    let keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    if (!keys.includes('upgrade')) {
      return Promise.reject('Must provide an upgrade capSQLiteVersionUpgrade Object');
    }
    const dbName: string = options.database;
    const upgrades: SQLiteVersionUpgrade[] = options.upgrade;
    for(const upgrade of upgrades) {
      const versionUpgradeKeys = Object.keys(upgrade);

      if (
        !versionUpgradeKeys.includes('toVersion') ||
        !versionUpgradeKeys.includes('statements')
      ) {
        return Promise.reject('Must provide an upgrade capSQLiteVersionUpgrade Object');
      }

      if (typeof upgrade.toVersion != 'number') {
        return Promise.reject('upgrade.toVersion must be a number');
      }

      if (this._versionUpgrades[dbName]) {
        this._versionUpgrades[dbName][upgrade.toVersion] = upgrade;
      } else {
        const upgVDict: Record<number, SQLiteVersionUpgrade> = {};
        upgVDict[upgrade.toVersion] = upgrade;
        this._versionUpgrades[dbName] = upgVDict;
      }
    }
    return Promise.resolve();
  }
  @Method()
  async isDatabase(options: SQLiteOptions): Promise<SQLiteResult> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    try {
      const ret: SQLiteResult = await this._isDatabase(dbName);
      return Promise.resolve(ret);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async getDatabaseList(): Promise<SQLiteValues> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    try {
      const ret: SQLiteValues = await this._getDatabaseList();
      return Promise.resolve(ret);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async checkConnectionsConsistency(options: AllConnectionsOptions): Promise<SQLiteResult> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    const keys = Object.keys(options);
    if (!keys.includes('dbNames')) {
      return Promise.reject(`Must provide a list of connection's name`);
    }
    const dbNames: string[] = options.dbNames;
    if (!keys.includes('openModes')) {
      return Promise.reject(`Must provide a list of connection's open mode`);
    }
    const openModes: string[] = options.openModes;
    try {
      const ret = await this._checkConnectionsConsistency(dbNames, openModes);
      return Promise.resolve(ret);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async saveToStore(options: SQLiteOptions): Promise<void> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    const readonly: boolean = options.readonly ? options.readonly : false;
    try {
      await this._saveToStore(dbName, readonly);
      return Promise.resolve();
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async saveToLocalDisk(options: SQLiteOptions): Promise<void> {
    const keys = Object.keys(options);
    if (!keys.includes('database')) {
      return Promise.reject('Must provide a database name');
    }
    const dbName: string = options.database;
    try {
      await this._saveToLocalDisk(dbName);
      return Promise.resolve();
    } catch(err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async getFromLocalDiskToStore(options: SQLiteLocalDiskOptions): Promise<void> {
    const overwrite: boolean = options.overwrite ? options.overwrite : true;
    if (supported) {
      console.log('Using the File System Access API.');
    } else {
      console.log('Using the fallback implementation.');
    }
    try {
      await this._getFromLocalDiskToStore(overwrite);
      return Promise.resolve();
    }
    catch (err) {
      return Promise.reject(err);
    }
  }
  @Method()
  async getFromHTTPRequest(options: SQLiteHTTPOptions): Promise<void> {
    if(!this.isStore) {
      return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened` );
    }
    let keys = Object.keys(options);
    if (!keys.includes('url')) {
      return Promise.reject('Must provide an url');
    }
    const url: string = options.url;
    const overwrite: boolean = options.overwrite ? options.overwrite : true;
    try {
      await this._getFromHTTPRequest(url, overwrite);
      return Promise.resolve();
    }
    catch (err) {
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
  private databaseList: any = {};
  private _versionUpgrades: Record<string, Record<number, SQLiteVersionUpgrade>> = {};
  private _element: any;
  private _blob: Blob;
  private _opts: any;
  private _buttonSaveEl: HTMLButtonElement;
  private _buttonPickEl: HTMLButtonElement;
  private _overwrite: boolean = true;

  //*******************************
  //* Component Lifecycle Methods *
  //*******************************

  async componentWillLoad() {
    this.isStore = await this.openStore("jeepSqliteStore","databases");
    this.parseAutoSave(this.autoSave !== undefined ? this.autoSave : false);
    this.parseWasmPath(this.wasmPath !== undefined ? this.wasmPath : '/assets');
    this.parseSaveText(this.saveText !== undefined ? this.saveText : 'Save');
    this.parsePickText(this.pickText !== undefined ? this.pickText : 'Pick a database');
    if(this.buttonOptions !== undefined) {
      this.parseButtonOptions(this.buttonOptions);
    }
  }
  componentDidLoad() {
    this._element = this.el.shadowRoot;
    if(!this.isStore) {
      console.log('jeep-sqlite isStore = false');
    }
  }

  //******************************
  //* Private Method Definitions *
  //******************************

  private async _createConnection(database: string, version: number,
                                  readonly: boolean): Promise<void> {
    let upgDict: Record<number, SQLiteVersionUpgrade> = {};
    const vUpgKeys: string[] = Object.keys(this._versionUpgrades);
    if (vUpgKeys.length !== 0 && vUpgKeys.includes(database)) {
      upgDict = this._versionUpgrades[database];
    }
    const dbDictKeys = Object.keys(this._dbDict);
    let mDB: Database;
    try {
      if (dbDictKeys.length > 0 && (
              dbDictKeys.includes("RW_" + database) ||
              dbDictKeys.includes("RO_" + database)
          ))
      {
        mDB = dbDictKeys.includes("RW_" + database)  ? this._dbDict["RW_" + database]
                                                     : this._dbDict["RO_" + database];

      } else {
        mDB = new Database(database + 'SQLite.db', version, upgDict,
                           this.store, this.innerAutoSave, this.innerWasmPath);
      }
      const connName = readonly ? "RO_" + database : "RW_" + database;
      this._dbDict[connName] = mDB;
      return Promise.resolve();
    } catch(err) {
      return Promise.reject(err.message);
    }
  }
  private async _isConnection(database: string, readonly: boolean): Promise<SQLiteResult> {
    const keys = Object.keys(this._dbDict);
    const connName = readonly ? "RO_" + database : "RW_" + database;
    if (keys.includes(connName)) {
      return {result: true};
    } else {
      return {result: false};
    }
  }
  private async _closeConnection(database: string, readonly: boolean): Promise<void> {
    const keys = Object.keys(this._dbDict);
    const connName = readonly ? "RO_" + database : "RW_" + database;
    if (!keys.includes(connName)) {
      return Promise.reject(`CloseConnection: No available connection for ${database}`);
    }

    const mDB = this._dbDict[connName];
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
      delete this._dbDict[connName];
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(`CloseConnection: ${err.message}`);
    }
  }

  private async _open(database: string, readonly: boolean): Promise<void> {
    const keys = Object.keys(this._dbDict);
    const connName = readonly ? "RO_" + database : "RW_" + database;
    if (!keys.includes(connName)) {
      return Promise.reject(`Open: No available connection for ${database}`);
    }

    const mDB = this._dbDict[connName];
    try {
      await mDB.open();
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(`Open: ${err.message}`);
    }
  }
  private async _close(database: string, readonly: boolean): Promise<void> {
    const keys = Object.keys(this._dbDict);
    const connName = readonly ? "RO_" + database : "RW_" + database;
    if (!keys.includes(connName)) {
      return Promise.reject(`Close: No available connection for ${database}`);
    }

    const mDB = this._dbDict[connName];
    try {
      await mDB.close();
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(`Close: ${err.message}`);
    }
  }
  private async _saveToStore(database: string, readonly: boolean): Promise<void> {
    const keys = Object.keys(this._dbDict);
    const connName = readonly ? "RO_" + database : "RW_" + database;
    if (!keys.includes(connName)) {
      return Promise.reject(`SaveToStore: No available connection for ${database}`);
    }

    const mDB = this._dbDict[connName];
    try {
      await mDB.saveToStore();
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(`SaveToStore: ${err.message}`);
    }
  }
  async _saveToLocalDisk(database: string):Promise<void> {
    try {

      const keys = Object.keys(this._dbDict);
      const connName = "RW_" + database;
      if (!keys.includes(connName)) {
        return Promise.reject(
          '_saveToLocalDisk: No available connection for ' + `${database}`,
        );
      }
      const mDb = this._dbDict[connName];
      const uint: Uint8Array = await mDb.exportDB();
      this._blob = await this.uint2blob(uint);
      const dbName: string = `${database}SQLite.db`;
      this._opts = {fileName: dbName, extensions:['.db']};
      this._buttonSaveEl = document.createElement('button');
      this._buttonSaveEl.setAttribute("id","saveButton");
      this._buttonSaveEl.innerHTML = `${this.innerSaveText} ${dbName}`;
      this._element.appendChild(this._buttonSaveEl);
      this._buttonSaveEl.addEventListener("click", this.saveFile.bind(this));
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(`_saveToLocalDisk: ${err.message}`);
    }
  }
  async _getFromLocalDiskToStore(overwrite: boolean): Promise<void> {

    this._buttonPickEl = document.createElement('button');
    this._buttonPickEl.setAttribute("id","pickButton");
    this._buttonPickEl.innerHTML = `${this.innerPickText}`;
    this._element.appendChild(this._buttonPickEl);
    this._buttonPickEl.addEventListener("click", this.pickDatabase.bind(this));
    this._overwrite = overwrite;
    return Promise.resolve();
  }
  private async pickDatabase() {
    try {
      const blob = await fileOpen({extensions: ['.db']});
      let uInt8Array: Uint8Array = await this.blob2uint(blob);
      const databaseName = this.removePathSuffix(blob.name);
      const dbName = this.setPathSuffix(blob.name);
      // check if dbName exists
      const isExist: boolean = await isDBInStore(dbName, this.store);
      if (!isExist) {
        await saveDBToStore(dbName, uInt8Array, this.store);
      } else  {
        if(this._overwrite) {
          await removeDBFromStore(dbName, this.store);
          await saveDBToStore(dbName, uInt8Array, this.store);
        } else {
          this.PickDatabaseEnded.emit({message:`Error: cannot overwrite ${dbName}`});
        }
      }
      this._element.removeChild(this._buttonPickEl);
      this.PickDatabaseEnded.emit({db_name: databaseName});
    } catch (err) {
      const msg = err.message ? err.message : err;
      this.PickDatabaseEnded.emit({message:msg});
    }
  }

  private async saveFile() {
    try {
      await fileSave(this._blob,[this._opts]);
      const databaseName = this._opts.fileName;
      this._element.removeChild(this._buttonSaveEl);
      this.SaveDatabaseEnded.emit({db_name: databaseName});
    } catch (err) {
      const msg = err.message ? err.message : err;
      this.SaveDatabaseEnded.emit({message:msg});
    }
  }
  private async _getVersion(database: string, readonly: boolean): Promise<SQLiteVersion> {
    const keys = Object.keys(this._dbDict);
    const connName = readonly ? "RO_" + database : "RW_" + database;
    if (!keys.includes(connName)) {
      return Promise.reject(`Open: No available connection for ${database}`);
    }

    const mDB = this._dbDict[connName];
    try {
      const version: number = await mDB.getVersion();
      const ret: SQLiteVersion = {} as SQLiteVersion;
      ret.version = version;
      return Promise.resolve(ret);
    } catch (err) {
      return Promise.reject(`Open: ${err.message}`);
    }
  }

  private async _execute(database:string, statements: string, transaction: boolean,
                         readonly: boolean): Promise<SQLiteChanges> {
    const keys = Object.keys(this._dbDict);
    const connName = "RW_" + database;
    if (!keys.includes(connName)) {
      return Promise.reject(`Execute: No available connection for ${database}`);
    }
    const mDB = this._dbDict[connName];
    if(readonly) {
      return Promise.reject(`Execute: not allowed in read-only mode`);
    }
    let changes: SQLiteChanges = {} as SQLiteChanges;
    const command = statements[0].substring(0,6);
    if(this.innerAutoSave && command === "COMMIT") {
      // fix issue for typeORM with autosave
      changes.changes.changes = 0;
      return Promise.resolve(changes);
    }
    try {
      const ret: number = await mDB.executeSQL(statements, transaction);
      changes = {changes: {changes: ret}};
      return Promise.resolve(changes);
    } catch (err) {
      return Promise.reject(`Execute: ${err.message}`);
    }
  }
  private async _executeSet(database:string, setOfStatements: SQLiteSet[], transaction: boolean,
                            readonly: boolean): Promise<SQLiteChanges> {
    const keys = Object.keys(this._dbDict);
    const connName = "RW_" + database;
    if (!keys.includes(connName)) {
      return Promise.reject(`ExecuteSet: No available connection for ${database}`);
    }

    const mDB = this._dbDict[connName];
    if(readonly) {
      return Promise.reject(`ExecuteSet: not allowed in read-only mode`);
    }
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
  private async _run(database: string, statement: string, values: any[], transaction: boolean,
                    readonly: boolean): Promise<SQLiteChanges> {
    const keys = Object.keys(this._dbDict);
    const connName = "RW_" + database;
    if (!keys.includes(connName)) {
      return Promise.reject(`Run: No available connection for ${database}`);
    }

    const mDB = this._dbDict[connName];
    if(readonly) {
      return Promise.reject(`Run: not allowed in read-only mode`);
    }
    let changes: SQLiteChanges = {} as SQLiteChanges;
    const command = statement.substring(0,6);
    if(this.innerAutoSave && command === "COMMIT") {
      // fix issue for typeORM with autosave
      changes = {changes: {changes: 0}};
      return Promise.resolve(changes);
    }
    try {
      const ret: any = await mDB.runSQL(statement, values, transaction);
      changes = {changes: {changes: ret.changes, lastId: ret.lastId}};
      return Promise.resolve(changes);
    } catch (err) {
      return Promise.reject(`Run: ${err.message}`);
    }
  }
  private async _query(database: string, statement: string, values: any[],
                      readonly: boolean): Promise<SQLiteValues> {
    const keys = Object.keys(this._dbDict);
    const connName = readonly ? "RO_" + database : "RW_" + database;
    if (!keys.includes(connName)) {
      return Promise.reject(`Query: No available connection for ${database}`);
    }
    const mDB = this._dbDict[connName];
    let ret: any[] = [];
    const command = statement.substring(0,6);
    if(this.innerAutoSave && command === "COMMIT") {
      // fix issue for typeORM with autosave
      return Promise.resolve({ values: ret });
    }
    try {
      ret = await mDB.selectSQL(statement, values);
      return Promise.resolve({ values: ret });
    } catch (err) {
      return Promise.reject(`Query failed: ${err.message}`);
    }
  }
  private async _getTableList(database: string, readonly: boolean): Promise<SQLiteValues> {
    const keys = Object.keys(this._dbDict);
    const connName = readonly ? "RO_" + database : "RW_" + database;
    if (!keys.includes(connName)) {
      return Promise.reject(`GetTableList: No available connection for ${database}`);
    }
    const mDB = this._dbDict[connName];
    let ret: any[] = [];
    try {
      ret = await mDB.getTableNames();
      return Promise.resolve({ values: ret });
    } catch (err) {
      return Promise.reject(`GetTableList failed: ${err.message}`);
    }
  }
  private async _isDBExists(database:string, readonly: boolean): Promise<SQLiteResult> {
    const keys = Object.keys(this._dbDict);
    const connName = readonly ? "RO_" + database : "RW_" + database;
    if (!keys.includes(connName)) {
      return Promise.reject(`IsDBExists: No available connection for ${database}`);
    }

    const mDB = this._dbDict[connName];
    try {
      const ret: boolean = await mDB.isDBExists(database + 'SQLite.db');
      const result: SQLiteResult = {result: ret};
      return Promise.resolve(result);
    } catch (err) {
      return Promise.reject(`IsDBExists: ${err.message}`);
    }

  }
  private async _isDBOpen(database:string, readonly: boolean): Promise<SQLiteResult> {
    const keys = Object.keys(this._dbDict);
    const connName = readonly ? "RO_" + database : "RW_" + database;
    if (!keys.includes(connName)) {
      return Promise.reject(`IsDBOpen: No available connection for ${database}`);
    }

    const mDB = this._dbDict[connName];
    try {
      const ret: boolean = await mDB.isDBOpen(database + 'SQLite.db');
      const result = {result: ret};
      return Promise.resolve(result);
    } catch (err) {
      return Promise.reject(`IsDBOpen: ${err.message}`);
    }
  }
  private async _deleteDatabase(database: string, readonly: boolean): Promise<void> {
    const keys = Object.keys(this._dbDict);
    const connName = "RW_" + database;
    if (!keys.includes(connName)) {
      return Promise.reject(`DeleteDatabase: No available connection for ${database}`);
    }

    const mDB = this._dbDict[connName];
    if(readonly) {
      return Promise.reject(`DeleteDatabase: not allowed in read-only mode`);
    }
    try {
      await mDB.deleteDB(database + 'SQLite.db');
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(`DeleteDatabase: ${err.message}`);
    }
  }
  private async _isTableExists(database: string, table: string,
                              readonly: boolean): Promise<SQLiteResult> {
    const keys = Object.keys(this._dbDict);
    const connName = readonly ? "RO_" + database : "RW_" + database;
    if (!keys.includes(connName)) {
      return Promise.reject(`IsTableExists: No available connection for ${database}`);
    }

    const mDB = this._dbDict[connName];
    try {
      const ret: boolean = await mDB.isTable(table);
      const result = {result: ret};
      return Promise.resolve(result);
    } catch (err) {
      return Promise.reject(`IsTableExists: ${err.message}`);
    }
  }
  private async _createSyncTable(database: string, readonly: boolean): Promise<SQLiteChanges> {
    const keys = Object.keys(this._dbDict);
    const connName = "RW_" + database;
    if (!keys.includes(connName)) {
      return Promise.reject(
        'CreateSyncTable: No available connection for ' + `${database}`,
      );
    }

    const mDB = this._dbDict[connName];
    if(readonly) {
      return Promise.reject(`CreateSyncTable: not allowed in read-only mode`);
    }

    try {
      const ret: number = await mDB.createSyncTable();
      return Promise.resolve({ changes: { changes: ret } });
    } catch (err) {
      return Promise.reject(`CreateSyncTable: ${err.message}`);
    }
  }
  private async _getSyncDate(database: string, readonly: boolean): Promise<SQLiteSyncDate>  {
    const keys = Object.keys(this._dbDict);
    const connName = readonly ? "RO_" + database : "RW_" + database;
    if (!keys.includes(connName)) {
      return Promise.reject(
        'GetSyncDate: No available connection for ' + `${database}`,
      );
    }

    const mDB = this._dbDict[connName];
    try {
      const ret: number = await mDB.getSyncDate();
      return Promise.resolve({syncDate:ret});
    } catch (err) {
      return Promise.reject(`GetSyncDate: ${err.message}`);
    }

  }
  private async _setSyncDate(database: string, syncDate: string,
                            readonly: boolean): Promise<void> {
    const keys = Object.keys(this._dbDict);
    const connName = "RW_" + database;
    if (!keys.includes(connName)) {
      return Promise.reject(
        'SetSyncDate: No available connection for ' + `${database}`,
      );
    }

    const mDB = this._dbDict[connName];
    if(readonly) {
      return Promise.reject(`SetSyncDate: not allowed in read-only mode`);
    }
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
    const mode: string = vJsonObj.mode;
    const overwrite: boolean = vJsonObj.overwrite ?? false;
    // Create the database
    const mDb: Database = new Database(dbName, dbVersion, {}, this.store,
                                       this.innerAutoSave, this.innerWasmPath);
    try {
      if(overwrite && mode === 'full') {
        const isExists = isDBInStore(dbName,this.store);
        if(isExists) {
          await removeDBFromStore(dbName,this.store);
        }
      }
      // Open the database
      await mDb.open();
      const tableList = await mDb.getTableNames();
      if(mode === 'full' && tableList.length > 0) {
        const curVersion = await mDb.getVersion();
        if(dbVersion < curVersion) {
          return Promise.reject(`ImportFromJson: Cannot import a version lower than ${curVersion}`);
        }
        if( curVersion === dbVersion) {
          return Promise.resolve({ changes: { changes: 0 } });
        }
      }

      // Import the JsonSQLite Object
      const changes = await mDb.importJson(vJsonObj, this.importProgress);
      // Close the database
      await mDb.close();
      return Promise.resolve({ changes: { changes: changes } });
    } catch (err) {
      return Promise.reject(`ImportFromJson: ${err.message}`);
    }
  }
  async _exportToJson(database: string, exportMode: string,
                      readonly: boolean): Promise<SQLiteJson> {
    const keys = Object.keys(this._dbDict);
    const connName = readonly ? "RO_" + database : "RW_" + database;
    if (!keys.includes(connName)) {
      return Promise.reject(
        'ExportToJson: No available connection for ' + `${database}`,
      );
    }
    const mDb = this._dbDict[connName];
    try {
      const ret: any = await mDb.exportJson(exportMode, this.exportProgress);
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
  async _deleteExportedRows(database: string, readonly: boolean): Promise<void> {
    const keys = Object.keys(this._dbDict);
    const connName = "RW_" + database;
    if (!keys.includes(connName)) {
      return Promise.reject(
        'ExportToJson: No available connection for ' + `${database}`,
      );
    }
    const mDb = this._dbDict[connName];
    if(readonly) {
      return Promise.reject(`SetSyncDate: not allowed in read-only mode`);
    }
    try {
      await mDb.deleteExportedRows();
    } catch (err) {
      return Promise.reject(`DeleteExportedRows: ${err.message}`);
    }
  }

  async _copyFromAssets(overwrite: boolean): Promise<void> {
    const res = await this.loadJSON('assets/databases/databases.json');
    if(res != null) {
      this.databaseList = JSON.parse(res);
      const keys = Object.keys(this.databaseList);
      if (keys.includes("databaseList")) {
        try {
          for( const dbName of this.databaseList.databaseList) {
            if( dbName.substring(dbName.length - 3) === ".db") {
              await this.copyDatabase(`assets/databases/${dbName}`, overwrite);
            }
            if( dbName.substring(dbName.length - 4) === ".zip") {
              await this.unzipDatabase(`assets/databases/${dbName}`, overwrite);
            }
          }
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(`CopyFromAssets: ${err.message}`);
        }
      } else {
        return Promise.reject(`CopyFromAssets: no key databaseList in databases.json`);
      }
    } else {
      return Promise.reject(`CopyFromAssets: no databases.json file in assets/databases folder`);
    }
  }
  async _getFromHTTPRequest(url: string, overwrite: boolean): Promise<void> {
    try {
      let message: string;
      if( url.substring(url.length - 3) === ".db") {
        await this.copyDatabase(url, overwrite);
        message = "db";
      }
      if( url.substring(url.length - 4) === ".zip") {
        await this.unzipDatabase(url, overwrite);
        message = "zip";
      }
      this.HTTPRequestEnded.emit({message:message});
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(`GetFromHTTPRequest: ${err.message}`);
    }

  }
  async _isDatabase(database:string): Promise<SQLiteResult> {
    try {
      const ret: boolean = await isDBInStore(database + 'SQLite.db', this.store);
      const result: SQLiteResult = {result: ret};
      return Promise.resolve(result);
    } catch (err) {
      return Promise.reject(`IsDatabase: ${err.message}`);
    }

  }
  async _getDatabaseList(): Promise<SQLiteValues> {
    try {
      const ret: string[] = await getDBListFromStore(this.store);
      const result: SQLiteValues = {values: ret};
      return Promise.resolve(result);
    } catch (err) {
      return Promise.reject(`GetDatabaseList: ${err.message}`);
    }
  }
  async _checkConnectionsConsistency(dbNames: string[], openModes: string[]): Promise<SQLiteResult> {
    const ret: SQLiteResult = {} as SQLiteResult;
    ret.result = false;
    const dbConns: string[] = [];
    dbNames.forEach((value, i) => {
      dbConns.push(`${openModes[i]}_${value}`);
    });
    try {
      let inConnectionsSet: Set<string> = new Set(Object.keys(this._dbDict));
      const outConnectionSet: Set<string> = new Set(dbConns);
      if(outConnectionSet.size === 0 ) {
        await this._resetDbDict(Object.keys(this._dbDict));
        return Promise.resolve(ret);
      }
      if(inConnectionsSet.size < outConnectionSet.size) {
        await this._resetDbDict(Object.keys(this._dbDict));
        return Promise.resolve(ret);
      }
      if(inConnectionsSet.size > outConnectionSet.size) {
        const opt: SQLiteOptions = {} as SQLiteOptions;
        for ( const key of inConnectionsSet) {
          if(!Array.from(outConnectionSet.keys()).includes(key) ) {
            let readonly = false;
            if (key.substring(0,3) === "RO_") {
              readonly = true;
            }
            opt.database = key.substring(3);
            opt.readonly = readonly;
            await this._closeConnection(opt.database, opt.readonly);
          }
        }
      }
      inConnectionsSet = new Set(Object.keys(this._dbDict));
      if(inConnectionsSet.size === outConnectionSet.size) {
        const symDiffSet = await this.symmetricDifference(inConnectionsSet,outConnectionSet);
        if(symDiffSet.size === 0) {
          ret.result = true;
          return Promise.resolve(ret);
        } else {
          await this._resetDbDict(Object.keys(this._dbDict));
          return Promise.resolve(ret);
          }
      } else {
        await this._resetDbDict(Object.keys(this._dbDict));
        return Promise.resolve(ret);
      }
    } catch (err) {
      return Promise.reject(`CheckConnectionsConsistency: ${err.message}`);
    }
  }
  private async _resetDbDict(keys: string[]): Promise<void> {
    try {
      for (const key of keys) {
        const opt: SQLiteOptions = {} as SQLiteOptions;
        let readonly = false;
        if (key.substring(0,3) === "RO_") {
          readonly = true;
        }
        opt.database = key.substring(3);
        opt.readonly = readonly;
        await this._closeConnection(opt.database, opt.readonly);
      }
    } catch (err) {
      return Promise.reject(`ResetDbDict: ${err.message}`);
    }

  }
  private async symmetricDifference(setA: Set<string>, setB: Set<string>): Promise<Set<string>> {
    let _difference: Set<string> = new Set()
    setA.forEach(element => {
      _difference.add(element.substring(3));
    });
    let _compare: Set<string> = new Set()
    setB.forEach(element => {
      _compare.add(element.substring(3));
    });
    for (const elem of _compare) {
        if (_difference.has(elem)) {
            _difference.delete(elem);
        } else {
            _difference.add(elem);
        }
    }
    return _difference;
}
private async unzipDatabase(dbZipName: string, overwrite: boolean): Promise<void> {
  return new Promise ((resolve,reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', dbZipName, true);
    xhr.responseType = 'arraybuffer';
    xhr.onerror = () => {
      reject(new Error(`unzipDatabase: failed`));
    }
    xhr.onload =  () => {

      JSZip.loadAsync(xhr.response).then( async (zip) => {
        const keys = Object.keys(zip.files);
        try {
          // loop through file in the zip
          for (const filename of keys) {
            await this.retrieveDBFromZip(zip.files,filename,overwrite);
          }
          resolve();
        } catch (err) {
          reject(new Error(`unzipDatabase Error: ${err.message}`));
        }
      });
    };
    xhr.send();
  });
}
  private async retrieveDBFromZip(zipFiles: {[key: string]: JSZip.JSZipObject}, fileName: string, overwrite: boolean ): Promise<void> {
    return new Promise ((resolve,reject) => {
      zipFiles[fileName].async('nodebuffer').then(async (fileData) => {
        try {
          const uInt8Array = new Uint8Array(fileData);
          const dbName = this.setPathSuffix(fileName);
          // check if dbName exists
          const isExist: boolean = await isDBInStore(dbName, this.store);
          if (!isExist) {
            await saveDBToStore(dbName, uInt8Array, this.store);
          } else  {
            if(overwrite) {
              await removeDBFromStore(dbName, this.store);
              await saveDBToStore(dbName, uInt8Array, this.store);
              } else {
              reject(new Error(`retrieveDBFromZip: cannot overwrite ${dbName}`));
            }
          }
          resolve();
        } catch (err) {
          reject(new Error(`retrieveDBFromZip:: ${err.message}`));
        }
      });
    });
  }
  private async copyDatabase(dbInName: string, overwrite: boolean): Promise<void> {
    return new Promise ((resolve,reject) => {
      var xhr = new XMLHttpRequest();
      var uInt8Array: Uint8Array;
      xhr.open('GET', dbInName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onerror = () => {
        reject(new Error(`CopyDatabase: failed`));
      }
      xhr.onload =  () => {
          uInt8Array = new Uint8Array(xhr.response);
      };
      xhr.onloadend= async () => {
        const dbName = this.setPathSuffix(dbInName);
        // check if dbName exists
        const isExist: boolean = await isDBInStore(dbName, this.store);
        if (!isExist) {
          await saveDBToStore(dbName, uInt8Array, this.store);
        } else  {
          if(overwrite) {
            await removeDBFromStore(dbName, this.store);
            await saveDBToStore(dbName, uInt8Array, this.store);
          } else {
            reject(new Error(`CopyDatabase Error: cannot overwrite ${dbName}`));
          }
        }
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
        reject(new Error(`LoadJSON: failed`));
      }

      xobj.onreadystatechange = function () {
        if(xobj.status == 404) resolve(null);
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
  private removePathSuffix(db:string): string {
    return db.includes("SQLite.db") ?
            db.split("SQLite.db")[0] :
            db.substring(db.length -3) === ".db" ?
            db.slice(0,db.lastIndexOf(".")) :
            db;
  }
  private setPathSuffix(db: string): string {
    let toDb: string = db.slice(db.lastIndexOf("/") + 1);
    const ext: string = ".db";
    if(db.substring(db.length -3) === ext) {
      if(!db.includes("SQLite.db")) {
        toDb = db.slice(db.lastIndexOf("/") + 1, -3) + 'SQLite.db';
      }
    }
    return toDb;
  }
  private async blob2uint(blob: Blob): Promise<Uint8Array> {
    return new Response(blob).arrayBuffer().then(buffer=>{
        const uint: Uint8Array = new Uint8Array(buffer);
        return uint;
    });
  }
  private async uint2blob(uint: Uint8Array): Promise<Blob> {
    const blob: Blob = new Blob([uint.buffer]);

    return Promise.resolve(blob);
  }

  render() {
    return ;
  }
}
