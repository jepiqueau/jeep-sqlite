export interface EchoOptions {
  /**
   *  String to be echoed
   */
  value?: string;
}
export interface ConnectionOptions {
  /**
   * The database name
   */
  database?: string;
  /**
   * The database  version
   */
  version?: number;
  /**
   * Set to true (database encryption) / false
   */
  encrypted?: boolean;
  /**
   * Set the mode for database encryption
   * ["encryption", "secret", "newsecret"]
   */
  mode?: string;
  /**
   * Set to true (database in read-only mode) / false
   */
  readonly?: boolean;

}
export interface AllConnectionsOptions {
  /**
   * the dbName of all connections
   */
  dbNames?: string[];
  /**
   * the openMode ("RW" read&write, "RO" readonly) of all connections
   */

  openModes?: string[];
}
export interface SQLiteOptions {
  /**
   * The database name
   */
  database?: string;
  /**
   * Set to true (database in read-only mode) / false
   */
  readonly?: boolean;
}
export interface SQLiteExecuteOptions {
  /**
   * The database name
   */
  database?: string;
  /**
   * The batch of raw SQL statements as string
   */
  statements?: string;
  /**
   * Enable / Disable transactions
   * default Enable (true)
   */
  transaction?: boolean;
  /**
   * Set to true (database in read-only mode) / false
   */
  readonly?: boolean;

}
export interface SQLiteSetOptions {
  /**
   * The database name
   */
  database?: string;
  /**
   * The batch of raw SQL statements as Array of capSQLLiteSet
   */
  set?: SQLiteSet[];
  /**
   * Enable / Disable transactions
   * default Enable (true)
   */
  transaction?: boolean;
  /**
   * Set to true (database in read-only mode) / false
   */
  readonly?: boolean;
  /**
   * return mode
   * default 'no'
   * value 'all'
   * value 'one' for Electron platform
   * @since 5.0.5-3
   */
  returnMode?: string;

}
export interface SQLiteRunOptions {
  /**
   * The database name
   */
  database?: string;
  /**
   * A statement
   */
  statement?: string;
  /**
   * A set of values for a statement
   */
  values?: any[];
  /**
   * Enable / Disable transactions
   * default Enable (true)
   */
  transaction?: boolean;
  /**
   * Set to true (database in read-only mode) / false
   */
  readonly?: boolean;
  /**
   * return mode
   * default 'no'
   * value 'all'
   * value 'one' for Electron platform
   * @since 5.0.5-3
   */
  returnMode?: string;

}
export interface SQLiteQueryOptions {
  /**
   * The database name
   */
  database?: string;
  /**
   * A statement
   */
  statement?: string;
  /**
   * A set of values for a statement
   */
  values?: any[];
  /**
   * Set to true (database in read-only mode) / false
   */
  readonly?: boolean;
}
export interface SQLiteSyncDateOptions {
  /**
   * The database name
   */
  database?: string;
  /**
   * Set the synchronization date
   * Format yyyy-MM-dd'T'HH:mm:ss.SSSZ
   */
  syncdate?: string;
  /**
   * Set to true (database in read-only mode) / false
   */
  readonly?: boolean;
}
export interface SQLiteTableOptions {
  /**
   * The database name
   */
  database?: string;
  /**
   * The table name
   */
  table?: string;
  /**
   * Set to true (database in read-only mode) / false
   */
  readonly?: boolean;
}

export interface SQLiteImportOptions {
  /**
   * Set the JSON object to import
   *
   */
  jsonstring?: string;
}
export interface SQLiteExportOptions {
  /**
   * The database name
   */
  database?: string;
  /**
   * Set the mode to export JSON Object:
   * "full" or "partial"
   *
   */
  jsonexportmode?: string;
  /**
   * Set to true (database in read-only mode) / false
   */
  readonly?: boolean;
}
export interface SQLiteUpgradeOptions {
  /**
   * The database name
   */
  database?: string;
  /**
   * The upgrade options for version upgrade
   * Array of length 1 to easiest the iOS plugin
   */
  upgrade?: SQLiteVersionUpgrade[];
}
export interface SQLiteVersionUpgrade {
  toVersion: number;
  statements: string[];
}

