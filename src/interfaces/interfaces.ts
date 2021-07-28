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
}
export interface AllConnectionsOptions {
  /**
   * the dbName of all connections
   */
  dbNames?: string[];
}
export interface SQLiteOptions {
  /**
   * The database name
   */
  database?: string;
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
}
export interface SQLiteValues {
  /**
   * the data values list as an Array
   */
  values?: any[];
}
