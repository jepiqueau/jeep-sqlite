import { UtilsDrop } from '../utils/utils-drop';
import { UtilsJSON } from '../utils/utils-json';
import { UtilsDelete } from './utils-delete';
import { UtilsSQLStatement } from './utils-sqlstatement';
export class UtilsSQLite {
  static async beginTransaction(db: any, isOpen: boolean): Promise<boolean> {
      const msg = 'BeginTransaction: ';
      if (!isOpen) {
        return Promise.reject(new Error(`${msg}database not opened`));
      }
      const sql = 'BEGIN TRANSACTION;';
      try {
        db.exec(sql);
        return Promise.resolve(true);
      } catch (err) {
        return Promise.reject(new Error(`${msg}${err.message}`));
      }
  }
  static async rollbackTransaction(db: any, isOpen: boolean): Promise<boolean>
   {
      const msg = 'RollbackTransaction: ';
      if (!isOpen) {
        return Promise.reject(new Error(`${msg}database not opened`));
      }
      const sql = 'ROLLBACK;';
      try {

        db.exec(sql);
        return Promise.resolve(false);
      } catch(err) {
        return Promise.reject(new Error(`${msg}${err.message}`));
      }
  }
  static async commitTransaction(db: any, isOpen: boolean): Promise<boolean> {
      const msg = 'CommitTransaction: ';
      if (!isOpen) {
        return Promise.reject(new Error(`${msg}database not opened`));
      }
      const sql = 'COMMIT;';
      try {
        db.exec(sql);
        return Promise.resolve(false);
      } catch(err) {
        return Promise.reject(new Error(`${msg}${err.message}`));
      }
  }
  static async dbChanges(db: any): Promise<number> {
      const SELECT_CHANGE = 'SELECT total_changes()';
      let changes: number = 0;
      try {
        const res = db.exec(SELECT_CHANGE);
        // process the row here
        changes = res[0].values[0][0];
        return Promise.resolve(changes);
      } catch (err) {
        return Promise.reject(new Error(`DbChanges failed: ${err.message}`));
      }
  }
  static async getLastId(db: any): Promise<number> {
      const SELECT_LAST_ID = 'SELECT last_insert_rowid()';
      let lastId: number = -1;
      try {
        const res = db.exec(SELECT_LAST_ID );
        // process the row here
        lastId = res[0].values[0][0];
        return Promise.resolve(lastId);
      } catch (err) {
        return Promise.reject(new Error(`GetLastId failed: ${err.message}`));
      }

  }
  static async setForeignKeyConstraintsEnabled(db: any, toggle: boolean): Promise<void> {
    let stmt = 'PRAGMA foreign_keys=OFF';
    if (toggle) {
      stmt = 'PRAGMA foreign_keys=ON';
    }
    try {
      db.run(stmt);
      return Promise.resolve();
    } catch (err) {
      const msg = err.message ? err.message : err;
      return Promise.reject(new Error(`SetForeignKey: ${msg}`));
    }
  }
  static async getVersion(db: any): Promise<number> {
    let version = 0;
    try {
      const res = db.exec('PRAGMA user_version;');
      version = res[0].values[0][0];
      return Promise.resolve(version);
    } catch (err) {
      return Promise.reject(new Error(`GetVersion: ${err.message}`));
    }
  }
  static async  setVersion(db: any, version: number): Promise<void> {
    try {
      db.exec(`PRAGMA user_version = ${version}`);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(new Error(`SetVersion: ${err.message}`));
    }
  }