export interface SQLiteSet {
  /**
   * A statement
   */
  statement?: string;
  /**
   * the data values list as an Array
   */
  values?: any[];
}
export interface SQLiteHTTPOptions {
  /**
   * The url
   */
  url?: string;
  /**
   * the overwrite value true/false default true
   */
  overwrite?: boolean;
}
export interface SQLiteLocalDiskOptions {
  /**
   * the overwrite value true/false default true
   */
  overwrite?: boolean;
}
export interface EchoResult {
  /**
   * String returned
   */
  value?: string;
}
export interface SQLiteResult {
  /**
   * result set to true when successful else false
   */
  result?: boolean;
}
export interface SQLiteVersion {
  /**
   * the returned database version
   */
  version?: number;
}

export interface SQLiteChanges {
  /**
   * a returned Changes
   */
  changes?: Changes;
}
export interface Changes {
  /**
   * the number of changes from an execute or run command
   */
  changes?: number;
  /**
   * the lastId created from a run command
   */
  lastId?: number;
  /**
   * values when RETURNING
   */
  values?: any[];

}
export interface SQLiteValues {
  /**
   * the data values list as an Array
   */
  values?: any[];
}
export interface SQLiteSyncDate {
  /**
   * the synchronization date
   */
  syncDate?: number;
}
export interface  SQLiteFromAssetsOptions {
  /**
   * the overwrite value true/false default true
   */
  overwrite?: boolean;
}
export interface SQLiteJson {
  /**
   * an export JSON object
   */
  export?: JsonSQLite;
}
/* JSON Types */
export interface JsonSQLite {
  /**
   * The database name
   */
  database: string;
  /**
   *  The database version
   */
  version: number;
  /**
   * Delete the database prior to import (default false)
   */
  overwrite?: boolean;
   /**
   * Set to true (database encryption) / false
   */
  encrypted: boolean;
  /***
   * Set the mode
   * ["full", "partial"]
   */
  mode: string;
  /***
   * Array of Table (JsonTable)
   */
  tables: JsonTable[];
  /***
   * Array of View (JsonView)
   */
  views?: JsonView[];
  }
export interface JsonTable {
  /**
   * The database name
   */
  name: string;
  /***
   * Array of Schema (JsonColumn)
   */
  schema?: JsonColumn[];
  /***
   * Array of Index (JsonIndex)
   */
  indexes?: JsonIndex[];
  /***
   * Array of Trigger (JsonTrigger)
   */
  triggers?: JsonTrigger[];
  /***
   * Array of Table data
   */
  values?: any[][];
}
export interface JsonColumn {
  /**
   * The column name
   */
  column?: string;
  /**
   * The column data (type, unique, ...)
   */
  value: string;
  /**
   * The column foreign key constraints
   */
  foreignkey?: string;
   /**
   * the column constraint
   */
  constraint?: string;
}
export interface JsonTrigger {
  /**
   * The trigger name
   */
  name: string;
  /**
   * The trigger time event fired
   */
  timeevent: string;

  /**
   * The trigger condition
   */
  condition?: string;

  /**
   * The logic of the trigger
   */
  logic: string;
}
export interface JsonIndex {
  /**
   * The index name
   */
  name: string;
  /**
   * The value of the index can have the following formats:
   * email
   * email ASC
   * email, MobileNumber
   * email ASC, MobileNumber DESC
   */
  value: string;
  /**
   * the mode (Optional)
   * UNIQUE
   */
  mode?: string;
}
export interface JsonProgressListener {
  /**
   * Progress message
   */
  progress?: string;
}
export interface HTTPRequestEndedListener {
  /**
   * Message
   */
  message?: string;
}
export interface PickOrSaveDatabaseEndedListener {
  /**
   * Pick Database's name
   */
  db_name?: string;
  /**
   * Message
   */
  message?: string;
}
export interface ButtonOptions {
  top?: string;
  right?: string;
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  padding?: string;
}

export interface JsonView {
  /**
   * The view name
   */
  name: string;
  /**
   * The view statement
   */
  value: string;
}
