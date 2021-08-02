import { queryAll, run } from './utils-sqlite';

export const getTablesNames = async (db: any): Promise<string[]> => {
  let sql = 'SELECT name FROM sqlite_master WHERE ';
  sql += "type='table' AND name NOT LIKE 'sync_table' ";
  sql += "AND name NOT LIKE '_temp_%' ";
  sql += "AND name NOT LIKE 'sqlite_%';";
  const retArr: string[] = [];
  try {
    const retQuery: any[] = await queryAll(db, sql, []);
    for (const query of retQuery) {
      retArr.push(query.name);
    }
    return Promise.resolve(retArr);
  } catch (err) {
    return Promise.reject(new Error(`GetTablesNames: ${err.message}`));
  }
}
export const dropElements = async (db: any, type: string): Promise<void> => {
  let msg = '';
  switch (type) {
    case 'index':
      msg = 'DropIndexes';
      break;
    case 'trigger':
      msg = 'DropTriggers';
      break;
    case 'table':
      msg = 'DropTables';
      break;
    default:
      return Promise.reject(
        new Error(`DropElements: ${type} ` + 'not found'),
      );
  }
  // get the element's names
  let stmt = 'SELECT name FROM sqlite_master WHERE ';
  stmt += `type = '${type}' AND name NOT LIKE 'sqlite_%';`;
  try {
    const elements: any[] = await queryAll(db, stmt, []);
    if (elements.length > 0) {
      const upType: string = type.toUpperCase();
      const statements: string[] = [];
      for (const elem of elements) {
        let stmt = `DROP ${upType} IF EXISTS `;
        stmt += `${elem.name};`;
        statements.push(stmt);
      }
      for (const stmt of statements) {
        const lastId: number = await run(db, stmt, []);
        if (lastId < 0) {
          return Promise.reject(new Error(`DropElements: ${msg}: lastId < 0`));
        }
      }
    }
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(new Error(`DropElements: ${msg}: ${err.message}`));
  }
}
export const dropAll = async (db: any): Promise<void> => {
  try {
    // drop tables
    await dropElements(db, 'table');
    // drop indexes
    await dropElements(db, 'index');
    // drop triggers
    await dropElements(db, 'trigger');
    // vacuum the database
    await run(db, 'VACUUM;', []);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(new Error(`DropAll: ${err.message}`));
  }
}
