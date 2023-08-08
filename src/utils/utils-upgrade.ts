import { SQLiteVersionUpgrade } from '../interfaces/interfaces';
import { UtilsSQLite } from '../utils/utils-sqlite';

export class UtilsUpgrade {
  static async onUpgrade(
                          mDb: any,
                          vUpgDict: Record<number, SQLiteVersionUpgrade>,
                          curVersion: number,
                          targetVersion: number
                        ): Promise<number> {
    let changes: number = -1;
    const sortedKeys: Int32Array = new Int32Array(Object.keys(vUpgDict)
    .map(item => parseInt(item)))
    .sort();

    for (const versionKey of sortedKeys) {
      if (versionKey > curVersion && versionKey <= targetVersion) {
        const statements = vUpgDict[versionKey].statements;
        if (statements.length === 0) {
          return Promise.reject('onUpgrade: statements not given');
        }
        try {
          // set Foreign Keys Off
          await UtilsSQLite.setForeignKeyConstraintsEnabled(mDb, false);
          const initChanges = await UtilsSQLite.dbChanges(mDb);
          await UtilsUpgrade.executeStatementsProcess(mDb, statements);
          await UtilsSQLite.setVersion(mDb, versionKey);
          // set Foreign Keys On
          await UtilsSQLite.setForeignKeyConstraintsEnabled(mDb, true);
          changes = (await UtilsSQLite.dbChanges(mDb)) - initChanges;
        } catch (err) {
          return Promise.reject(new Error(`onUpgrade: ${err.message}`));
        }
      }
    }

    return Promise.resolve(changes);
  };

  static async executeStatementsProcess(mDb: any, statements: string[]): Promise<void> {
    try {
      await UtilsSQLite.beginTransaction(mDb, true);
      for (const statement of statements) {
        await UtilsSQLite.execute(mDb, statement, false);
      }
      await UtilsSQLite.commitTransaction(mDb, true);
      return Promise.resolve();
    } catch (err) {
      await UtilsSQLite.rollbackTransaction(mDb, true);
      return Promise.reject(`ExecuteStatementProcess: ${err}`);
    }
  }
}