  static async  execute(db: any, sql: string, fromJson: boolean):
                                                   Promise<number> {
    try {
      var sqlStmt = sql;
      // Check for DELETE FROM in sql string
      if(!fromJson && sql.toLowerCase().includes('DELETE FROM'.toLowerCase())) {
        sqlStmt = sql.replace(/\n/g,'');
        let sqlStmts: string[] = sqlStmt.split(';');
        var resArr: string[] = [];
        for ( const stmt of sqlStmts) {
          const trimStmt = stmt.trim().substring(0,11).toUpperCase();
          if( trimStmt === 'DELETE FROM' && stmt.toLowerCase().includes('WHERE'.toLowerCase())) {
            const whereStmt = stmt.trim();
            const rStmt = await UtilsSQLite.deleteSQL(db, whereStmt, []);
            resArr.push(rStmt);
          } else {
            resArr.push(stmt);
          }
        }
        sqlStmt = resArr.join(';');
      }
      db.exec(sqlStmt);
      const changes = await UtilsSQLite.dbChanges(db);
      return Promise.resolve(changes);
    } catch (err) {
      return Promise.reject(new Error(`Execute: ${err.message}`));
    }
  }
  static async executeSet(db: any, set: any, fromJson: boolean,
                          returnMode: string): Promise<any> {
    const retValues = [];
    let lastId: number = -1;
    let retObj: any = {};
    for (let i = 0; i < set.length; i++) {
      const statement = 'statement' in set[i] ? set[i].statement : null;
      const values =
        'values' in set[i] && set[i].values.length > 0 ? set[i].values : [];
      if (statement == null) {
        let msg = 'ExecuteSet: Error No statement';
        msg += ` for index ${i}`;
        return Promise.reject(new Error(msg));
      }
      try {

        if (Array.isArray(values[0])) {
          for (const val of values) {
            const mVal: any[] = await UtilsSQLite.replaceUndefinedByNull(val);
            retObj = await UtilsSQLite.run(db, statement, mVal, fromJson, returnMode)
            lastId = retObj["lastId"];
            if(Object.keys(retObj).includes("values") && retObj["values"].length > 0) {
              retValues.push(retObj["values"]);
            }
          }
        } else {
          const mVal: any[] = await UtilsSQLite.replaceUndefinedByNull(values);
          retObj = await UtilsSQLite.run(db, statement, mVal, fromJson, returnMode)
          lastId = retObj["lastId"];
          if(Object.keys(retObj).includes("values") && retObj["values"].length > 0) {
            retValues.push(retObj["values"]);
          }
        }
      } catch (err) {
        return Promise.reject(new Error(`ExecuteSet: ${err.message}`));
      }
    }
    retObj["lastId"] = lastId;
    retObj["values"] = returnMode === 'all' ? retValues :
                      returnMode === 'one' ? retValues[0] : [];
    return Promise.resolve(retObj);
  }
  static async queryAll(db: any, sql: string, values: any[]): Promise<any[]> {
    try {
      let retArr: any[] = [];
      if(values != null && values.length > 0) {
        retArr = db.exec(sql, values);
      } else {
        retArr = db.exec(sql);
      }
      if(retArr.length == 0) return Promise.resolve([]);
      const result = retArr[0].values.map(entry => {
        const obj = {};
        retArr[0].columns.forEach((column: string, index: number) => {
          obj[column] = entry[index];
        });
        return obj;
      });

      return Promise.resolve(result);
    } catch (err) {
      return Promise.reject(new Error(`queryAll: ${err.message}`));
    }
  }
  static async run(db: any, statement: string, values: any[], fromJson: boolean,
                            returnMode: string): Promise<any> {
    let stmtType: string = statement.replace(/\n/g,"").trim().substring(0,6).toUpperCase();
    let sqlStmt: string = statement
    let retValues : any[] = [];
    let retObj: any = {};
    try {
      if (!fromJson && stmtType === "DELETE") {
        sqlStmt = await UtilsSQLite.deleteSQL(db, statement, values);
      }
      const mValues = values ? values : [];
      if(mValues.length > 0) {
        const mVal: any[] = await UtilsSQLite.replaceUndefinedByNull(mValues);
        const res = db.exec(sqlStmt, mVal);
        if(returnMode === "all" || returnMode === "one") {
          if(res && res.length > 0) {
            retValues = UtilsSQLite.getReturnedValues(res[0], returnMode);
          } else {
            return Promise.reject(new Error(`run: ${sqlStmt} does not returned any change`));
          }
        }
      } else {
        const res = db.exec(sqlStmt);
        if(returnMode === "all" || returnMode === "one") {
          if(res && res.length > 0) {
            retValues = UtilsSQLite.getReturnedValues(res[0], returnMode);
          } else {
            return Promise.reject(new Error(`run: ${sqlStmt} does not returned any change`));
          }
        }
      }
      const lastId = await UtilsSQLite.getLastId(db);
      retObj["lastId"] = lastId;
      if(retValues != null && retValues.length > 0) retObj["values"] = retValues;
      return Promise.resolve(retObj);

    } catch (err) {
      return Promise.reject(new Error(`run: ${err.message}`));
    }
  }
  static getReturnedValues(result : any, returnMode: string) : any[] {
    const retValues: any[] = [];
    for ( let i: number =0; i < result.values.length; i++) {
      let row: any = {}
      for( let j: number = 0; j < result.columns.length; j++) {
        row[result.columns[j]] = result.values[i][j];
      }
      retValues.push(row);
      if(returnMode === 'one') break;
    }
    return retValues
  }
  static async  deleteSQL(db: any, statement: string,
                          values: any[]): Promise<string> {
    let sqlStmt: string = statement;
    try {
        const isLast = await UtilsSQLite.isLastModified(db,true);
        const isDel = await UtilsSQLite.isSqlDeleted(db,true);
        if(!isLast || !isDel) {
          return sqlStmt;
        }
        // Replace DELETE by UPDATE
        // set sql_deleted to 1 and the last_modified to
        // timenow
        const whereClause = UtilsSQLStatement.extractWhereClause(sqlStmt);
        if (!whereClause) {
          const msg: string = 'deleteSQL: cannot find a WHERE clause';
          return Promise.reject(new Error(`${msg}`));
        }
        const tableName = UtilsSQLStatement.extractTableName(sqlStmt);
        if (!tableName) {
          const msg: string = 'deleteSQL: cannot find a WHERE clause';
          return Promise.reject(new Error(`${msg}`));
        }
        const colNames = UtilsSQLStatement.extractColumnNames(whereClause);
        if (colNames.length === 0) {
          const msg = 'deleteSQL: Did not find column names in the WHERE Statement';
          return Promise.reject(new Error(`${msg}`));
        }
        const setStmt = 'sql_deleted = 1';
        // Find REFERENCES if any and update the sql_deleted
        // column
        const hasToUpdate = await UtilsDelete.findReferencesAndUpdate(
          db,
          tableName,
          whereClause,
          colNames,
          values
        );
        if (hasToUpdate) {
          const whereStmt = whereClause.endsWith(';')
            ? whereClause.slice(0, -1)
            : whereClause;
          sqlStmt = `UPDATE ${tableName} SET ${setStmt} WHERE ${whereStmt} AND sql_deleted = 0;`;
        } else {
          sqlStmt = '';
        }
        return Promise.resolve(sqlStmt);
    } catch (err) {
      let msg = err.message ? err.message : err;
      return Promise.reject(new Error(`deleteSQL: ${msg}`));
    }
  }

