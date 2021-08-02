import { JsonSQLite } from '../interfaces/interfaces';
import { setForeignKeyConstraintsEnabled, setVersion, beginTransaction,
  rollbackTransaction, commitTransaction, execute, dbChanges,
  run, queryAll, isTableExists } from './utils-sqlite';
import { dropAll } from './utils-drop';

export const createDatabaseSchema = async (db: any, jsonData: JsonSQLite): Promise<number> => {
  let changes = -1;
  const version: number = jsonData.version;
  try {
      // set Foreign Keys On
      await setForeignKeyConstraintsEnabled(db, true);
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
    return Promise.reject(new Error(`CreateDatabaseSchema: ${err.message}`));
  }

  const stmts = await createSchemaStatement(jsonData);
  if (stmts.length > 0) {
    const schemaStmt: string = stmts.join('\n');
    try {
      changes = await execute(db, schemaStmt);
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
            } else if (jTable.schema[j].constraint) {
              statements.push(
                `CONSTRAINT ${jTable.schema[j].constraint} ${jTable.schema[j].value},`,
              );
            }
          }
        }
        statements.push(');');
        // create trigger last_modified associated with the table
        let trig = 'CREATE TRIGGER IF NOT EXISTS ';
        trig += `${jTable.name}`;
        trig += `_trigger_last_modified `;
        trig += `AFTER UPDATE ON ${jTable.name} `;
        trig += 'FOR EACH ROW WHEN NEW.last_modified <= ';
        trig += 'OLD.last_modified BEGIN UPDATE ';
        trig += `${jTable.name} `;
        trig += `SET last_modified = `;
        trig += "(strftime('%s','now')) WHERE id=OLD.id; END;";
        statements.push(trig);

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
          let stmt = `CREATE TRIGGER IF NOT EXISTS `;
          stmt += `${jTrg.name} ${jTrg.timeevent} ${tableName} `;
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
export const createTablesData = async (db: any, jsonData: JsonSQLite): Promise<number> => {
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
        lastId = await createDataTable(db, jTable, jsonData.mode);
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
    try {
      await rollbackTransaction(db, true);
      return Promise.reject(new Error(`CreateTablesData: ${msg}`));
    } catch (err) {
      return Promise.reject(
        new Error('CreateTablesData: ' + `${err.message}: ${msg}`),
      );
    }
  }
}
export const createDataTable = async (db: any, table: any, mode: string): Promise<number> => {
  let lastId = -1;
  try {
    // Check if the table exists
    const tableExists = await isTableExists(db, table.name);
    if (!tableExists) {
      return Promise.reject(
        new Error('CreateDataTable: Table ' + `${table.name} does not exist`),
      );
    }

    // Get the column names and types
    const tableNamesTypes: any = await getTableColumnNamesTypes(db, table.name);
    const tableColumnTypes: string[] = tableNamesTypes.types;
    const tableColumnNames: string[] = tableNamesTypes.names;
    if (tableColumnTypes.length === 0) {
      return Promise.reject(
        new Error(
          'CreateDataTable: Table ' + `${table.name} info does not exist`,
        ),
      );
    }
    // Loop on Table Values
    for (let j = 0; j < table.values.length; j++) {
      // Check the row number of columns
      if (table.values[j].length != tableColumnTypes.length) {
        return Promise.reject(
          new Error(
            `CreateDataTable: Table ${table.name} ` +
              `values row ${j} not correct length`,
          ),
        );
      }
      // Check the column's type before proceeding
      const isColumnTypes: boolean = await checkColumnTypes(
        tableColumnTypes,
        table.values[j],
      );
      if (!isColumnTypes) {
        return Promise.reject(
          new Error(
            `CreateDataTable: Table ${table.name} ` +
              `values row ${j} not correct types`,
          ),
        );
      }
      const retisIdExists: boolean = await isIdExists(db, table.name, tableColumnNames[0], table.values[j][0]);
      let stmt: string;
      if (mode === 'full' || (mode === 'partial' && !retisIdExists)) {
        // Insert
        const nameString: string = tableColumnNames.join();
        const questionMarkString = await createQuestionMarkString(tableColumnNames.length);
        stmt = `INSERT INTO ${table.name} (${nameString}) VALUES (`;
        stmt += `${questionMarkString});`;

      } else {
        // Update
        const setString: string = await setNameForUpdate(tableColumnNames);
        if (setString.length === 0) {
          return Promise.reject(
            new Error(
              `CreateDataTable: Table ${table.name} ` +
                `values row ${j} not set to String`,
            ),
          );
        }
        stmt =
          `UPDATE ${table.name} SET ${setString} WHERE `;
        if( typeof table.values[j][0] == "string") {
          stmt +=
          `${tableColumnNames[0]} = '${table.values[j][0]}';`;
        } else {
          stmt +=
          `${tableColumnNames[0]} = ${table.values[j][0]};`;
        }

      }
      lastId = await run(db, stmt, table.values[j]);
      if (lastId < 0) {
        return Promise.reject(new Error('CreateDataTable: lastId < 0'));
      }
    }
    return Promise.resolve(lastId);
  } catch (err) {
    return Promise.reject(new Error(`CreateDataTable: ${err.message}`));
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
export const getTableColumnNamesTypes = async (db: any, tableName: string): Promise<any> => {
  let resQuery: any[] = [];
  const retNames: string[] = [];
  const retTypes: string[] = [];
  const query = `PRAGMA table_info('${tableName}');`;
  try {
    resQuery = await queryAll(db, query, []);
    if (resQuery.length > 0) {
      for (const query of resQuery) {
        retNames.push(query.name);
        retTypes.push(query.type);
      }
    }
    return Promise.resolve({ names: retNames, types: retTypes });
  } catch (err) {
    return Promise.reject(
      new Error('GetTableColumnNamesTypes: ' + `${err.message}`),
    );
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
export const checkColumnTypes = async (tableTypes: any[], rowValues: any[]): Promise<boolean> => {
  const isTypeCorrect = true;
  for (let i = 0; i < rowValues.length; i++) {
    if (rowValues[i].toString().toUpperCase() != 'NULL') {
      try {
        await isType(tableTypes[i], rowValues[i]);
      } catch (err) {
        return Promise.reject(new Error('CheckColumnTypes: Type not found'));
      }
    }
  }
  return Promise.resolve(isTypeCorrect);
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

