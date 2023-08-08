import { UtilsSQLite } from './utils-sqlite';

export class UtilsDrop {

  static async getTablesNames(db: any): Promise<string[]> {
    let sql = 'SELECT name FROM sqlite_master WHERE ';
    sql += "type='table' AND name NOT LIKE 'sync_table' ";
    sql += "AND name NOT LIKE '_temp_%' ";
    sql += "AND name NOT LIKE 'sqlite_%' ";
    sql += "ORDER BY rootpage DESC;";

    const retArr: string[] = [];
    try {
      const retQuery: any[] = await UtilsSQLite.queryAll(db, sql, []);
      for (const query of retQuery) {
        retArr.push(query.name);
      }
      return Promise.resolve(retArr);
    } catch (err) {
      return Promise.reject(new Error(`GetTablesNames: ${err.message}`));
    }
  }
  static async  getViewsNames(mDb: any): Promise<string[]> {
      let sql = 'SELECT name FROM sqlite_master WHERE ';
      sql += "type='view' AND name NOT LIKE 'sqlite_%' ";
      sql += 'ORDER BY rootpage DESC;';
      const retArr: string[] = [];
      try {
        const retQuery: any[] = await UtilsSQLite.queryAll(mDb, sql, []);
        for (const query of retQuery) {
          retArr.push(query.name);
        }
        return Promise.resolve(retArr);
      } catch (err) {
        return Promise.reject(new Error(`getViewsNames: ${err.message}`));
      }
  }
  static async  dropElements(db: any, type: string): Promise<void> {
    let msg = '';
    let stmt1 = `AND name NOT LIKE ('sqlite_%')`;
    switch (type) {
      case 'index':
        msg = 'DropIndexes';
        break;
      case 'trigger':
        msg = 'DropTriggers';
        break;
      case 'table':
        msg = 'DropTables';
        stmt1 += ` AND name NOT IN ('sync_table')`;
        break;
      case 'view':
        msg = 'DropViews';
        break;
      default:
        return Promise.reject(
          new Error(`DropElements: ${type} ` + 'not found'),
        );
    }
    // get the element's names
    let stmt = 'SELECT name FROM sqlite_master WHERE ';
    stmt += `type = '${type}' ${stmt1};`;
    try {
      const elements: any[] = await UtilsSQLite.queryAll(db, stmt, []);
      if (elements.length > 0) {
        const upType: string = type.toUpperCase();
        const statements: string[] = [];
        for (const elem of elements) {
          let stmt = `DROP ${upType} IF EXISTS `;
          stmt += `${elem.name};`;
          statements.push(stmt);
        }
        for (const stmt of statements) {
          const lastId: number = await UtilsSQLite.run(db, stmt, [], false, 'no');
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
  static async  dropAll(db: any): Promise<void> {
    try {
      // drop tables
      await UtilsDrop.dropElements(db, 'table');
      // drop indexes
      await UtilsDrop.dropElements(db, 'index');
      // drop triggers
      await UtilsDrop.dropElements(db, 'trigger');
      // drop views
      await UtilsDrop.dropElements(db, 'view');
      // vacuum the database
      await UtilsSQLite.run(db, 'VACUUM;', [], false, 'no');
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(new Error(`DropAll: ${err.message}`));
    }
  }
  static async  dropTempTables(db: any, alterTables: Record<string, string[]>): Promise<void>{
    const tempTables: string[] = Object.keys(alterTables);
    const statements: string[] = [];
    for (const tTable of tempTables) {
      let stmt = 'DROP TABLE IF EXISTS ';
      stmt += `_temp_${tTable};`;
      statements.push(stmt);
    }
    try {
      const changes: number = await UtilsSQLite.execute(db, statements.join('\n'), false);
      if (changes < 0) {
        return Promise.reject(new Error('DropTempTables: changes < 0'));
      }
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(new Error(`DropTempTables: ${err.message}`));
    }
  }
}
