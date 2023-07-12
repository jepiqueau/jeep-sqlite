import { EventEmitter } from '@stencil/core';

import { JsonSQLite, JsonProgressListener, JsonView } from '../interfaces/interfaces';
import { setVersion, beginTransaction, rollbackTransaction, commitTransaction,
  execute, dbChanges, run, queryAll, isTableExists } from './utils-sqlite';
import { dropAll } from './utils-drop';
import { getTableColumnNamesTypes, getValues } from './utils-json';

export const createDatabaseSchema = async (db: any, jsonData: JsonSQLite): Promise<number> => {
  let changes = -1;
  const version: number = jsonData.version;
  try {
      // set User Version PRAGMA
      await setVersion(db, version);
      // DROP ALL when mode="full"
      if (jsonData.mode === 'full') {
        await dropAll(db);
      }
      // create database schema
      changes = await createSchema(db, jsonData);
      return Promise.resolve(changes);

  } catch (err) {
    return Promise.reject(
      new Error('CreateDatabaseSchema: ' + `${err.message}`),
    );
  }
}
export const createSchema = async (db: any, jsonData: any): Promise<number> => {
  // create the database schema
  let changes = 0;
  try {
    // start a transaction
    await beginTransaction(db, true);
  } catch (err) {
    return Promise.reject(new Error(`CreateSchema: ${err.message}`));
  }

  const stmts = await createSchemaStatement(jsonData);
  if (stmts.length > 0) {
    const schemaStmt: string = stmts.join('\n');
    try {
      changes = await execute(db, schemaStmt, true);
      if (changes < 0) {
        try {
          await rollbackTransaction(db, true);
        } catch (err) {
          return Promise.reject(
            new Error('CreateSchema: changes < 0 ' + `${err.message}`),
          );
        }
      }
    } catch (err) {
      const msg = err.message;
      try {
        await rollbackTransaction(db, true);
        return Promise.reject(new Error(`CreateSchema: ${msg}`));
      } catch (err) {
        return Promise.reject(
          new Error('CreateSchema: changes < 0 ' + `${err.message}: ${msg}`),
        );
      }
    }
  }
  try {
    await commitTransaction(db, true);
    return Promise.resolve(changes);
  } catch (err) {
    return Promise.reject(
      new Error('CreateSchema: commit ' + `${err.message}`),
    );
  }
}
export const createSchemaStatement = async (jsonData: any): Promise<string[]> => {
  const statements: string[] = [];
  let isLastModified = false;
  let isSqlDeleted = false;

  // Prepare the statement to execute
  try {
    for (const jTable of jsonData.tables) {
      if (jTable.schema != null && jTable.schema.length >= 1) {
        // create table
        statements.push('CREATE TABLE IF NOT EXISTS ' + `${jTable.name} (`);
        for (let j = 0; j < jTable.schema.length; j++) {
          if (j === jTable.schema.length - 1) {
            if (jTable.schema[j].column) {
              statements.push(
                `${jTable.schema[j].column} ${jTable.schema[j].value}`,
              );
              if(jTable.schema[j].column === "last_modified") {
                isLastModified = true;
              }
              if(jTable.schema[j].column === "sql_deleted") {
                isSqlDeleted = true;
              }
            } else if (jTable.schema[j].foreignkey) {
              statements.push(
                `FOREIGN KEY (${jTable.schema[j].foreignkey}) ${jTable.schema[j].value}`,
              );
            } else if (jTable.schema[j].constraint) {
              statements.push(
                `CONSTRAINT ${jTable.schema[j].constraint} ${jTable.schema[j].value}`,
              );
            }
          } else {
            if (jTable.schema[j].column) {
              statements.push(
                `${jTable.schema[j].column} ${jTable.schema[j].value},`,
              );
            } else if (jTable.schema[j].foreignkey) {
              statements.push(
                `FOREIGN KEY (${jTable.schema[j].foreignkey}) ${jTable.schema[j].value},`,
              );
            } else if (jTable.schema[j].primarykey) {
              statements.push(
                `FOREIGN KEY ${jTable.schema[j].value},`,
              );
            } else if (jTable.schema[j].constraint) {
              statements.push(
                `CONSTRAINT ${jTable.schema[j].constraint} ${jTable.schema[j].value},`,
              );
            }
          }
        }
        statements.push(');');
        if(isLastModified && isSqlDeleted) {
          // create trigger last_modified associated with the table
          let trig = 'CREATE TRIGGER IF NOT EXISTS ';
          trig += `${jTable.name}`;
          trig += `_trigger_last_modified `;
          trig += `AFTER UPDATE ON ${jTable.name} `;
          trig += 'FOR EACH ROW WHEN NEW.last_modified < ';
          trig += 'OLD.last_modified BEGIN UPDATE ';
          trig += `${jTable.name} `;
          trig += `SET last_modified = `;
          trig += "(strftime('%s','now')) WHERE id=OLD.id; END;";
          statements.push(trig);
        }
      }

      if (jTable.indexes != null && jTable.indexes.length >= 1) {
        for (const jIndex of jTable.indexes) {
          const tableName = jTable.name;
          let stmt = `CREATE ${
            Object.keys(jIndex).includes('mode') ? jIndex.mode + ' ' : ''
          } INDEX IF NOT EXISTS `;
          stmt += `${jIndex.name} ON ${tableName} (${jIndex.value});`;
          statements.push(stmt);
        }
      }
      if (jTable.triggers != null && jTable.triggers.length >= 1) {
        for (const jTrg of jTable.triggers) {
          const tableName = jTable.name;
          if (jTrg.timeevent.toUpperCase().endsWith(" ON")) {
            jTrg.timeevent = jTrg.timeevent.substring(0, jTrg.timeevent.length - 3);
        }

          let stmt = `CREATE TRIGGER IF NOT EXISTS `;
          stmt += `${jTrg.name} ${jTrg.timeevent} ON ${tableName} `;
          if (jTrg.condition) stmt += `${jTrg.condition} `;
          stmt += `${jTrg.logic};`;
          statements.push(stmt);
        }
      }
    }
    return Promise.resolve(statements);
  } catch (err) {
    return Promise.reject(err);
  }
}
export const createTablesData = async (db: any, jsonData: JsonSQLite,
                                       importProgress: EventEmitter<JsonProgressListener>): Promise<number> => {
  let changes = 0;
  let isValue = false;
  let lastId = -1;
  let msg = '';
  let initChanges = -1;
  try {
    initChanges = await dbChanges(db);
    // start a transaction
    await beginTransaction(db, true);
  } catch (err) {
    return Promise.reject(new Error(`createTablesData: ${err.message}`));
  }
  for (const jTable of jsonData.tables) {
    if (jTable.values != null && jTable.values.length >= 1) {
      // Create the table's data
      try {
        lastId = await createTableData(db, jTable, jsonData.mode);
        const msg: string = `create table data ${jTable.name}`;
        importProgress.emit({progress: msg});
        if (lastId < 0) break;
        isValue = true;
      } catch (err) {
        msg = err.message;
        isValue = false;
        break;
      }
    }
  }
  if (isValue) {
    try {
      await commitTransaction(db, true);
      changes = (await dbChanges(db)) - initChanges;
      return Promise.resolve(changes);
    } catch (err) {
      return Promise.reject(
        new Error('CreateTablesData: ' + `${err.message}`),
      );
    }
  } else {
    if(msg.length > 0) {
      try {
        await rollbackTransaction(db, true);
        return Promise.reject(new Error(`CreateTablesData: ${msg}`));
      } catch (err) {
        return Promise.reject(
          new Error('CreateTablesData: ' + `${err.message}: ${msg}`),
        );
      }
    } else {
      // case were no values given
      return Promise.resolve(0);
    }
}
}
export const createTableData = async (db: any, table: any, mode: string): Promise<number> => {
  let lastId = -1;
  try {
    // Check if the table exists
    const tableExists = await isTableExists(db, table.name);
    if (!tableExists) {
      return Promise.reject(
        new Error('CreateTableData: Table ' + `${table.name} does not exist`),
      );
    }

    // Get the column names and types
    const tableNamesTypes: any = await getTableColumnNamesTypes(db, table.name);
    const tableColumnTypes: string[] = tableNamesTypes.types;
    const tableColumnNames: string[] = tableNamesTypes.names;
    if (tableColumnTypes.length === 0) {
      return Promise.reject(
        new Error(
          'CreateTableData: Table ' + `${table.name} info does not exist`,
        ),
      );
    }
    // Loop on Table Values
    for (let j = 0; j < table.values.length; j++) {
      let row = table.values[j];
      let isRun: boolean = true;
      const stmt: string = await createRowStatement(db, tableColumnNames, row,
                                                    j, table.name, mode);
      isRun = await checkUpdate(db, stmt, row, table.name, tableColumnNames);
      if(isRun) {
        if(stmt.substring(0,6).toUpperCase() === "DELETE") {
          row = [];
        }
        lastId = await run(db, stmt, row, true, 'no');
        if (lastId < 0) {
          return Promise.reject(new Error('CreateTableData: lastId < 0'));
        }
      } else {
        lastId = 0;
      }
    }
    return Promise.resolve(lastId);
  } catch (err) {
    return Promise.reject(new Error(`CreateTableData: ${err.message}`));
  }
}
export const createRowStatement = async (db: any, tColNames: string[],
                                         row: any[], j: number, tableName: string,
                                         mode: string): Promise<string> => {

  // Check the row number of columns
  if (row.length != tColNames.length || row.length ===0 || tColNames.length === 0) {
    return Promise.reject(
      new Error(
        `CreateRowStatement: Table ${tableName} ` +
          `values row ${j} not correct length`,
      ),
    );
  }
  try {
    const retisIdExists: boolean = await isIdExists(db, tableName, tColNames[0], row[0]);
    let stmt: string;
    if (mode === 'full' || (mode === 'partial' && !retisIdExists)) {
      // Insert
      const nameString: string = tColNames.join();
      const questionMarkString = await createQuestionMarkString(tColNames.length);
      stmt = `INSERT INTO ${tableName} (${nameString}) VALUES (`;
      stmt += `${questionMarkString});`;

    } else {
      // Update or Delete
      let isUpdate = true
      const isColDeleted = (element: string) => element === `sql_deleted`;
      const idxDelete = tColNames.findIndex(isColDeleted);
      if(idxDelete >= 0) {
        if(row[idxDelete] === 1) {
          isUpdate = false;
          stmt =
          `DELETE FROM ${tableName} WHERE `;
          if( typeof row[0] == "string") {
            stmt +=
            `${tColNames[0]} = '${row[0]}';`;
          } else {
            stmt +=
            `${tColNames[0]} = ${row[0]};`;
          }
        }
      }
      if(isUpdate) {
        // Update
        const setString: string = await setNameForUpdate(tColNames);
        if (setString.length === 0) {
          return Promise.reject(
            new Error(
              `CreateRowStatement: Table ${tableName} ` +
                `values row ${j} not set to String`,
            ),
          );
        }
        stmt =
          `UPDATE ${tableName} SET ${setString} WHERE `;
        if( typeof row[0] == "string") {
          stmt +=
          `${tColNames[0]} = '${row[0]}';`;
        } else {
          stmt +=
          `${tColNames[0]} = ${row[0]};`;
        }
      }
    }
    return Promise.resolve(stmt);
  } catch (err) {
    return Promise.reject(new Error(`CreateRowStatement: ${err.message}`));
  }
}
export const checkUpdate = async (db: any, stmt: string, values: any[], tbName: string,
                                  tColNames: string[]): Promise<boolean> => {
  let isRun: boolean = true;
  if (stmt.substring(0, 6) === "UPDATE") {
    try {
      let query = `SELECT * FROM ${tbName} WHERE `;
      if( typeof values[0] == "string") {
        query +=
        `${tColNames[0]} = '${values[0]}';`;
      } else {
        query +=
        `${tColNames[0]} = ${values[0]};`;
      }


      const resQuery: any[] = await getValues(db, query, tbName);
      let resValues: any[] = [];
      if(resQuery.length > 0) {
        resValues = resQuery[0];
      }
      if(values.length > 0  && resValues.length > 0
                            && values.length === resValues.length) {
        for(let i = 0; i < values.length; i++) {
          if(values[i] !== resValues[i]) {
            return Promise.resolve(true);
          }
        }
        return Promise.resolve(false);
      } else {
        const msg = "Both arrays not the same length"
        return Promise.reject(new Error(`CheckUpdate: ${msg}`));
      }
    } catch (err) {
      return Promise.reject(new Error(`CheckUpdate: ${err.message}`));
    }
  } else {
    return Promise.resolve(isRun);
  }
}
export const isIdExists = async (db: any, dbName: string, firstColumnName: string,
                                 key: any): Promise<boolean> => {
  let ret = false;
  let query: string =
    `SELECT ${firstColumnName} FROM ` +
    `${dbName} WHERE ${firstColumnName} = `;
  if (typeof key === 'number') query += `${key};`;
  if (typeof key === 'string') query += `'${key}';`;

  try {
    const resQuery: any[] = await queryAll(db, query, []);
    if (resQuery.length === 1) ret = true;
    return Promise.resolve(ret);
  } catch (err) {
    return Promise.reject(new Error(`IsIdExists: ${err.message}`));
  }
}
export const isType = async (type: string, value: any): Promise<void> => {
  let ret = false;
  if (type === 'NULL' && typeof value === 'object') ret = true;
  if (type === 'TEXT' && typeof value === 'string') ret = true;
  if (type === 'INTEGER' && typeof value === 'number') ret = true;
  if (type === 'REAL' && typeof value === 'number') ret = true;
  if (type === 'BLOB' && typeof value === 'string') ret = true;
  if (ret) {
    return Promise.resolve();
  } else {
    return Promise.reject(new Error('IsType: not a SQL Type'));
  }
}
export const checkColumnTypes = async (tableTypes: any[], rowValues: any[]): Promise<void> => {
  for (let i = 0; i < rowValues.length; i++) {
    if (rowValues[i] != null) {
      try {
        await isType(tableTypes[i], rowValues[i]);
      } catch (err) {
        return Promise.reject(new Error('CheckColumnTypes: Type not found'));
      }
    }
  }
  return Promise.resolve();
}
export const createQuestionMarkString = async (length: number): Promise<string> => {
  let retString = '';
  for (let i = 0; i < length; i++) {
    retString += '?,';
  }
  if (retString.length > 1) {
    retString = retString.slice(0, -1);
    return Promise.resolve(retString);
  } else {
    return Promise.reject(new Error('CreateQuestionMarkString: length = 0'));
  }
}
export const setNameForUpdate = async (names: string[]): Promise<string> => {
  let retString = '';
  for (const name of names) {
    retString += `${name} = ? ,`;
  }
  if (retString.length > 1) {
    retString = retString.slice(0, -1);
    return Promise.resolve(retString);
  } else {
    return Promise.reject(new Error('SetNameForUpdate: length = 0'));
  }
}

