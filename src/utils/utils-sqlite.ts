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
export const queryAll = async (db: any, sql: string, values: any[]): Promise<any[]> => {
  const result: any[] = [];
  try {
    let retArr: any[] = [];
    if(values != null && values.length > 0) {
      retArr = await db.exec(sql, values);
    } else {
      retArr = await db.exec(sql);
    }
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
      await db.exec(statement, values);
    } else {
      await db.exec(statement);
    }
    lastId = await getLastId(db);
    return Promise.resolve(lastId);

  } catch (err) {
    return Promise.reject(new Error(`run: ${err.message}`));
  }
}
