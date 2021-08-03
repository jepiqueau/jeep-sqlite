import { JsonSQLite, JsonTable, JsonColumn, JsonIndex, JsonTrigger } from '../interfaces/interfaces';
import { queryAll } from './utils-sqlite';
import { checkSchemaValidity, checkIndexesValidity, checkTriggersValidity, getTableColumnNamesTypes } from './utils-json';
export const createExportObject = async (db: any, sqlObj: JsonSQLite): Promise<JsonSQLite> => {
  const retObj: JsonSQLite = {} as JsonSQLite;
  let tables: JsonTable[] = [];
  let errmsg = '';
  try {
    // get Table's name
    const resTables: any[] = await getTablesNameSQL(db);
    if (resTables.length === 0) {
      return Promise.reject(
        new Error("createExportObject: table's names failed"),
      );
    } else {
      switch (sqlObj.mode) {
        case 'partial': {
          tables = await getTablesPartial(db, resTables);
          break;
        }
        case 'full': {
          tables = await getTablesFull(db, resTables);
          break;
        }
        default: {
          errmsg =
            'createExportObject: expMode ' + sqlObj.mode + ' not defined';
          break;
        }
      }
      if (errmsg.length > 0) {
        return Promise.reject(new Error(errmsg));
      }
      if (tables.length > 0) {
        retObj.database = sqlObj.database;
        retObj.version = sqlObj.version;
        retObj.encrypted = sqlObj.encrypted;
        retObj.mode = sqlObj.mode;
        retObj.tables = tables;
      }
      return Promise.resolve(retObj);
    }
  } catch (err) {
    return Promise.reject(new Error('createExportObject: ' + err.message));
  }
}
export const getTablesNameSQL = async (db: any): Promise<any[]> => {
  let sql = 'SELECT name,sql FROM sqlite_master WHERE ';
  sql += "type='table' AND name NOT LIKE 'sync_table' ";
  sql += "AND name NOT LIKE '_temp_%' ";
  sql += "AND name NOT LIKE 'sqlite_%';";
  try {
    const retQuery: any[] = await queryAll(db, sql, []);
    return Promise.resolve(retQuery);
  } catch (err) {
    return Promise.reject(new Error(`getTablesNames: ${err.message}`));
  }
}
export const getTablesFull = async (db: any, resTables: any[]): Promise<JsonTable[]> => {
  const tables: JsonTable[] = [];
  let errmsg = '';
  try {
    // Loop through the tables
    for (const rTable of resTables) {
      let tableName: string;
      let sqlStmt: string;

      if (rTable.name) {
        tableName = rTable.name;
      } else {
        errmsg = 'GetTablesFull: no name';
        break;
      }
      if (rTable.sql) {
        sqlStmt = rTable.sql;
      } else {
        errmsg = 'GetTablesFull: no sql';
        break;
      }
      const table: JsonTable = {} as JsonTable;
      // create Table's Schema
      const schema: JsonColumn[] = await getSchema(sqlStmt, tableName);
      if (schema.length === 0) {
        errmsg = 'GetTablesFull: no Schema returned';
        break;
      }
      // check schema validity
      await checkSchemaValidity(schema);
      // create Table's indexes if any
      const indexes: JsonIndex[] = await getIndexes(db, tableName);
      if (indexes.length > 0) {
        // check indexes validity
        await checkIndexesValidity(indexes);
      }
      // create Table's triggers if any
      const triggers: JsonTrigger[] = await getTriggers(db, tableName);
      if (triggers.length > 0) {
        // check triggers validity
        await checkTriggersValidity(triggers);
      }
      // create Table's Data
      const query = `SELECT * FROM ${tableName};`;
      const values: any[] = await getValues(db, query, tableName);
      table.name = tableName;
      if (schema.length > 0) {
        table.schema = schema;
      } else {
        errmsg = `GetTablesFull: must contain schema`;
        break;
      }
      if (indexes.length > 0) {
        table.indexes = indexes;
      }
      if (triggers.length > 0) {
        table.triggers = triggers;
      }
      if (values.length > 0) {
        table.values = values;
      }
      if (Object.keys(table).length <= 1) {
        errmsg = `GetTablesFull: table ${tableName} is not a jsonTable`;
        break;
      }

      tables.push(table);
    }
    if (errmsg.length > 0) {
      return Promise.reject(new Error(errmsg));
    }
    return Promise.resolve(tables);
  } catch (err) {
    return Promise.reject(new Error(`GetTablesFull: ${err.message}`));
  }
}
export const getSchema = (sqlStmt: string, tableName: string): Promise<JsonColumn[]> => {
  const schema: JsonColumn[] = [];
  // take the substring between parenthesis
  const openPar: number = sqlStmt.indexOf('(');
  const closePar: number = sqlStmt.lastIndexOf(')');
  const sstr: string = sqlStmt.substring(openPar + 1, closePar);
  let errmsg = '';
  let isStrfTime = false;
  if (sstr.includes('strftime')) isStrfTime = true;
  let sch: string[] = sstr.replace(/\n/g, '').split(',');
  if (isStrfTime) {
    const nSch: string[] = [];
    for (let j = 0; j < sch.length; j++) {
      if (sch[j].includes('strftime')) {
        nSch.push(sch[j] + ',' + sch[j + 1]);
        j++;
      } else {
        nSch.push(sch[j]);
      }
    }
    sch = [...nSch];
  }
  for (const rSch of sch) {
    const rstr = rSch.trim();
    const idx = rstr.indexOf(' ');
    //find the index of the first
    let row: string[] = [rstr.slice(0, idx), rstr.slice(idx + 1)];
    if (row.length != 2) {
      errmsg = `GetSchema: table ${tableName} row length != 2`;
      break;
    }
    if (row[0].toUpperCase() != 'FOREIGN') {
      schema.push({ column: row[0], value: row[1] });
    } else {
      const oPar: number = rstr.indexOf('(');
      const cPar: number = rstr.indexOf(')');
      row = [rstr.slice(oPar + 1, cPar), rstr.slice(cPar + 2)];
      if (row.length != 2) {
        errmsg = `GetSchema: table ${tableName} row length != 2`;
        break;
      }
      schema.push({ foreignkey: row[0], value: row[1] });
    }
  }
  if (errmsg.length > 0) {
    return Promise.reject(new Error(errmsg));
  }
  return Promise.resolve(schema);
}
export const getIndexes = async (db: any, tableName: string): Promise<JsonIndex[]> => {
  const indexes: JsonIndex[] = [];
  let errmsg = '';
  try {
    let stmt = 'SELECT name,tbl_name,sql FROM sqlite_master WHERE ';
    stmt += `type = 'index' AND tbl_name = '${tableName}' `;
    stmt += `AND sql NOTNULL;`;
    const retIndexes = await queryAll(db, stmt, []);
    if (retIndexes.length > 0) {
      for (const rIndex of retIndexes) {
        const keys: string[] = Object.keys(rIndex);
        if (keys.length === 3) {
          if (rIndex['tbl_name'] === tableName) {
            const sql: string = rIndex['sql'];
            const mode: string = sql.includes('UNIQUE') ? 'UNIQUE' : '';
            const oPar: number = sql.lastIndexOf('(');
            const cPar: number = sql.lastIndexOf(')');
            const index: JsonIndex = {} as JsonIndex;
            index.name = rIndex['name'];
            index.value = sql.slice(oPar + 1, cPar);
            if (mode.length > 0) index.mode = mode;
            indexes.push(index);
          } else {
            errmsg = `GetIndexes: Table ${tableName} doesn't match`;
            break;
          }
        } else {
          errmsg = `GetIndexes: Table ${tableName} creating indexes`;
          break;
        }
      }
      if (errmsg.length > 0) {
        return Promise.reject(new Error(errmsg));
      }
    }
    return Promise.resolve(indexes);
  } catch (err) {
    return Promise.reject(new Error(`GetIndexes: ${err.message}`));
  }
}
export const getTriggers = async (db: any, tableName: string): Promise<JsonTrigger[]> => {
  const triggers: JsonTrigger[] = [];
  try {
    let stmt = 'SELECT name,tbl_name,sql FROM sqlite_master WHERE ';
    stmt += `type = 'trigger' AND tbl_name = '${tableName}' `;
    stmt += `AND sql NOT NULL;`;
    const retTriggers = await queryAll(db, stmt, []);
    if (retTriggers.length > 0) {
      for (const rTrg of retTriggers) {
        const keys: string[] = Object.keys(rTrg);
        if (keys.length === 3) {
          if (rTrg['tbl_name'] === tableName) {
            const sql: string = rTrg['sql'];

            const name: string = rTrg['name'];
            let sqlArr: string[] = sql.split(name);
            if (sqlArr.length != 2) {
              return Promise.reject(
                new Error(
                  `GetTriggers: sql split name does not return 2 values`,
                ),
              );
            }
            if (!sqlArr[1].includes(tableName)) {
              return Promise.reject(
                new Error(
                  `GetTriggers: sql split does not contains ${tableName}`,
                ),
              );
            }
            const timeEvent = sqlArr[1].split(tableName, 1)[0].trim();
            sqlArr = sqlArr[1].split(timeEvent + ' ' + tableName);
            if (sqlArr.length != 2) {
              return Promise.reject(
                new Error(
                  `GetTriggers: sql split tableName does not return 2 values`,
                ),
              );
            }
            let condition = '';
            let logic = '';
            if (sqlArr[1].trim().substring(0, 5).toUpperCase() !== 'BEGIN') {
              sqlArr = sqlArr[1].trim().split('BEGIN');
              if (sqlArr.length != 2) {
                return Promise.reject(
                  new Error(
                    `GetTriggers: sql split BEGIN does not return 2 values`,
                  ),
                );
              }
              condition = sqlArr[0].trim();
              logic = 'BEGIN' + sqlArr[1];
            } else {
              logic = sqlArr[1].trim();
            }

            const trigger: JsonTrigger = {} as JsonTrigger;
            trigger.name = name;
            trigger.logic = logic;
            if (condition.length > 0) trigger.condition = condition;
            trigger.timeevent = timeEvent;
            triggers.push(trigger);
          } else {
            return Promise.reject(
              new Error(`GetTriggers: Table ${tableName} doesn't match`),
            );
          }
        } else {
          return Promise.reject(
            new Error(`GetTriggers: Table ${tableName} creating indexes`),
          );
        }
      }
    }
    return Promise.resolve(triggers);
  } catch (err) {
    return Promise.reject(new Error(`GetTriggers: ${err.message}`));
  }
}
export const getValues = async (db: any, query: string, tableName: string): Promise<any[]> => {
  const values: any[] = [];
  try {
    // get table column names and types
    const tableNamesTypes = await getTableColumnNamesTypes(db, tableName);
    let rowNames: string[] = [];
    if (Object.keys(tableNamesTypes).includes('names')) {
      rowNames = tableNamesTypes.names;
    } else {
      return Promise.reject(
        new Error(`GetValues: Table ${tableName} no names`),
      );
    }
    const retValues = await queryAll(db, query, []);
    for (const rValue of retValues) {
      const row: any[] = [];
      for (const rName of rowNames) {
        if (Object.keys(rValue).includes(rName)) {
          row.push(rValue[rName]);
        } else {
          row.push('NULL');
        }
      }
      values.push(row);
    }
    return Promise.resolve(values);
  } catch (err) {
    return Promise.reject(new Error(`GetValues: ${err.message}`));
  }
}
export const getTablesPartial = async (db: any, resTables: any[]): Promise<JsonTable[]> => {
  const tables: JsonTable[] = [];
  let modTables: any = {};
  let syncDate = 0;
  let modTablesKeys: string[] = [];
  let errmsg = '';
  try {
    // Get the syncDate and the Modified Tables
    const partialModeData: any = await getPartialModeData(db, resTables);
    if (Object.keys(partialModeData).includes('syncDate')) {
      syncDate = partialModeData.syncDate;
    }
    if (Object.keys(partialModeData).includes('modTables')) {
      modTables = partialModeData.modTables;
      modTablesKeys = Object.keys(modTables);
    }
    // Loop trough tables
    for (const rTable of resTables) {
      let tableName = '';
      let sqlStmt = '';
      if (rTable.name) {
        tableName = rTable.name;
      } else {
        errmsg = 'GetTablesFull: no name';
        break;
      }
      if (rTable.sql) {
        sqlStmt = rTable.sql;
      } else {
        errmsg = 'GetTablesFull: no sql';
        break;
      }
      if (
        modTablesKeys.length == 0 ||
        modTablesKeys.indexOf(tableName) === -1 ||
        modTables[tableName] == 'No'
      ) {
        continue;
      }
      const table: JsonTable = {} as JsonTable;
      let schema: JsonColumn[] = [];
      let indexes: JsonIndex[] = [];
      let triggers: JsonTrigger[] = [];
      table.name = rTable;
      if (modTables[table.name] === 'Create') {
        // create Table's Schema
        schema = await getSchema(sqlStmt, tableName);
        if (schema.length > 0) {
          // check schema validity
          await checkSchemaValidity(schema);
        }
        // create Table's indexes if any
        indexes = await getIndexes(db, tableName);
        if (indexes.length > 0) {
          // check indexes validity
          await checkIndexesValidity(indexes);
        }
        // create Table's triggers if any
        triggers = await getTriggers(db, tableName);
        if (triggers.length > 0) {
          // check triggers validity
          await checkTriggersValidity(triggers);
        }
      }
      // create Table's Data
      let query = '';
      if (modTables[tableName] === 'Create') {
        query = `SELECT * FROM ${tableName};`;
      } else {
        query =
          `SELECT * FROM ${tableName} ` +
          `WHERE last_modified > ${syncDate};`;
      }
      const values: any[] = await getValues(db, query, tableName);

      // check the table object validity
      table.name = tableName;
      if (schema.length > 0) {
        table.schema = schema;
      }
      if (indexes.length > 0) {
        table.indexes = indexes;
      }
      if (triggers.length > 0) {
        table.triggers = triggers;
      }
      if (values.length > 0) {
        table.values = values;
      }
      if (Object.keys(table).length <= 1) {
        errmsg = `GetTablesPartial: table ${tableName} is not a jsonTable`;
        break;
      }
      tables.push(table);
    }
    if (errmsg.length > 0) {
      return Promise.reject(new Error(errmsg));
    }
    return Promise.resolve(tables);
  } catch (err) {
    return Promise.reject(new Error(`GetTablesPartial: ${err.message}`));
  }
}
export const getPartialModeData = async (db: any, resTables: any[]): Promise<any> => {
  const retData: any = {};
  try {
    // get the synchronization date
    const syncDate: number = await getSynchroDate(db);
    if (syncDate <= 0) {
      return Promise.reject(new Error(`GetPartialModeData: no syncDate`));
    }
    // get the tables which have been updated
    // since last synchronization
    const modTables: any = await getTablesModified(db, resTables, syncDate );
    if (modTables.length <= 0) {
      return Promise.reject(new Error(`GetPartialModeData: no modTables`));
    }
    retData.syncDate = syncDate;
    retData.modTables = modTables;
    return Promise.resolve(retData);
  } catch (err) {
    return Promise.reject(new Error(`GetPartialModeData: ${err.message}`));
  }
}
export const getTablesModified = async (db: any, tables: any[], syncDate: number): Promise<any> => {
  let errmsg = '';
  try {
    const retModified: any = {};
    for (const rTable of tables) {
      let mode: string;
      // get total count of the table
      let stmt = 'SELECT count(*) AS tcount  ';
      stmt += `FROM ${rTable.name};`;
      let retQuery: any[] = await queryAll(db, stmt, []);
      if (retQuery.length != 1) {
        errmsg = 'GetTableModified: total ' + 'count not returned';
        break;
      }
      const totalCount: number = retQuery[0]['tcount'];
      // get total count of modified since last sync
      stmt = 'SELECT count(*) AS mcount FROM ';
      stmt += `${rTable.name} WHERE last_modified > `;
      stmt += `${syncDate};`;
      retQuery = await queryAll(db, stmt, []);
      if (retQuery.length != 1) break;
      const totalModifiedCount: number = retQuery[0]['mcount'];

      if (totalModifiedCount === 0) {
        mode = 'No';
      } else if (totalCount === totalModifiedCount) {
        mode = 'Create';
      } else {
        mode = 'Modified';
      }
      const key: string = rTable.name;
      retModified[key] = mode;
    }
    if (errmsg.length > 0) {
      return Promise.reject(new Error(errmsg));
    }
    return Promise.resolve(retModified);
  } catch (err) {
    return Promise.reject(new Error(`GetTableModified: ${err.message}`));
  }
}
export const getSynchroDate = async (db: any): Promise<number> => {
  try {
    const stmt = `SELECT sync_date FROM sync_table;`;
    const res = await queryAll(db,stmt,[]);
    return Promise.resolve(res[0]["sync_date"]);
  } catch (err) {
    const msg = `getSyncDate: ${err.message}`;
    return Promise.reject(new Error(msg));
  }
}
