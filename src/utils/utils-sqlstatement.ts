export class UtilsSQLStatement {

  static extractTableName(statement: string): string | null  {
    const pattern = /(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+([^\s]+)/i;
    const match = statement.match(pattern);
    if (match && match[1]) {
      const tableName = match[1];
      return tableName;
    }
    return null;
  }

  static extractWhereClause(statement: string): string | null {
    const pattern = /WHERE(.+?)(?:ORDER\s+BY|LIMIT|$)/i;
    const match = statement.match(pattern);
    if (match && match[1]) {
      const whereClause = match[1].trim();
      return whereClause;
    }
    return null;
  }

  static addPrefixToWhereClause (whereClause: string,
                                colNames: string[],
                                refNames: string[],
                                prefix: string): string {
    let columnValuePairs: string[];
// TODO "OR" and "NOT"
    if (whereClause.includes("AND")) {
      // Split the WHERE clause based on the "AND" keyword
      const subSequenceArray = whereClause.split("AND");
      columnValuePairs = subSequenceArray.map((pair) => pair.trim());
    } else {
      columnValuePairs = [whereClause]
    }


    const modifiedPairs = columnValuePairs.map((pair) => {

      const match = pair.match(/(\w+)\s*(=|<|<=|<>|>|>=|IN|BETWEEN|LIKE)\s*(.+)/);
      if (!match) {
        return pair;
      }

      const column = match[1].trim();
      const operator = match[2].trim();
      let value = match[3].trim();
      let newColumn = column;
      const index: number = UtilsSQLStatement.findIndexOfStringInArray(column, refNames);
      if (index !== -1) {
        newColumn = UtilsSQLStatement.getStringAtIndex(colNames, index);
      }
      const modifiedColumn = `${prefix}${newColumn}`;
      const ret = `${modifiedColumn} ${operator} ${value}`;
      return ret;
    });

    return modifiedPairs.join(" AND ");
  }

  static findIndexOfStringInArray(target: string, array: string[]): number {
    return array.indexOf(target);
  }
  static getStringAtIndex(array: string[], index: number): string | undefined {
    if (index >= 0 && index < array.length) {
      return array[index];
    } else {
      return undefined;
    }
  }
  static extractForeignKeyInfo(sqlStatement: string):
              { forKeys: string[], tableName: string, refKeys: string[],
                action: string } {
    // Define the regular expression pattern for extracting the FOREIGN KEY clause
    const foreignKeyPattern = /\bFOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+(\w+)\s*\(([^)]+)\)\s+(ON\s+DELETE\s+(RESTRICT|CASCADE|SET\s+NULL|SET\s+DEFAULT|NO\s+ACTION))?/;
    const matches = sqlStatement.match(foreignKeyPattern);

    if (matches) {
        const foreignKeyInfo = {
            forKeys: matches[1].split(",").map(key => key.trim()),
            tableName: matches[2],
            refKeys: matches[3].split(",").map(key => key.trim()),
            action: matches[5] ? matches[5] : "NO ACTION"
        };
        return foreignKeyInfo;
    } else {
        throw new Error("extractForeignKeyInfo: No FOREIGN KEY found");
    }
  }
  static extractColumnNames(whereClause: string): string[] {
    const keywords: Set<string> = new Set(["AND", "OR", "IN", "VALUES", "LIKE", "BETWEEN", "NOT"]);
    const tokens: string[] = whereClause.split(/\s|,|\(|\)/);

    const columns: string[] = [];
    let inClause = false;
    let inValues = false;

    for (const token of tokens) {
        if (token === "IN") {
            inClause = true;
        } else if (inClause && token === "(") {
            inValues = true;
        } else if (inValues && token === ")") {
            inValues = false;
        } else if (token.match(/\b[a-zA-Z]\w*\b/) && !inValues && !keywords.has(token.toUpperCase())) {
            columns.push(token);
        }
    }

    return Array.from(new Set(columns));
  }

  static flattenMultilineString(input: string): string {
    const lines = input.split(/\r?\n/);
    return lines.join(" ");
  }

  static getStmtAndRetColNames(sqlStmt: string, retMode: string):
                                { stmt: string; names: string } {
    const retWord = "RETURNING";
    const retStmtNames: { stmt: string; names: string } = { stmt: sqlStmt, names: "" };

    const retWordIndex = sqlStmt.toUpperCase().indexOf(retWord);
    if (retWordIndex !== -1) {
      const prefix = sqlStmt.substring(0, retWordIndex);
      retStmtNames.stmt = `${prefix};`;

      if (retMode.substring(0, 2) === "wA") {
        const suffix = sqlStmt.substring(retWordIndex + retWord.length);
        const names = suffix.trim();
        if (names.endsWith(";")) {
          retStmtNames.names = names.substring(0, names.length - 1);
        } else {
          retStmtNames.names = names;
        }
      }
    }

    return retStmtNames;
  }

  static extractCombinedPrimaryKey(whereClause: string): string[][] | null {
    const pattern = /WHERE\s*\((.+?)\)\s*(?:=|IN)\s*\((.+?)\)/g;
    const regex = new RegExp(pattern);
    const matches = whereClause.matchAll(regex);

    const primaryKeySets: string[][] = [];
    for (const match of matches) {
      const keysString = match[1].trim();
      const keys = keysString.split(",").map((key) => key.trim());
      primaryKeySets.push(keys);
    }

    return primaryKeySets.length === 0 ? null : primaryKeySets;
  }

  static getWhereStmtForCombinedPK(whStmt: string, withRefs: string[],
                                  colNames: string[],
                                  keys: string[][]): string {
    let retWhere: string = whStmt;

    for (const grpKeys of keys) {
      const repKeys: string[] = grpKeys.join(",") === withRefs.join(",") ? colNames : withRefs;
      for (const [index, key] of grpKeys.entries()) {
        retWhere = UtilsSQLStatement.replaceAllString(retWhere, key, repKeys[index]);
      }
    }

    return retWhere;
  }

  static replaceAllString(originalStr: string, searchStr: string,
                                        replaceStr: string): string {
    return originalStr.split(searchStr).join(replaceStr);
  }

  static replaceString = (originalStr: string, searchStr: string,
                                        replaceStr: string): string => {
    const range = originalStr.indexOf(searchStr);
    if (range !== -1) {
      const modifiedStr = originalStr.substring(0, range) + replaceStr + originalStr.substring(range + searchStr.length);
      return modifiedStr;
    }
    return originalStr;
  }

  static indicesOf(str: string, searchStr: string,
                                  fromIndex = 0): number[] {
  // Helper function to find indices of a substring within a string
  const indices: number[] = [];
    let currentIndex = str.indexOf(searchStr, fromIndex);
    while (currentIndex !== -1) {
      indices.push(currentIndex);
      currentIndex = str.indexOf(searchStr, currentIndex + 1);
    }
    return indices;
  }

  static getWhereStmtForNonCombinedPK(whStmt: string, withRefs: string[],
                                      colNames: string[]): string {
    let whereStmt = "";
    let stmt: string = whStmt.substring(6);

    for (let idx = 0; idx < withRefs.length; idx++) {
      let colType = "withRefsNames";
      let idxs: number[] = UtilsSQLStatement.indicesOf(stmt, withRefs[idx]);
      if (idxs.length === 0) {
        idxs = UtilsSQLStatement.indicesOf(stmt, colNames[idx]);
        colType = "colNames";
      }

      if (idxs.length > 0) {
        let valStr = "";
        const indicesEqual = UtilsSQLStatement.indicesOf(stmt, "=", idxs[0]);

        if (indicesEqual.length > 0) {
          const indicesAnd = UtilsSQLStatement.indicesOf(stmt, "AND", indicesEqual[0]);

          if (indicesAnd.length > 0) {
            valStr = stmt.substring(indicesEqual[0] + 1, indicesAnd[0] - 1);
            stmt = stmt.substring(indicesAnd[0] + 3);
          } else {
            valStr = stmt.substring(indicesEqual[0] + 1);
          }
          if (idx > 0) {
            whereStmt += " AND ";
          }

          if (colType === "withRefsNames") {
            whereStmt += colNames[idx] + " = " + valStr;
          } else {
            whereStmt += withRefs[idx] + " = " + valStr;
          }
        }
      }
    }

    whereStmt = "WHERE " + whereStmt;
    return whereStmt;
  }

  static updateWhere(whStmt: string, withRefs: string[],
                              colNames: string[]): string {
    let whereStmt = "";
    if (whStmt.length <= 0) {
      return whereStmt;
    }
    if (whStmt.toUpperCase().substring(0, 5) !== "WHERE") {
      return whereStmt;
    }

    if (withRefs.length === colNames.length) {
      // get whereStmt for primary combined key
      const keys = UtilsSQLStatement.extractCombinedPrimaryKey(whStmt);
      if (keys) {
        whereStmt = UtilsSQLStatement.getWhereStmtForCombinedPK(whStmt, withRefs, colNames, keys);
      } else {
        // get for non primary combined key
        whereStmt = UtilsSQLStatement.getWhereStmtForNonCombinedPK(whStmt, withRefs, colNames);
      }
    }
    return whereStmt;
  }
}
