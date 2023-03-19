# jeep-sqlite

## Indexes
* [`Events Index`](#events-index)
* [`Interfaces Index`](#interfaces-index)
* [`Methods Index`](#methods-index)


## Methods Index
* [`addUpgradeStatement(...)`](#addupgradestatement)
* [`checkConnectionsConsistency(...)`](#checkconnectionsconsistency)
* [`close(...)`](#close)
* [`closeConnection(...)`](#closeconnection)
* [`copyFromAssets(...)`](#copyfromassets)
* [`createConnection(...)`](#createconnection)
* [`createSyncTable(...)`](#createsynctable)
* [`deleteDatabase(...)`](#deletedatabase)
* [`deleteExportedRows(...)`](#deleteexportedrows)
* [`echo(...)`](#echo)
* [`execute(...)`](#execute)
* [`executeSet(...)`](#executeset)
* [`exportToJson(...)`](#exporttojson)
* [`getDatabaseList()`](#getdatabaselist)
* [`getFromHTTPRequest(...)`](#getfromhttprequest)
* [`getFromLocalDiskToStore(...)`](#getfromlocaldisktostore)
* [`getSyncDate(...)`](#getsyncdate)
* [`getTableList(...)`](#gettablelist)
* [`getVersion(...)`](#getversion)
* [`importFromJson(...)`](#importfromjson)
* [`isConnection(...)`](#isconnection)
* [`isDatabase(...)`](#isdatabase)
* [`isDBExists(...)`](#isdbexists)
* [`isDBOpen(...)`](#isdbopen)
* [`isJsonValid(...)`](#isjsonvalid)
* [`isStoreOpen()`](#isstoreopen)
* [`isTableExists(...)`](#istableexists)
* [`open(...)`](#open)
* [`query(...)`](#query)
* [`run(...)`](#run)
* [`saveToLocalDisk(...)`](#savetolocaldisk)
* [`saveToStore(...)`](#savetostore)
* [`setSyncDate(...)`](#setsyncdate)

## Interfaces Index
* [`AllConnectionsOptions`](#allconnectionsoptions)
* [`Changes`](#changes)
* [`ConnectionOptions`](#connectionoptions)
* [`EchoOptions`](#echooptions)
* [`EchoResult`](#echoresult)
* [`HTTPRequestEndedListener(...)`](#httprequestendedlistener)
* [`JsonColumn`](#jsoncolumn)
* [`JsonSQLite`](#jsonsqlite)
* [`JsonTable`](#jsontable)
* [`JsonTrigger`](#jsontrigger)
* [`JsonIndex`](#jsonindex)
* [`JsonProgressListener`](#jsonprogresslistener)
* [`JsonView`](#jsonview)
* [`PickOrSaveDatabaseEndedListener`](#pickorsavedatabaseendedlistener)
* [`SQLiteChanges`](#sqlitechanges)
* [`SQLiteExecuteOptions`](#sqliteexecuteoptions)
* [`SQLiteExportOptions`](#sqliteexportoptions)
* [`SQLiteFromAssetsOptions`](#sqlitefromassetsoptions)
* [`SQLiteImportOptions`](#sqliteimportoptions)
* [`SQLiteJson`](#sqlitejson)
* [`SQLiteOptions`](#sqliteoptions)
* [`SQLiteQueryOptions`](#sqlitequeryoptions)
* [`SQLiteResult`](#sqliteresult)
* [`SQLiteRunOptions`](#sqliterunoptions)
* [`SQLiteSet`](#sqliteset)
* [`SQLiteSetOptions`](#sqlitesetoptions)
* [`SQLiteSyncDate`](#sqlitesyncdate)
* [`SQLiteSyncDateOptions`](#sqlitesyncdateoptions)
* [`SQLiteTableOptions`](#sqlitetableoptions)
* [`SQLiteUpgradeOptions`](#sqliteupgradeoptions)
* [`SQLiteValues`](#sqlitevalues)
* [`SQLiteVersion`](#sqliteversion)
* [`SQLiteVersionUpgrade`](#sqliteversionupgrade)
* [`SQLiteHTTPOptions`](#sqlitehttpoptions)

### Events Index
* [`jeepSqliteExportProgress`](#jeepsqliteexportprogress)
* [`jeepSqliteImportProgress`](#jeepsqliteimportprogress)
* [`jeepSqliteHTTPRequestEnded`](#jeepsqlitehttprequestended)
* [`jeepSqlitePickDatabaseEnded`](#jeepsqlitepickdatabaseended)
* [`jeepSqliteSaveDatabaseToDisk`](#jeepsqlitesavedatabasetodisk)

## Interfaces

### EchoOptions
| Prop             | Type                   | Description                                                |
| ---------------- | ---------------------  | ---------------------------------------------------------- |
| **`value`**      | <code>string</code>    | String to be echoed                                        |

### ConnectionOptions
| Prop             | Type                   | Description                                                |
| ---------------- | ---------------------- | ---------------------------------------------------------- |
| **`database`**   | <code>string</code>    | The database name                                          |
| **`version`**    | <code>number</code>    | The database version                                       |
| **`encrypted`**  | <code>boolean</code>   | Set to false (no encryption)                               |
| **`mode`**       | <code>string</code>    | Set the mode for database encryption  `no-encryption`      |
| **`readonly`**   | <code>boolean</code>   | The database readonly mode                                 |

### AllConnectionsOptions
| Prop             | Type                   | Description                                                |
| ---------------- | ---------------------- | ---------------------------------------------------------- |
| **`dbNames`**    | <code>string[]</code>  | the dbName of all connections                              |
| **`openModes`**  | <code>string[]</code>  | the open mode ("RW", "RO") of all connections              |


### SQLiteOptions
| Prop             | Type                   | Description                                                |
| ---------------- | ---------------------- | ---------------------------------------------------------- |
| **`database`**   | <code>string</code>    | The database name                                          |
| **`readonly`**   | <code>boolean</code>   | The database readonly mode                                 |

### SQLiteExecuteOptions
| Prop                | Type                   | Description                                             |
| ------------------- | ---------------------- | ------------------------------------------------------- |
| **`database`**      | <code>string</code>    | The database name                                       |
| **`statements`**    | <code>string</code>    | Batch of raw SQL statements as string                   |
| **`transaction`**   | <code>boolean</code>   | Enable / Disable transactions default Enable (true)     |
| **`readonly`**   | <code>boolean</code>   | The database readonly mode                                 |

### SQLiteSetOptions
| Prop              | Type                    | Description                                             |
| ----------------- | ----------------------- | ------------------------------------------------------- |
| **`database`**    | <code>string</code>     | The database name                                       |
| **`set`**         | <code>SQLiteSet[]</code>| Batch of raw SQL statements as Array of capSQLLiteSet   |
| **`transaction`** | <code>boolean</code>    | Enable / Disable transactions default Enable (true)     |
| **`readonly`**    | <code>boolean</code>    | The database readonly mode                              |

### SQLiteRunOptions
| Prop              | Type                  | Description                                             |
| ----------------- | --------------------- | ------------------------------------------------------- |
| **`database`**    | <code>string</code>   | The database name                                       |
| **`statement`**   | <code>string</code>   | A SQL statement                                         |
| **`values`**      | <code>any[]</code>    | An array of values for the statement                    |
| **`transaction`** | <code>boolean</code>  | Enable / Disable transactions default Enable (true)     |
| **`readonly`**    | <code>boolean</code>  | The database readonly mode                              |

### SQLiteQueryOptions
| Prop              | Type                  | Description                                             |
| ----------------- | --------------------- | ------------------------------------------------------- |
| **`database`**    | <code>string</code>   | The database name                                       |
| **`statement`**   | <code>string</code>   | A SQL statement                                         |
| **`values`**      | <code>any[]</code>    | An array of values for the statement                    |
| **`readonly`**    | <code>boolean</code>  | The database readonly mode                              |

### SQLiteSyncDateOptions
| Prop              | Type                 | Description                                                |
| ----------------- | -------------------- | ---------------------------------------------------------- |
| **`database`**    | <code>string</code>  | The database name                                          |
| **`syncdate`**    | <code>string</code>  | The synchronization date Format yyyy-MM-dd'T'HH:mm:ss.SSSZ |
| **`readonly`**    | <code>boolean</code> | The database readonly mode                                 |

###  SQLiteTableOptions
| Prop              | Type                 | Description                                                |
| ----------------- | -------------------- | ---------------------------------------------------------- |
| **`database`**    | <code>string</code>  | The database name                                          |
| **`table`**       | <code>string</code>  | The table name                                             |
| **`readonly`**    | <code>boolean</code> | The database readonly mode                                 |

### SQLiteImportOptions
| Prop              | Type                 | Description                                                |
| ----------------- | -------------------- | ---------------------------------------------------------- |
| **`jsonstring`**  | <code>string</code>  | The JSON object to import                                  |

### SQLiteExportOptions
| Prop                 | Type                 | Description                                             |
| -------------------- | -------------------- | ------------------------------------------------------- |
| **`database`**       | <code>string</code>  | The database name                                       |
| **`jsonexportmode`** | <code>string</code>  | The mode to export JSON Object `full` or `partial`      |
| **`readonly`**       | <code>boolean</code> | The database readonly mode                              |

### SQLiteUpgradeOptions 
| Prop           | Type                                | Description                                   |
| -------------- | ----------------------------------- | --------------------------------------------- |
| **`database`** | <code>string</code>                 | The database name                             |
| **`upgrade`**  | <code>SQLiteVersionUpgrade[]</code> | The upgrade options for version upgrade       |

### SQLiteVersionUpgrade
| Prop              | Type                     | Description                                           |
| ----------------- | ------------------------ | ----------------------------------------------------- |
| **`toVersion`**   | <code>number</code>      | The new database version                              |
| **`statements`**  | <code>string[]</code>    | A SQL statement defining the schemas                  |

### SQLiteSet 
| Prop              | Type                  | Description                                             |
| ----------------- | --------------------- | ------------------------------------------------------- |
| **`statement`**   | <code>string</code>   | A SQL statement                                         |
| **`values`**      | <code>any[]</code>    | An array of data values list                            |

### SQLiteHTTPOptions

| Prop              | Type                  | Description                                             |
| ----------------- | --------------------- | ------------------------------------------------------- |
| **`url`**         | <code>string</code>   | An http url                                             |
| **`overwrite`**   | <code>boolean</code>  | An overwrite value true/false default true              |


### EchoResult {
| Prop          | Type                  | Description                                             |
| ------------- | --------------------- | ------------------------------------------------------- |
| **`value`**   | <code>string</code>   | A value to echo                                         |

### SQLiteResult {
| Prop           | Type                  | Description                                             |
| -------------- | --------------------- | ------------------------------------------------------- |
| **`result`**   | <code>boolean</code>  | Return `true` when successful else `false`              |

### SQLiteChanges {
| Prop           | Type                  | Description                                             |
| -------------- | --------------------- | ------------------------------------------------------- |
| **`changes`**  | <code>Changes</code>  | Returned changes                                        |

### Changes 
| Prop           | Type                  | Description                                             |
| -------------- | --------------------- | ------------------------------------------------------- |
| **`changes`**  | <code>number</code>   | Returned number of changes                              |
| **`lastId`**   | <code>number</code>   | Returned the lastId created from a run command          |

### SQLiteValues 
| Prop          | Type                 | Description                                             |
| ------------- | -------------------- | ------------------------------------------------------- |
| **`values`**  | <code>any[]</code>   | Returned the data values list as an Array               |

### SQLiteVersion 
| Prop           | Type                 | Description                                 |
| -------------- | -------------------- | ------------------------------------------- |
| **`version`**  | <code>number</code>  | Returned the database version               |

### SQLiteSyncDate {
| Prop            | Type                 | Description                                             |
| --------------- | -------------------- | ------------------------------------------------------- |
| **`syncDate`**  | <code>number</code>  | Returned the stored synchronization date                |

### SQLiteFromAssetsOptions {
| Prop            | Type                  | Description                                             |
| --------------- | --------------------- | ------------------------------------------------------- |
| **`overwrite`**  | <code>boolean</code> | An overwrite value true/false default true              |
  
### SQLiteJson {
| Prop          | Type                     | Description                                           |
| ------------- | ------------------------ | ----------------------------------------------------- |
| **`export`**  | <code>JsonSQLite</code>  | Returned an export JSON object                        |

### HTTPRequestEndedListener {
| Prop            | Type                 | Description                                           |
| --------------- | -------------------- | ----------------------------------------------------- |
| **`message`**  | <code>string</code>  | message can be either 'db' or 'zip'                    |

### PickOrSaveDatabaseEndedListener {
| Prop            | Type                 | Description                                           |
| --------------- | -------------------- | ----------------------------------------------------- |
| **`db_name`**   | <code>string</code>  | database file name                                    |
| **`message`**   | <code>string</code>  | error message                                         |

### JsonProgressListener {
| Prop            | Type                 | Description                                           |
| --------------- | -------------------- | ----------------------------------------------------- |
| **`progress`**  | <code>string</code>  | Progress message for importFromJson or exportToJson   |

### JsonView {
| Prop         | Type                     | Description         |
| ------------ | ------------------------ | ------------------- |
| **`mode`**   | <code>string</code>      | "full" / "partial"  |
| **`tables`** | <code>JsonTable[]</code> | tables definition   |
| **`views`**  | <code>JsonView[]</code>  | views definition    |

## JSON Types

### JsonSQLite {
| Prop              | Type                       | Description                                        |  
| ----------------- | -------------------------- | -------------------------------------------------- |
| **`database`**    | <code>string</code>        | The database name                                  |
| **`version`**     | <code>number</code>        | The database version                               |
| **`encrypted`**   | <code>boolean</code>       | Set to true (database encryption) / false          |
| **`mode`**        | <code>string</code>        | Set the mode `full` or `partial`                   |
| **`tables`**      | <code>JsonTable[]</code>   | Array of Table                                     |

### JsonTable
| Prop             | Type                      | Description                                        |  
| --------------- | -------------------------- | -------------------------------------------------- |
| **`name`**      | <code>string</code>        | The table name                                     |
| **`schema`**    | <code>JsonColumn[]</code>  | Array of Schema                                    |
| **`indexes`**   | <code>JsonIndex[]</code>   | Array of Index                                     |
| **`triggers`**  | <code>JsonTrigger[]</code> | Array of Trigger                                   |
| **`values`**    | <code>any[][]</code>       | Array of Table's data                              |

### JsonColumn {
| Prop             | Type                | Description                                        |  
| ---------------- | ------------------- | -------------------------------------------------- |
| **`column`**     | <code>string</code> | The column name                                    |
| **`value`**      | <code>string</code> | The column data (type, unique, ...)                |
| **`foreignkey`** | <code>string</code> | The column foreign key constraints                 |
| **`constraint`** | <code>string</code> | The column constraint                              |

### JsonTrigger {
| Prop             | Type                | Description                                        |  
| ---------------- | ------------------- | -------------------------------------------------- |
| **`name`**       | <code>string</code> | The trigger name                                   |
| **`timeevent`**  | <code>string</code> | The trigger time event fired                       |
| **`condition`**  | <code>string</code> | The trigger condition                              |
| **`logic`**      | <code>string</code> | The trigger logic                                  |

### JsonIndex {
| Prop         | Type                | Description                                        |  
| ------------ | ------------------- | -------------------------------------------------- |
| **`name`**   | <code>string</code> | The index name                                     |
| **`value`**  | <code>string</code> | The index value                                    |
| **`mode`**   | <code>string</code> | The mode (optional) ie UNIQUE                      |

The index value can have the following formats:
   - email
   - email ASC
   - email, MobileNumber
   - email ASC, MobileNumber DESC



## Events

### jeepSqliteExportProgress
| Event                      | Description | Type                                |
| -------------------------- | ----------- | ----------------------------------- |
| `jeepSqliteExportProgress` |             | `CustomEvent<JsonProgressListener>` |

### jeepSqliteImportProgress
| Event                      | Description | Type                                |
| -------------------------- | ----------- | ----------------------------------- |
| `jeepSqliteImportProgress` |             | `CustomEvent<JsonProgressListener>` |

### jeepSqliteHTTPRequestEnded
| Event                        | Description | Type                                |
| ---------------------------- | ----------- | ----------------------------------- |
| `jeepSqliteHTTPRequestEnded` |             | `CustomEvent<HTTPRequestEndedListener>` |

### jeepSqlitePickDatabaseEnded
| Event                         | Description | Type                                            |
| ----------------------------- | ----------- | ----------------------------------------------- |
| `jeepSqlitePickDatabaseEnded` |             | `CustomEvent<<PickOrSaveDatabaseEndedListener>` |

### jeepSqliteSaveDatabaseToDisk
| Event                          | Description | Type                                            |
| ------------------------------ | ----------- | ----------------------------------------------- |
| `jeepSqliteSaveDatabaseToDisk` |             | `CustomEvent<<PickOrSaveDatabaseEndedListener>` |

## Methods

### addUpgradeStatement

`addUpgradeStatement(options: SQLiteUpgradeOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`



### checkConnectionsConsistency

`checkConnectionsConsistency(options: AllConnectionsOptions) => Promise<SQLiteResult>`



#### Returns

Type: `Promise<SQLiteResult>`



### close

`close(options: SQLiteOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`



### closeConnection

`closeConnection(options: SQLiteOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`



### copyFromAssets

`copyFromAssets(options: SQLiteFromAssetsOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`



### createConnection

`createConnection(options: ConnectionOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`



### createSyncTable

 `createSyncTable(options: SQLiteOptions) => Promise<SQLiteChanges>`



#### Returns

Type: `Promise<SQLiteChanges>`



### deleteDatabase

`deleteDatabase(options: SQLiteOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`


### deleteExportedRows

`deleteExportedRows(options: SQLiteOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`


### echo

`echo(options: EchoOptions) => Promise<EchoResult>`



#### Returns

Type: `Promise<EchoResult>`



### execute

`execute(options: SQLiteExecuteOptions) => Promise<SQLiteChanges>`



#### Returns

Type: `Promise<SQLiteChanges>`



### executeSet

`executeSet(options: SQLiteSetOptions) => Promise<SQLiteChanges>`



#### Returns

Type: `Promise<SQLiteChanges>`



### exportToJson

`exportToJson(options: SQLiteExportOptions) => Promise<SQLiteJson>`



#### Returns

Type: `Promise<SQLiteJson>`



### getDatabaseList

`getDatabaseList() => Promise<SQLiteValues>`



#### Returns

Type: `Promise<SQLiteValues>`


### getFromHTTPRequest

`getFromHTTPRequest(options: SQLiteHTTPOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`


### getFromLocalDiskToStore

`getFromLocalDiskToStore(options: SQLiteLocalDiskOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`


### getSyncDate

`getSyncDate(options: SQLiteSyncDateOptions) => Promise<SQLiteSyncDate>`



#### Returns

Type: `Promise<SQLiteSyncDate>`


### getTableList

`getTableList(options: SQLiteOptions) => Promise<SQLiteValues>`



#### Returns

Type: `Promise<SQLiteValues>`



### getVersion

`getVersion(options: SQLiteOptions) => Promise<SQLiteVersion>`



#### Returns

Type: `Promise<SQLiteVersion>`



### importFromJson

`importFromJson(options: SQLiteImportOptions) => Promise<SQLiteChanges>`



#### Returns

Type: `Promise<SQLiteChanges>`



### isDBExists

`isDBExists(options: SQLiteOptions) => Promise<SQLiteResult>`



#### Returns

Type: `Promise<SQLiteResult>`



### isDBOpen

`isDBOpen(options: SQLiteOptions) => Promise<SQLiteResult>`



#### Returns

Type: `Promise<SQLiteResult>`


### isConnection

`isConnection(options: SQLiteOptions) => Promise<SQLiteResult>`



#### Returns

Type: `Promise<SQLiteResult>`




### isDatabase

`isDatabase(options: SQLiteOptions) => Promise<SQLiteResult>`



#### Returns

Type: `Promise<SQLiteResult>`



### isJsonValid

`isJsonValid(options: SQLiteImportOptions) => Promise<SQLiteResult>`



#### Returns

Type: `Promise<SQLiteResult>`



### isStoreOpen

`isStoreOpen() => Promise<boolean>`



#### Returns

Type: `Promise<boolean>`



### isTableExists

`isTableExists(options: SQLiteTableOptions) => Promise<SQLiteResult>`



#### Returns

Type: `Promise<SQLiteResult>`



### open

`open(options: SQLiteOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`



### query

`query(options: SQLiteQueryOptions) => Promise<SQLiteValues>`



#### Returns

Type: `Promise<SQLiteValues>`



### run

`run(options: SQLiteRunOptions) => Promise<SQLiteChanges>`



#### Returns

Type: `Promise<SQLiteChanges>`



### saveToLocalDisk

`saveToLocalDisk(options: SQLiteOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`



### saveToStore

`saveToStore(options: SQLiteOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`



### setSyncDate

`setSyncDate(options: SQLiteSyncDateOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`


<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description | Type      | Default     |
| ---------- | ---------- | ----------- | --------- | ----------- |
| `autoSave` | `autosave` | AutoSave    | `boolean` | `false`     |
| `wasmPath` | `wasmpath` | WasmPath    | `string`  | `undefined` |


## Events

| Event                          | Description | Type                                           |
| ------------------------------ | ----------- | ---------------------------------------------- |
| `jeepSqliteExportProgress`     |             | `CustomEvent<JsonProgressListener>`            |
| `jeepSqliteHTTPRequestEnded`   |             | `CustomEvent<HTTPRequestEndedListener>`        |
| `jeepSqliteImportProgress`     |             | `CustomEvent<JsonProgressListener>`            |
| `jeepSqlitePickDatabaseEnded`  |             | `CustomEvent<PickOrSaveDatabaseEndedListener>` |
| `jeepSqliteSaveDatabaseToDisk` |             | `CustomEvent<PickOrSaveDatabaseEndedListener>` |


## Methods

### `addUpgradeStatement(options: SQLiteUpgradeOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `checkConnectionsConsistency(options: AllConnectionsOptions) => Promise<SQLiteResult>`



#### Returns

Type: `Promise<SQLiteResult>`



### `close(options: SQLiteOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `closeConnection(options: SQLiteOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `copyFromAssets(options: SQLiteFromAssetsOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `createConnection(options: ConnectionOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `createSyncTable(options: SQLiteOptions) => Promise<SQLiteChanges>`



#### Returns

Type: `Promise<SQLiteChanges>`



### `deleteDatabase(options: SQLiteOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `deleteExportedRows(options: SQLiteOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `echo(options: EchoOptions) => Promise<EchoResult>`



#### Returns

Type: `Promise<EchoResult>`



### `execute(options: SQLiteExecuteOptions) => Promise<SQLiteChanges>`



#### Returns

Type: `Promise<SQLiteChanges>`



### `executeSet(options: SQLiteSetOptions) => Promise<SQLiteChanges>`



#### Returns

Type: `Promise<SQLiteChanges>`



### `exportToJson(options: SQLiteExportOptions) => Promise<SQLiteJson>`



#### Returns

Type: `Promise<SQLiteJson>`



### `getDatabaseList() => Promise<SQLiteValues>`



#### Returns

Type: `Promise<SQLiteValues>`



### `getFromHTTPRequest(options: SQLiteHTTPOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `getFromLocalDiskToStore(options: SQLiteLocalDiskOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `getSyncDate(options: SQLiteSyncDateOptions) => Promise<SQLiteSyncDate>`



#### Returns

Type: `Promise<SQLiteSyncDate>`



### `getTableList(options: SQLiteOptions) => Promise<SQLiteValues>`



#### Returns

Type: `Promise<SQLiteValues>`



### `getVersion(options: SQLiteOptions) => Promise<SQLiteVersion>`



#### Returns

Type: `Promise<SQLiteVersion>`



### `importFromJson(options: SQLiteImportOptions) => Promise<SQLiteChanges>`



#### Returns

Type: `Promise<SQLiteChanges>`



### `isConnection(options: SQLiteOptions) => Promise<SQLiteResult>`



#### Returns

Type: `Promise<SQLiteResult>`



### `isDBExists(options: SQLiteOptions) => Promise<SQLiteResult>`



#### Returns

Type: `Promise<SQLiteResult>`



### `isDBOpen(options: SQLiteOptions) => Promise<SQLiteResult>`



#### Returns

Type: `Promise<SQLiteResult>`



### `isDatabase(options: SQLiteOptions) => Promise<SQLiteResult>`



#### Returns

Type: `Promise<SQLiteResult>`



### `isJsonValid(options: SQLiteImportOptions) => Promise<SQLiteResult>`



#### Returns

Type: `Promise<SQLiteResult>`



### `isStoreOpen() => Promise<boolean>`



#### Returns

Type: `Promise<boolean>`



### `isTableExists(options: SQLiteTableOptions) => Promise<SQLiteResult>`



#### Returns

Type: `Promise<SQLiteResult>`



### `open(options: SQLiteOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `query(options: SQLiteQueryOptions) => Promise<SQLiteValues>`



#### Returns

Type: `Promise<SQLiteValues>`



### `run(options: SQLiteRunOptions) => Promise<SQLiteChanges>`



#### Returns

Type: `Promise<SQLiteChanges>`



### `saveToLocalDisk(options: SQLiteOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `saveToStore(options: SQLiteOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `setSyncDate(options: SQLiteSyncDateOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