export const createView = async (mDB: any, view: JsonView): Promise<void> => {
  const stmt = `CREATE VIEW IF NOT EXISTS ${view.name} AS ${view.value};`;
  try {
    const changes = await execute(mDB, stmt, true);
    if (changes < 0) {
      return Promise.reject(new Error(`CreateView: ${view.name} failed`));
    }
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(new Error(`CreateView: ${err.message}`));
  }
}
export const createViews = async (mDB: any, jsonData: JsonSQLite): Promise<number> => {
  let isView = false;
  let msg = '';
  let initChanges = -1;
  let changes = -1;
  try {
    initChanges = await dbChanges(mDB);
    // start a transaction
    await beginTransaction(mDB, true);
  } catch (err) {
    return Promise.reject(new Error(`createViews: ${err.message}`));
  }
  for (const jView of jsonData.views) {
    if (jView.value != null) {
      // Create the view
      try {
        await createView(mDB, jView);
        isView = true;
      } catch (err) {
        msg = err.message;
        isView = false;
        break;
      }
    }
  }
  if (isView) {
    try {
      await commitTransaction(mDB, true);
      changes = (await dbChanges(mDB)) - initChanges;
      return Promise.resolve(changes);
    } catch (err) {
      return Promise.reject(new Error('createViews: ' + `${err.message}`));
    }
  } else {
    if (msg.length > 0) {
      try {
        await rollbackTransaction(mDB, true);
        return Promise.reject(new Error(`createViews: ${msg}`));
      } catch (err) {
        return Promise.reject(
          new Error('createViews: ' + `${err.message}: ${msg}`),
        );
      }
    } else {
      // case were no views given
      return Promise.resolve(0);
    }
  }
}

