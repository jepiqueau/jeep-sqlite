# jeep-sqlite

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

### AllConnectionsOptions
| Prop             | Type                   | Description                                                |
| ---------------- | ---------------------- | ---------------------------------------------------------- |
| **`dbNames`**    | <code>string[]</code>  | the dbName of all connections                              |

### SQLiteOptions
| Prop             | Type                   | Description                                                |
| ---------------- | ---------------------- | ---------------------------------------------------------- |
| **`database`**   | <code>string</code>    | The database name                                          |

### SQLiteExecuteOptions
| Prop                | Type                   | Description                                             |
| ------------------- | ---------------------- | ------------------------------------------------------- |
| **`database`**      | <code>string</code>    | The database name                                       |
| **`statements`**    | <code>string</code>    | Batch of raw SQL statements as string                   |
| **`transaction`**   | <code>boolean</code>   | Enable / Disable transactions default Enable (true)     |

### SQLiteSetOptions
| Prop              | Type                    | Description                                             |
| ----------------- | ----------------------- | ------------------------------------------------------- |
| **`database`**    | <code>string</code>     | The database name                                       |
| **`set`**         | <code>SQLiteSet[]</code>| Batch of raw SQL statements as Array of capSQLLiteSet   |
| **`transaction`** | <code>boolean</code>    | Enable / Disable transactions default Enable (true)     |

### SQLiteRunOptions
| Prop              | Type                  | Description                                             |
| ----------------- | --------------------- | ------------------------------------------------------- |
| **`database`**    | <code>string</code>   | The database name                                       |
| **`statement`**   | <code>string</code>   | A SQL statement                                         |
| **`values`**      | <code>any[]</code>    | An array of values for the statement                    |
| **`transaction`** | <code>boolean</code>  | Enable / Disable transactions default Enable (true)     |

### SQLiteQueryOptions
| Prop              | Type                  | Description                                             |
| ----------------- | --------------------- | ------------------------------------------------------- |
| **`database`**    | <code>string</code>   | The database name                                       |
| **`statement`**   | <code>string</code>   | A SQL statement                                         |
| **`values`**      | <code>any[]</code>    | An array of values for the statement                    |

### SQLiteSyncDateOptions
| Prop              | Type                 | Description                                                |
| ----------------- | -------------------- | ---------------------------------------------------------- |
| **`database`**    | <code>string</code>  | The database name                                          |
| **`syncdate`**    | <code>string</code>  | The synchronization date Format yyyy-MM-dd'T'HH:mm:ss.SSSZ |

###  SQLiteTableOptions
| Prop              | Type                 | Description                                                |
| ----------------- | -------------------- | ---------------------------------------------------------- |
| **`database`**    | <code>string</code>  | The database name                                          |
| **`table`**       | <code>string</code>  | The table name                                             |

### SQLiteImportOptions
| Prop              | Type                 | Description                                                |
| ----------------- | -------------------- | ---------------------------------------------------------- |
| **`jsonstring`**  | <code>string</code>  | The JSON object to import                                  |

### SQLiteExportOptions
| Prop                 | Type                 | Description                                             |
| -------------------- | -------------------- | ------------------------------------------------------- |
| **`database`**       | <code>string</code>  | The database name                                       |
| **`jsonexportmode`** | <code>string</code>  | The mode to export JSON Object `full` or `partial`      |

### SQLiteUpgradeOptions 
| Prop           | Type                                | Description                                   |
| -------------- | ----------------------------------- | --------------------------------------------- |
| **`database`** | <code>string</code>                 | The database name                             |
| **`upgrade`**  | <code>SQLiteVersionUpgrade[]</code> | The upgrade options for version upgrade       |

### SQLiteVersionUpgrade
| Prop              | Type                     | Description                                           |
| ----------------- | ------------------------ | ----------------------------------------------------- |
| **`fromVersion`** | <code>number</code>      | The current database version                          |
| **`toVersion`**   | <code>number</code>      | The new database version                              |
| **`statement`**   | <code>string</code>      | A SQL statement defining the schemas                  |
| **`set`**         | <code>SQLiteSet[]</code> | Batch of raw SQL statements as Array of capSQLLiteSet |

### SQLiteSet 
| Prop              | Type                  | Description                                             |
| ----------------- | --------------------- | ------------------------------------------------------- |
| **`statement`**   | <code>string</code>   | A SQL statement                                         |
| **`values`**      | <code>any[]</code>    | An array of data values list                            |

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

### SQLiteSyncDate {
| Prop            | Type                 | Description                                             |
| --------------- | -------------------- | ------------------------------------------------------- |
| **`syncDate`**  | <code>number</code>  | Returned the stored synchronization date                |

### SQLiteJson {
| Prop          | Type                     | Description                                           |
| ------------- | ------------------------ | ----------------------------------------------------- |
| **`export`**  | <code>JsonSQLite</code>  | Returned an export JSON object                        |

### JsonProgressListener {
| Prop            | Type                 | Description                                           |
| --------------- | -------------------- | ----------------------------------------------------- |
| **`progress`**  | <code>string</code>  | Progress message for importFromJson or exportToJson   |


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

<!-- Auto Generated Below -->


## Events

| Event                      | Description | Type                                |
| -------------------------- | ----------- | ----------------------------------- |
| `jeepSqliteExportProgress` |             | `CustomEvent<JsonProgressListener>` |
| `jeepSqliteImportProgress` |             | `CustomEvent<JsonProgressListener>` |


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



### `copyFromAssets() => Promise<void>`



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



### `getSyncDate(options: SQLiteSyncDateOptions) => Promise<SQLiteSyncDate>`



#### Returns

Type: `Promise<SQLiteSyncDate>`



### `getVersion(options: SQLiteOptions) => Promise<SQLiteVersion>`



#### Returns

Type: `Promise<SQLiteVersion>`



### `importFromJson(options: SQLiteImportOptions) => Promise<SQLiteChanges>`



#### Returns

Type: `Promise<SQLiteChanges>`



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



### `setSyncDate(options: SQLiteSyncDateOptions) => Promise<void>`



#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
