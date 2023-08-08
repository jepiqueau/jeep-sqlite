import { Database } from "./database";
import { UtilsSQLite } from "./utils-sqlite";
import { UtilsSQLStatement } from "./utils-sqlstatement";
class UtilsDeleteError {
  static findReferencesAndUpdate(message: string) {
    return new UtilsDeleteError(message);
  }
  static getRefs(message: string) {
    return new UtilsDeleteError(message);
  }
  static getReferences(message: string) {
    return new UtilsDeleteError(message);
  }
  static searchForRelatedItems(message: string) {
    return new UtilsDeleteError(message);
  }
  static upDateWhereForDefault(message: string) {
    return new UtilsDeleteError(message);
  }
  static upDateWhereForRestrict(message: string) {
    return new UtilsDeleteError(message);
  }
  static upDateWhereForCascade(message: string) {
    return new UtilsDeleteError(message);
  }
  static executeUpdateForDelete(message: string) {
    return new UtilsDeleteError(message);
  }

  constructor(public message: string) {}
}

export class UtilsDelete {
  static async findReferencesAndUpdate(
    mDB: Database,
    tableName: string,
    whereStmt: string,
    initColNames: string[],
    values: any[]
  ): Promise<boolean> {
    try {
      let retBool = true;
      const result = await UtilsDelete.getReferences(mDB, tableName);
      const references = result.retRefs;
      const tableNameWithRefs = result.tableWithRefs
      if (references.length <= 0) {
        return retBool
      }
      if (tableName === tableNameWithRefs) {
        return retBool
      }
      // Loop through references
      for (const ref of references) {
        // Extract the FOREIGN KEY constraint info from the ref statement
        const foreignKeyInfo = UtilsSQLStatement.extractForeignKeyInfo(ref);

        // Get the tableName of the references
        const refTable: string = foreignKeyInfo.tableName;
        if (refTable === '' || refTable !== tableName) {
          continue;
        }

        // Get the with ref column names
        const withRefsNames: string[] = foreignKeyInfo.forKeys;
        // Get the column names
        const colNames: string[] = foreignKeyInfo.refKeys;
        if(colNames.length !== withRefsNames.length) {
          const msg = "findReferencesAndUpdate: mismatch length";
          throw UtilsDeleteError.findReferencesAndUpdate(
            msg
          );
        }

        const action: string = foreignKeyInfo.action;
        if (action === 'NO_ACTION') {
          continue;
        }
        let updTableName: string = tableNameWithRefs;
        let updColNames: string[] = withRefsNames;
        let results: { setStmt: string; uWhereStmt: string } = {
          uWhereStmt: '',
          setStmt: '',
        };
        if (!UtilsDelete.checkValuesMatch(withRefsNames, initColNames)) {
          // Case: no match
          // Search for related items in tableName
          const result = await UtilsDelete
                            .searchForRelatedItems(mDB, updTableName,
                                                   tableName, whereStmt,
                                                   withRefsNames, colNames,
                                                   values);
          if (result.relatedItems.length === 0 && result.key.length <= 0) {
            continue;
          }

          if (updTableName !== tableName) {
            switch (action) {
              case 'RESTRICT':
                results = await UtilsDelete
                      .upDateWhereForRestrict(result);
                break;
              case 'CASCADE':
                results = await UtilsDelete
                      .upDateWhereForCascade(result);
                break;
              default:
                results = await UtilsDelete
                      .upDateWhereForDefault(withRefsNames, result);
                break;
            }
          }
        } else {
          throw UtilsDeleteError.findReferencesAndUpdate(
            'Not implemented. Please transfer your example to the maintener'
          );
        }

        if (

          results.setStmt.length > 0 &&
          results.uWhereStmt.length > 0
        ) {
          UtilsDelete.executeUpdateForDelete(
            mDB,
            updTableName,
            results.uWhereStmt,
            results.setStmt,
            updColNames,
            values
          );
        }
      }
      return retBool;
    } catch (error) {
      const msg = error.message ? error.message : error
      if (error instanceof UtilsDeleteError) {
        throw UtilsDeleteError.findReferencesAndUpdate(msg);
      } else {
        throw error;
      }

    }
  }
  static async getReferences(db: any, tableName: string): Promise<{tableWithRefs: string, retRefs: string[]}> {
    const sqlStmt: string =
    "SELECT sql FROM sqlite_master " +
    "WHERE sql LIKE('%FOREIGN KEY%') AND sql LIKE('%REFERENCES%') AND " +
    "sql LIKE('%" + tableName + "%') AND sql LIKE('%ON DELETE%');";
    try {
      const res: any[] = await UtilsSQLite.queryAll(db,sqlStmt,[]);
      // get the reference's string(s)
      let retRefs: string[] = [];
      let tableWithRefs: string = "";
      if(res.length > 0) {
        let result = UtilsDelete.getRefs(res[0].sql);
        retRefs = result.foreignKeys
        tableWithRefs = result.tableName
      }
      return Promise.resolve({tableWithRefs: tableWithRefs, retRefs: retRefs});
    } catch (err) {
      const error = err.message ? err.message : err;
      const msg = `getReferences: ${error}`;
      throw UtilsDeleteError.getReferences(msg);
    }

  }
  static getRefs(sqlStatement: string): { tableName: string; foreignKeys: string[] } {
    let tableName = '';
    const foreignKeys: string[] = [];
    const statement = UtilsSQLStatement.flattenMultilineString(sqlStatement);

    try {
      // Regular expression pattern to match the table name
      const tableNamePattern = /CREATE\s+TABLE\s+(\w+)\s+\(/;
      const tableNameMatch = statement.match(tableNamePattern);
      if (tableNameMatch) {
        tableName = tableNameMatch[1];
      }

      // Regular expression pattern to match the FOREIGN KEY constraints
      const foreignKeyPattern = /FOREIGN\s+KEY\s+\([^)]+\)\s+REFERENCES\s+(\w+)\s*\([^)]+\)\s+ON\s+DELETE\s+(CASCADE|RESTRICT|SET\s+DEFAULT|SET\s+NULL|NO\s+ACTION)/g;
      const foreignKeyMatches = statement.matchAll(foreignKeyPattern);
      for (const foreignKeyMatch of foreignKeyMatches) {
        const foreignKey = foreignKeyMatch[0];
        foreignKeys.push(foreignKey);
      }
    } catch (error) {
      const msg = `getRefs: Error creating regular expression: ${error}`;
      throw UtilsDeleteError.getRefs(msg);
    }