  static async getTableList(db:any): Promise<any[]> {
    try {
      const result = await UtilsDrop.getTablesNames(db)
      return Promise.resolve(result);
    } catch (err) {
      return Promise.reject(new Error(`getTableList: ${err.message}`));
    }
  }
  static async isTableExists(db: any, tableName: string): Promise<boolean> {
    try {
      let statement = 'SELECT name FROM sqlite_master WHERE ';
      statement += `type='table' AND name='${tableName}';`;
      const res = await UtilsSQLite.queryAll(db,statement,[]);
      const ret: boolean = res.length > 0 ? true : false;
      return Promise.resolve(ret);
    } catch (err) {
      return Promise.reject(new Error(`isTableExists: ${err.message}`));
    }
  }
  /**
   * isLastModified
   * @param db
   * @param isOpen
   */
  static async  isLastModified(db: any,isOpen: boolean): Promise<boolean> {
      if (!isOpen) {
        return Promise.reject('isLastModified: database not opened');
      }
      try {
        const tableList: string[] = await UtilsDrop.getTablesNames(db);
        for( const table of tableList) {
          const tableNamesTypes: any = await UtilsJSON
                                  .getTableColumnNamesTypes(db, table);
          const tableColumnNames: string[] = tableNamesTypes.names;
          if(tableColumnNames.includes("last_modified")) {
            return Promise.resolve(true);
          }
        }
      } catch (err) {
        return Promise.reject(`isLastModified: ${err}`);
      }
  }
  /**
   * isSqlDeleted
   * @param db
   * @param isOpen
   */
  static async  isSqlDeleted(db: any,isOpen: boolean): Promise<boolean> {
    if (!isOpen) {
      return Promise.reject('isSqlDeleted: database not opened');
    }
    try {
      const tableList: string[] = await UtilsDrop.getTablesNames(db);
      for( const table of tableList) {
        const tableNamesTypes: any = await UtilsJSON
                        .getTableColumnNamesTypes(db, table);
        const tableColumnNames: string[] = tableNamesTypes.names;
        if(tableColumnNames.includes("sql_deleted")) {
          return Promise.resolve(true);
        }
      }
    } catch (err) {
      return Promise.reject(`isSqlDeleted: ${err}`);
    }
  }
  static async  replaceUndefinedByNull(values: any[]): Promise<any[]> {
    const retValues: any[] = [];
    for( const val of values) {
      let mVal: any = val;
      if( typeof val === 'undefined') mVal = null;
      retValues.push(mVal);
    }
    return Promise.resolve(retValues);
  }
  static async backupTables(db: any): Promise<Record<string, string[]>> {
    const msg = 'BackupTables: ';
    let alterTables: Record<string, string[]> = {};
    try {
      const tables: string[] = await UtilsDrop.getTablesNames(db);
      for (const table of tables) {
        try {
          const colNames: string[] = await UtilsSQLite.backupTable(db, table);
          alterTables[`${table}`] = colNames;
        } catch (err) {
          return Promise.reject(
            new Error(`${msg}table ${table}: ` + `${err.message}`),
          );
        }
      }
      return Promise.resolve(alterTables);
    } catch (err) {
      return Promise.reject(new Error(`BackupTables: ${err.message}`));
    }
  }
  static async  backupTable(db: any, table: string): Promise<string[]> {
    try {
      // start a transaction
      await UtilsSQLite.beginTransaction(db, true);
      // get the table's column names
      const colNames: string[] = await UtilsSQLite.getTableColumnNames(db, table);
      const tmpTable = `_temp_${table}`;
      // Drop the tmpTable if exists
      const delStmt = `DROP TABLE IF EXISTS ${tmpTable};`;
      await UtilsSQLite.run(db, delStmt, [], false, 'no');
    // prefix the table with _temp_
      let stmt = `ALTER TABLE ${table} RENAME `;
      stmt += `TO ${tmpTable};`;
      const lastId: number = await UtilsSQLite.run(db, stmt, [], false, 'no');
      if (lastId < 0) {
        let msg = 'BackupTable: lastId < 0';
        try {
          await UtilsSQLite.rollbackTransaction(db, true);
        } catch (err) {
          msg += `: ${err.message}`;
        }
        return Promise.reject(new Error(`${msg}`));
      } else {
        try {
          await UtilsSQLite.commitTransaction(db, true);
          return Promise.resolve(colNames);
        } catch (err) {
          return Promise.reject(new Error('BackupTable: ' + `${err.message}`));
        }
      }
    } catch (err) {
      return Promise.reject(new Error(`BackupTable: ${err.message}`));
    }
  }
  static async  getTableColumnNames(db: any, tableName: string): Promise<string[]> {
    let resQuery: any[] = [];
    const retNames: string[] = [];
    const query = `PRAGMA table_info('${tableName}');`;
    try {
      resQuery = await UtilsSQLite.queryAll(db, query, []);
      if (resQuery.length > 0) {
        for (const query of resQuery) {
          retNames.push(query.name);
        }
      }
      return Promise.resolve(retNames);
    } catch (err) {
      return Promise.reject(
        new Error('GetTableColumnNames: ' + `${err.message}`),
      );
    }
  }
  static async  findCommonColumns(db: any, alterTables: Record<string, string[]> ):
                              Promise<Record<string, string[]>> {
    let commonColumns : Record<string, string[]> = {};
    try {
      // Get new table list
      const tables: any[] = await UtilsDrop.getTablesNames(db);
      if (tables.length === 0) {
        return Promise.reject(
          new Error('FindCommonColumns: get ' + "table's names failed"),
        );
      }
      for (const table of tables) {
        // get the column's name
        const tableNames: any = await UtilsSQLite.getTableColumnNames(db, table);
        // find the common columns
        const keys: string[] = Object.keys(alterTables);
        if (keys.includes(table)) {
          commonColumns[table] = UtilsSQLite.arraysIntersection(alterTables[table], tableNames);
        }
      }
      return Promise.resolve(commonColumns);
    } catch (err) {
      return Promise.reject(new Error(`FindCommonColumns: ${err.message}`));
    }
  }
  static arraysIntersection(a1: any[], a2: any[]): any[] {
    if (a1 != null && a2 != null) {
      const first = new Set(a1);
      const second = new Set(a2);
      return [...first].filter(item => second.has(item));
    } else {
      return [];
    }
  }

  static async updateNewTablesData(db: any, commonColumns: Record<string, string[]> ): Promise<void> {
    try {
      // start a transaction
      await UtilsSQLite.beginTransaction(db, true);

      const statements: string[] = [];
      const keys: string[] = Object.keys(commonColumns);
      keys.forEach(key => {
        const columns = commonColumns[key].join(',');
        let stmt = `INSERT INTO ${key} `;
        stmt += `(${columns}) `;
        stmt += `SELECT ${columns} FROM _temp_${key};`;
        statements.push(stmt);
      });
      const changes: number = await UtilsSQLite.execute(db, statements.join('\n'), false);
      if (changes < 0) {
        let msg: string = 'updateNewTablesData: ' + 'changes < 0';
        try {
          await UtilsSQLite.rollbackTransaction(db, true);
        } catch (err) {
          msg += `: ${err.message}`;
        }
        return Promise.reject(new Error(`${msg}`));
      } else {
        try {
          await UtilsSQLite.commitTransaction(db, true);
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(
            new Error('updateNewTablesData: ' + `${err.message}`),
          );
        }
      }
    } catch (err) {
      return Promise.reject(
        new Error('updateNewTablesData: ' + `${err.message}`),
      );
    }
  }

}
