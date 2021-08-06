import { getTablesNames } from '../utils/utils-drop';

export const beginTransaction = async (db: any, isOpen: boolean): Promise<void> => {
    const msg = 'BeginTransaction: ';
    if (!isOpen) {
      return Promise.reject(new Error(`${msg}database not opened`));
    }
    const sql = 'BEGIN TRANSACTION;';
    try {
      await db.run(sql);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(new Error(`DbChanges failed: ${err}`));
    }
}
export const rollbackTransaction = async (db: any, isOpen: boolean): Promise<void> => {
    const msg = 'RollbackTransaction: ';
    if (!isOpen) {
      return Promise.reject(new Error(`${msg}database not opened`));
    }
    const sql = 'ROLLBACK TRANSACTION;';
    try {
      await db.run(sql);
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
      await db.run(sql);
      return Promise.resolve();
    } catch(err) {
      return Promise.reject(new Error(`${msg}${err.message}`));
    }
}
export const dbChanges = async (db: any): Promise<number> => {
    const SELECT_CHANGE = 'SELECT total_changes()';
    let changes: number = 0;
    try {
      const res = await db.exec(SELECT_CHANGE);
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
      const res = await db.exec(SELECT_LAST_ID );
      // process the row here
      lastId = res[0].values[0][0];
      return Promise.resolve(lastId);
    } catch (err) {
      return Promise.reject(new Error(`GetLastId failed: ${err.message}`));
    }

}
export const setForeignKeyConstraintsEnabled = async (db: any, toggle: boolean): Promise<void> => {
  let key = 'OFF';
  if (toggle) {
    key = 'ON';
  }
  try {
    await db.exec(`PRAGMA foreign_keys = '${key}'`);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(new Error(`SetForeignKey: ${err.message}`));
  }
}
export const getVersion = async (db: any): Promise<number> => {
  let version = 0;
  try {
    const res = await db.exec('PRAGMA user_version;');
    version = res[0].values[0][0];
    return Promise.resolve(version);
  } catch (err) {
    return Promise.reject(new Error(`GetVersion: ${err.message}`));
  }
}
export const setVersion = async (db: any, version: number): Promise<void> => {
  try {
    await db.exec(`PRAGMA user_version = ${version}`);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(new Error(`SetVersion: ${err.message}`));
  }
}

export const execute = async (db: any, sql: string): Promise<number> => {
  let changes = -1;
  let initChanges = -1;
  try {
    initChanges = await dbChanges(db);
    await db.exec(sql);
    changes = (await dbChanges(db)) - initChanges;
    return Promise.resolve(changes);
  } catch (err) {
    return Promise.reject(new Error(`Execute: ${err.message}`));
  }
}
export const executeSet = async (db: any, set: any): Promise<number> =>  {
  let lastId = -1;
  for (let i = 0; i < set.length; i++) {
    const statement = 'statement' in set[i] ? set[i].statement : null;
    const values =
      'values' in set[i] && set[i].values.length > 0 ? set[i].values : null;
    if (statement == null || values == null) {
      let msg = 'ExecuteSet: Error statement';
      msg += ` or values are null for index ${i}`;
      return Promise.reject(new Error(msg));
    }
    try {
      if (Array.isArray(values[0])) {
        for (const val of values) {
          const mVal: any[] = await replaceUndefinedByNull(val);
          await db.exec(statement, mVal);
        }
      } else {
        const mVal: any[] = await replaceUndefinedByNull(values);
        await db.exec(statement, mVal);
      }
      lastId = await getLastId(db);
    } catch (err) {
      return Promise.reject(new Error(`ExecuteSet: ${err.message}`));
    }
  }
  return Promise.resolve(lastId);

}
export const queryAll = async (db: any, sql: string, values: any[]): Promise<any[]> => {
  const result: any[] = [];
  try {
    let retArr: any[] = [];
    if(values != null && values.length > 0) {
      retArr = await db.exec(sql, values);
    } else {
      retArr = await db.exec(sql);
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
export const run = async (db: any, statement: string, values: any[]): Promise<number> => {
  let lastId: number = -1;
  try {
    if(values != null && values.length > 0) {
      const mVal: any[] = await replaceUndefinedByNull(values);
      await db.exec(statement, mVal);
    } else {
      await db.exec(statement);
    }
    lastId = await getLastId(db);
    return Promise.resolve(lastId);

  } catch (err) {
    return Promise.reject(new Error(`run: ${err.message}`));
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
    // prefix the table with _temp_
    let stmt = `ALTER TABLE ${table} RENAME `;
    stmt += `TO _temp_${table};`;
    const lastId: number = await run(db, stmt, []);
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
    const changes: number = await execute(db, statements.join('\n'));
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