    return { tableName, foreignKeys };
  }
  static async getReferencedTableName(refValue: string): Promise<string> {
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

  static async searchForRelatedItems(mDB: Database, updTableName: string,
                                     tableName: string, whStmt: string,
                                     withRefsNames: string[],
                                     colNames: string[], values: any[]
                        ): Promise<{key: string, relatedItems: any[] }> {
    const relatedItems:  any [] = [];
    let key = "";
    const t1Names = withRefsNames.map((name) => `t1.${name}`);
    const t2Names = colNames.map((name) => `t2.${name}`);
    try {
      // addPrefix to the whereClause and swap colNames with  withRefsNames
      let whereClause = UtilsSQLStatement
                              .addPrefixToWhereClause(whStmt, colNames,
                                                      withRefsNames, "t2.");
      // look at the whereclause and change colNames with  withRefsNames
      if (whereClause.endsWith(";")) {
        whereClause = whereClause.slice(0, -1);
      }
      const resultString = t1Names
        .map((t1, index) => `${t1} = ${t2Names[index]}`)
        .join(" AND ");

      const sql =
        `SELECT t1.rowid FROM ${updTableName} t1 ` +
        `JOIN ${tableName} t2 ON ${resultString} ` +
        `WHERE ${whereClause} AND t1.sql_deleted = 0;`;
      const vals: any[] = await UtilsSQLite.queryAll(mDB, sql, values);
      if (vals.length > 0) {
        key = (Object.keys(vals[0]))[0]
        relatedItems.push(...vals);
      }
      return {key: key, relatedItems: relatedItems};
    } catch (error) {
      const msg = error.message ? error.message : error;
      throw UtilsDeleteError.searchForRelatedItems(msg);
    }
  }

  static async upDateWhereForDefault(
                    withRefsNames: string[],
                    results: { key: string, relatedItems: any[] }
                  ): Promise<{ setStmt: string; uWhereStmt: string }> {
    let setStmt = '';
    let uWhereStmt = '';
    try {

      const key = results.key;
      const cols: any[] = [];
      for (const relItem of results.relatedItems) {
        const mVal = relItem[key];
        if (mVal !== undefined) {
          cols.push(mVal);
        }
      }

      // Create the set statement
      for (const name of withRefsNames) {
        setStmt += `${name} = NULL, `;
      }
      setStmt += 'sql_deleted = 0,';
      const curTime = UtilsDelete.getCurrentTimeAsInteger() + 5;
      setStmt += `last_modified = ${curTime}`;

      // Create the where statement
      uWhereStmt = `WHERE ${key} IN (`;
      for (const col of cols) {
        uWhereStmt += `${col},`;
      }
      if (uWhereStmt.endsWith(',')) {
        uWhereStmt = uWhereStmt.slice(0, -1);
      }
      uWhereStmt += ');';
    } catch (error) {
      const msg = error.message ? error.message : error;
      throw UtilsDeleteError.upDateWhereForDefault(msg);
    }
    return { setStmt, uWhereStmt };
  }

  static async upDateWhereForRestrict(
                        results: { key: string, relatedItems: any[] }
                      ): Promise<{ setStmt: string; uWhereStmt: string }> {
    try {
      const setStmt = '';
      const uWhereStmt = '';
      if (results.relatedItems.length > 0) {
        const msg =
          'Restrict mode related items exist, please delete them first';
        throw UtilsDeleteError.upDateWhereForRestrict(msg);
      }
      return { setStmt, uWhereStmt };
    } catch (error) {
      const msg = error.message ? error.message : error;
      throw UtilsDeleteError.upDateWhereForRestrict(
        msg
      );
    }
  }
  static async upDateWhereForCascade(
                      results: { key: string, relatedItems: any[] }
                    ): Promise<{ setStmt: string; uWhereStmt: string }> {
    let setStmt = '';
    let uWhereStmt = '';
    try {
      const key = results.key;
      const cols: any[] = [];
      for (const relItem of results.relatedItems) {
        const mVal = relItem[key];
        if (mVal !== undefined) {
          cols.push(mVal);
        }
      }
      setStmt += 'sql_deleted = 1';

      // Create the where statement
      uWhereStmt = `WHERE ${key} IN (`;
      for (const col of cols) {
        uWhereStmt += `${col},`;
      }
      if (uWhereStmt.endsWith(',')) {
        uWhereStmt = uWhereStmt.slice(0, -1);
      }
      uWhereStmt += ');';

    } catch (error) {
      const msg = error.message ? error.message : error;
      throw UtilsDeleteError.upDateWhereForCascade(msg);
    }
    return { setStmt, uWhereStmt };
  }

  static executeUpdateForDelete(
    mDB: Database,
    tableName: string,
    whereStmt: string,
    setStmt: string,
    colNames: string[],
    values: any[]
  ): void {
    try {
      let lastId: number = -1;

      // Update sql_deleted for this references
      const stmt = `UPDATE ${tableName} SET ${setStmt} ${whereStmt}`;
      const selValues: any[] = [];
      if (values.length > 0) {
        const arrVal: string[] = whereStmt.split('?');
        if (arrVal[arrVal.length - 1] === ';') {
          arrVal.pop();
        }

        for (let jdx = 0; jdx < arrVal.length; jdx++) {
          for (const updVal of colNames) {
            const indices: number[] = UtilsSQLStatement.indicesOf(arrVal[jdx], updVal);
            if (indices.length > 0) {
              selValues.push(values[jdx]);
            }
          }
        }
      }
      const retObj = UtilsSQLite.run( mDB, stmt, selValues,
                                      false,'no');
      lastId = retObj["lastId"];

      if (lastId === -1) {
        const msg =
          `UPDATE sql_deleted failed for table: ${tableName}`;
        throw  UtilsDeleteError.executeUpdateForDelete(msg);
      }
    } catch (error) {
      const msg = error.message ? error.message : error
        throw UtilsDeleteError.executeUpdateForDelete(msg);
    }
  }


  static getCurrentTimeAsInteger(): number {
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime;
  }

  static checkValuesMatch(array1: string[], array2: string[]): boolean {
    for (const value of array1) {
      if (!array2.includes(value)) {
        return false;
      }
    }
    return true;
  }
}
