import { getTablesNames } from '../utils/utils-drop';
import { getTableColumnNamesTypes } from '../utils/utils-json';

export const beginTransaction = async (db: any, isOpen: boolean): Promise<void> => {
    const msg = 'BeginTransaction: ';
    if (!isOpen) {
      return Promise.reject(new Error(`${msg}database not opened`));
    }
    const sql = 'BEGIN TRANSACTION;';
    try {
      db.exec(sql);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(new Error(`${msg}${err.message}`));
    }
}
export const rollbackTransaction = async (db: any, isOpen: boolean): Promise<void> => {
    const msg = 'RollbackTransaction: ';
    if (!isOpen) {
      return Promise.reject(new Error(`${msg}database not opened`));
    }
    const sql = 'ROLLBACK TRANSACTION;';
    try {

      db.exec(sql);
      return Promise.resolve();
    } catch(err) {
      return Promise.reject(new Error(`${msg}${err.message}`));
    }
}
export const commitTransaction = async (db: any, isOpen: boolean): Promise<void> => {
    const msg = 'CommitTransaction: ';
    if (!isOpen) {
      return Promise.reject(new Error(`${msg}database not opened`));
    }
    const sql = 'COMMIT TRANSACTION;';
    try {
      db.exec(sql);
      return Promise.resolve();
    } catch(err) {
      return Promise.reject(new Error(`${msg}${err.message}`));
    }
}
export const dbChanges = async (db: any): Promise<number> => {
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
export const getLastId = async (db: any): Promise<number> => {
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
export const setForeignKeyConstraintsEnabled = async (db: any, toggle: boolean): Promise<void> => {
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
export const getVersion = async (db: any): Promise<number> => {
  let version = 0;
  try {
    const res = db.exec('PRAGMA user_version;');
    version = res[0].values[0][0];
    return Promise.resolve(version);
  } catch (err) {
    return Promise.reject(new Error(`GetVersion: ${err.message}`));
  }
}
export const setVersion = async (db: any, version: number): Promise<void> => {
  try {
    db.exec(`PRAGMA user_version = ${version}`);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(new Error(`SetVersion: ${err.message}`));
  }
}

export const execute = async (db: any, sql: string, fromJson: boolean): Promise<number> => {
  let changes = -1;
  let initChanges = -1;
  try {
    initChanges = await dbChanges(db);
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
          const rStmt = await deleteSQL(db, whereStmt, []);
          resArr.push(rStmt);
        } else {
          resArr.push(stmt);
        }
      }
      sqlStmt = resArr.join(';');
    }
    db.exec(sqlStmt);
    changes = (await dbChanges(db)) - initChanges;
    return Promise.resolve(changes);
  } catch (err) {
    return Promise.reject(new Error(`Execute: ${err.message}`));
  }
}
export const executeSet = async (db: any, set: any, fromJson: boolean, returnMode: string): Promise<any> =>  {
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
          const mVal: any[] = await replaceUndefinedByNull(val);
          retObj = await run(db, statement, mVal, fromJson, returnMode)
          lastId = retObj["lastId"];
          if(Object.keys(retObj).includes("values") && retObj["values"].length > 0) {
            retValues.push(retObj["values"]);
          }
        }
      } else {
        const mVal: any[] = await replaceUndefinedByNull(values);
        retObj = await run(db, statement, mVal, fromJson, returnMode)
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
export const queryAll = async (db: any, sql: string, values: any[]): Promise<any[]> => {
  const result: any[] = [];
  try {
    let retArr: any[] = [];
    if(values != null && values.length > 0) {
      retArr = db.exec(sql, values);
    } else {
      retArr = db.exec(sql);
    }
    if(retArr.length == 0) return Promise.resolve([]);
    for( const valRow of retArr[0].values) {
      const row: any = {};
      for (let i = 0; i < retArr[0].columns.length; i++) {
        row[retArr[0].columns[i]] = valRow[i];
      }
      result.push(row);
    }
    return Promise.resolve(result);
  } catch (err) {
    return Promise.reject(new Error(`queryAll: ${err.message}`));
  }
}
export const run = async (db: any, statement: string, values: any[], fromJson: boolean,
                          returnMode: string): Promise<any> => {
  let stmtType: string = statement.replace(/\n/g,"").trim().substring(0,6).toUpperCase();
  let sqlStmt: string = statement
  let retValues : any[] = [];
  let retObj: any = {};
  try {
    if (!fromJson && stmtType === "DELETE") {
      sqlStmt = await deleteSQL(db, statement, values);
    }
    const mValues = values ? values : [];
    if(mValues.length > 0) {
      const mVal: any[] = await replaceUndefinedByNull(mValues);
      const res = db.exec(sqlStmt, mVal);
      if(returnMode === "all" || returnMode === "one") {
        if(res && res.length > 0) {
          retValues = getReturnedValues(res[0], returnMode);
        } else {
          return Promise.reject(new Error(`run: ${sqlStmt} does not returned any change`));
        }
      }
    } else {
      const res = db.exec(sqlStmt);
      if(returnMode === "all" || returnMode === "one") {
        if(res && res.length > 0) {
          retValues = getReturnedValues(res[0], returnMode);
        } else {
          return Promise.reject(new Error(`run: ${sqlStmt} does not returned any change`));
        }
      }
    }
    const lastId = await getLastId(db);
    retObj["lastId"] = lastId;
    if(retValues != null && retValues.length > 0) retObj["values"] = retValues;
    return Promise.resolve(retObj);

  } catch (err) {
    return Promise.reject(new Error(`run: ${err.message}`));
  }
}
const getReturnedValues = (result : any, returnMode: string) : any[] => {
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
export const deleteSQL= async (db: any, statement: string,
                               values: any[]): Promise<string> => {
  let sqlStmt: string = statement;
  try {
    const isLast: boolean = await isLastModified(db, true);
    const isDel: boolean = await isSqlDeleted(db, true);
    if(isLast && isDel) {
      // Replace DELETE by UPDATE and set sql_deleted to 1
      const wIdx: number = statement.toUpperCase().indexOf("WHERE");
      const preStmt: string = statement.substring(0, wIdx - 1);
      const clauseStmt: string = statement.substring(wIdx, statement.length);
      const tableName: string = preStmt.substring(("DELETE FROM").length).trim();
      sqlStmt = `UPDATE ${tableName} SET sql_deleted = 1 ${clauseStmt}`;
      // Find REFERENCES if any and update the sql_deleted column
      await findReferencesAndUpdate(db, tableName, clauseStmt, values);
    }
    return Promise.resolve(sqlStmt);

  } catch (err) {
    return Promise.reject(new Error(`deleteSQL: ${err.message}`));
  }
}
export const findReferencesAndUpdate = async (db: any, tableName: string,
                                              whereStmt: string,
                                              values: any[]): Promise<void> => {
  try {
    const references = await getReferences(db, tableName);
    const tableNameWithRefs = references.pop();
    for ( const refe of references) {
      // get the tableName of the reference
      const refTable: string = await getReferencedTableName(refe );
      if (refTable.length <= 0) {
          continue;
      }
      // get the with references columnName
      const withRefsNames: string[] = await getWithRefsColumnName(refe);
      if (withRefsNames.length <= 0) {
          continue;
      }
      // get the referenced columnName
      const colNames: string[] = await getReferencedColumnName(refe);
      if (colNames.length <= 0) {
          continue;
      }
      // update the where clause
      const uWhereStmt: string = await updateWhere(whereStmt, withRefsNames, colNames);
      if (uWhereStmt.length <= 6) {
          continue;
      }
      let updTableName: string = tableNameWithRefs;
      let updColNames: string[] = colNames;
      if (tableNameWithRefs === tableName) {
        updTableName = refTable;
        updColNames = withRefsNames;
      }
      //update sql_deleted for this reference
      const stmt: string = "UPDATE " + updTableName + " SET sql_deleted = 1 " + uWhereStmt;
      if(values != null && values.length > 0) {
        const mVal: any[] = await replaceUndefinedByNull(values);
        let arrVal: string[] = whereStmt.split('?');
        if (arrVal[arrVal.length-1] === ';') arrVal = arrVal.slice(0,-1);
        let selValues: any[] = [];
        for (const [j,val] of arrVal.entries()) {
          for (let i = 0; i < updColNames.length; i++) {
            const idxVal = val.indexOf(updColNames[i]);
            if(idxVal > -1) {
              selValues.push(mVal[j]);
            }
          }
        }
        db.exec(stmt, selValues);
      } else {
        db.exec(stmt);
      }
      const lastId: number = await getLastId(db);
      if (lastId == -1) {
          const msg = `UPDATE sql_deleted failed for references table: ${refTable}`;
          return Promise.reject(new Error(`findReferencesAndUpdate: ${msg}`));
        }

    }
    return;
  } catch (err) {
    return Promise.reject(new Error(`findReferencesAndUpdate: ${err.message}`));
  }
}
export const getReferencedTableName = async (refValue: string): Promise<string> => {
  var tableName: string = '';

  if (refValue.length > 0) {
    const arr: string[] = refValue.split(new RegExp('REFERENCES','i'));
    if (arr.length === 2) {
      const oPar: number = arr[1].indexOf("(");
      tableName = arr[1].substring(0, oPar).trim();
    }
  }
  return tableName;
}

export const  getReferencedColumnName = async (refValue: string): Promise<string[]> => {
  let colNames: string[] = [];
  if (refValue.length > 0) {
    const arr: string[] = refValue.split(new RegExp('REFERENCES','i'));
    if (arr.length === 2) {
      const oPar: number = arr[1].indexOf("(");
      const cPar: number = arr[1].indexOf(")");
      const colStr = arr[1].substring(oPar + 1, cPar).trim();
      colNames = colStr.split(',');
    }
  }
  return colNames;
}
export const  getWithRefsColumnName = async (refValue: string): Promise<string[]> => {
  let colNames: string[] = [];
  if (refValue.length > 0) {
    const arr: string[] = refValue.split(new RegExp('REFERENCES','i'));
    if (arr.length === 2) {
      const oPar: number = arr[0].indexOf("(");
      const cPar: number = arr[0].indexOf(")");
      const colStr = arr[0].substring(oPar + 1, cPar).trim();
      colNames = colStr.split(',');
    }
  }
  return colNames;
}

export const updateWhere = async (whStmt: string, withRefsNames: string[], colNames: string[]): Promise<string> => {
  var whereStmt = '';
  if (whStmt.length > 0) {
    const index: number = whStmt.toLowerCase().indexOf("WHERE".toLowerCase());
    const stmt: string = whStmt.substring(index + 6);
    if(withRefsNames.length === colNames.length) {
      for(let i = 0; i < withRefsNames.length; i++) {
        let colType: string = 'withRefsNames';
        let idx = stmt.indexOf(withRefsNames[i]);
        if (idx === -1) {
          idx = stmt.indexOf(colNames[i]);
          colType = 'colNames';
        }
        if (idx > -1) {
          let valStr = "";
          const fEqual = stmt.indexOf("=",idx);
          if (fEqual > -1) {
            const iAnd = stmt.indexOf("AND",fEqual);
            const ilAnd = stmt.indexOf("and",fEqual);
            if (iAnd > -1) {
              valStr = (stmt.substring(fEqual + 1, iAnd - 1)).trim();
            } else if (ilAnd > -1) {
              valStr = (stmt.substring(fEqual + 1, ilAnd - 1)).trim();
            } else {
              valStr = (stmt.substring(fEqual + 1, stmt.length)).trim();
            }
            if (i > 0) {
             whereStmt += ' AND ';
            }
            if(colType === 'withRefsNames') {
              whereStmt += `${colNames[i]} = ${valStr}`;
            } else {
              whereStmt += `${withRefsNames[i]} = ${valStr}`;
            }
          }
        }
      }

      /*
      const fEqual: number = stmt.indexOf("=");
      const whereColName: string = stmt.substring(0, fEqual).trim();
      whereStmt = whStmt.replace(whereColName, colName);
      */
     whereStmt = "WHERE " + whereStmt;
    }
  }
  return whereStmt;
}

export const getReferences = async (db: any, tableName: string): Promise<any[]> => {
  const sqlStmt: string =
  "SELECT sql FROM sqlite_master " +
  "WHERE sql LIKE('%FOREIGN KEY%') AND sql LIKE('%REFERENCES%') AND " +
  "sql LIKE('%" + tableName + "%') AND sql LIKE('%ON DELETE%');";
  try {
    const res: any[] = await queryAll(db,sqlStmt,[]);
    // get the reference's string(s)
    let retRefs: string[] = [];
    if(res.length > 0) {
      retRefs = getRefs(res[0].sql);
    }
    return Promise.resolve(retRefs);
  } catch (err) {
    return Promise.reject(new Error(`getReferences: ${err.message}`));
  }

}
export const getTableList = async (db:any): Promise<any[]> => {
  try {
    const result = await getTablesNames(db)
    return Promise.resolve(result);
  } catch (err) {
    return Promise.reject(new Error(`getTableList: ${err.message}`));
  }
}
export const isTableExists = async (db: any, tableName: string): Promise<boolean> => {
  try {
    let statement = 'SELECT name FROM sqlite_master WHERE ';
    statement += `type='table' AND name='${tableName}';`;
    const res = await queryAll(db,statement,[]);
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
export const isLastModified = async (db: any,isOpen: boolean): Promise<boolean> => {
    if (!isOpen) {
      return Promise.reject('isLastModified: database not opened');
    }
    try {
      const tableList: string[] = await getTablesNames(db);
      for( const table of tableList) {
        const tableNamesTypes: any = await getTableColumnNamesTypes(
                                        db, table);
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
 export const isSqlDeleted = async (db: any,isOpen: boolean): Promise<boolean> => {
  if (!isOpen) {
    return Promise.reject('isSqlDeleted: database not opened');
  }
  try {
    const tableList: string[] = await getTablesNames(db);
    for( const table of tableList) {
      const tableNamesTypes: any = await getTableColumnNamesTypes(
                                      db, table);
      const tableColumnNames: string[] = tableNamesTypes.names;
      if(tableColumnNames.includes("sql_deleted")) {
        return Promise.resolve(true);
      }
    }
  } catch (err) {
    return Promise.reject(`isSqlDeleted: ${err}`);
  }
}
export const replaceUndefinedByNull = async (values: any[]): Promise<any[]> => {
  const retValues: any[] = [];
  for( const val of values) {
    let mVal: any = val;
    if( typeof val === 'undefined') mVal = null;
    retValues.push(mVal);
  }
  return Promise.resolve(retValues);
}
export const backupTables = async (db: any): Promise<Record<string, string[]>> => {
  const msg = 'BackupTables: ';
  let alterTables: Record<string, string[]> = {};
  try {
    const tables: string[] = await getTablesNames(db);
    for (const table of tables) {
      try {
        const colNames: string[] = await backupTable(db, table);
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
export const backupTable = async (db: any, table: string): Promise<string[]> => {
  try {
    // start a transaction
    await beginTransaction(db, true);
    // get the table's column names
    const colNames: string[] = await getTableColumnNames(db, table);
    const tmpTable = `_temp_${table}`;
    // Drop the tmpTable if exists
    const delStmt = `DROP TABLE IF EXISTS ${tmpTable};`;
    await run(db, delStmt, [], false, 'no');
  // prefix the table with _temp_
    let stmt = `ALTER TABLE ${table} RENAME `;
    stmt += `TO ${tmpTable};`;
    const lastId: number = await run(db, stmt, [], false, 'no');
    if (lastId < 0) {
      let msg = 'BackupTable: lastId < 0';
      try {
        await rollbackTransaction(db, true);
      } catch (err) {
        msg += `: ${err.message}`;
      }
      return Promise.reject(new Error(`${msg}`));
    } else {
      try {
        await commitTransaction(db, true);
        return Promise.resolve(colNames);
      } catch (err) {
        return Promise.reject(new Error('BackupTable: ' + `${err.message}`));
      }
    }
  } catch (err) {
    return Promise.reject(new Error(`BackupTable: ${err.message}`));
  }
}
export const getTableColumnNames = async (db: any, tableName: string): Promise<string[]> => {
  let resQuery: any[] = [];
  const retNames: string[] = [];
  const query = `PRAGMA table_info('${tableName}');`;
  try {
    resQuery = await queryAll(db, query, []);
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
export const findCommonColumns = async (db: any, alterTables: Record<string, string[]> ): Promise<Record<string, string[]>> => {
  let commonColumns : Record<string, string[]> = {};
  try {
    // Get new table list
    const tables: any[] = await getTablesNames(db);
    if (tables.length === 0) {
      return Promise.reject(
        new Error('FindCommonColumns: get ' + "table's names failed"),
      );
    }
    for (const table of tables) {
      // get the column's name
      const tableNames: any = await getTableColumnNames(db, table);
      // find the common columns
      const keys: string[] = Object.keys(alterTables);
      if (keys.includes(table)) {
        commonColumns[table] = arraysIntersection(alterTables[table], tableNames);
      }
    }
    return Promise.resolve(commonColumns);
  } catch (err) {
    return Promise.reject(new Error(`FindCommonColumns: ${err.message}`));
  }
}
const arraysIntersection = (a1: any[], a2: any[]): any[] => {
  if (a1 != null && a2 != null) {
    const first = new Set(a1);
    const second = new Set(a2);
    return [...first].filter(item => second.has(item));
  } else {
    return [];
  }
}

const getRefs = (str: string) => {
  let retRefs: string[] = []
  const arrFor: string[] = str.split(new RegExp('FOREIGN KEY','i'));
  // Loop through Foreign Keys
  for (let i: number = 1; i< arrFor.length; i++) {
    retRefs.push((arrFor[i].split(new RegExp('ON DELETE','i')))[0].trim());
  }
  // find table name with references
  if (str.substring(0, 12).toLowerCase() === 'CREATE TABLE'.toLowerCase()) {
    const oPar = str.indexOf("(");
    const tableName = str.substring(13, oPar).trim();
    retRefs.push(tableName);
  }

  return retRefs
}
export const updateNewTablesData = async (db: any, commonColumns: Record<string, string[]> ): Promise<void> => {
  try {
    // start a transaction
    await beginTransaction(db, true);

    const statements: string[] = [];
    const keys: string[] = Object.keys(commonColumns);
    keys.forEach(key => {
      const columns = commonColumns[key].join(',');
      let stmt = `INSERT INTO ${key} `;
      stmt += `(${columns}) `;
      stmt += `SELECT ${columns} FROM _temp_${key};`;
      statements.push(stmt);
    });
    const changes: number = await execute(db, statements.join('\n'), false);
    if (changes < 0) {
      let msg: string = 'updateNewTablesData: ' + 'changes < 0';
      try {
        await rollbackTransaction(db, true);
      } catch (err) {
        msg += `: ${err.message}`;
      }
      return Promise.reject(new Error(`${msg}`));
    } else {
      try {
        await commitTransaction(db, true);
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


