import { SQLiteVersionUpgrade } from '../interfaces/interfaces';
import { UtilsSQLite } from '../utils/utils-sqlite';
import { Database } from './database';

export class UtilsUpgrade {
  static async onUpgrade(
                          mDB: Database,
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
          await UtilsSQLite.setForeignKeyConstraintsEnabled(mDB.mDb, false);
          const initChanges = await UtilsSQLite.dbChanges(mDB.mDb);
          await UtilsUpgrade.executeStatementsProcess(mDB, statements);
          await UtilsSQLite.setVersion(mDB.mDb, versionKey);
          // set Foreign Keys On
          await UtilsSQLite.setForeignKeyConstraintsEnabled(mDB.mDb, true);
          changes = (await UtilsSQLite.dbChanges(mDB.mDb)) - initChanges;
        } catch (err) {
          return Promise.reject(new Error(`onUpgrade: ${err.message}`));
        }
      }
    }

    return Promise.resolve(changes);
  };

  static async executeStatementsProcess(mDB: Database, statements: string[]): Promise<void> {
    try {
      mDB.setIsTransActive(await UtilsSQLite.beginTransaction(mDB.mDb, true));
      for (const statement of statements) {
        await UtilsSQLite.execute(mDB.mDb, statement, false);
      }
      mDB.setIsTransActive(await UtilsSQLite.commitTransaction(mDB.mDb, true));
      return Promise.resolve();
    } catch (err) {
      mDB.setIsTransActive(await UtilsSQLite.rollbackTransaction(mDB.mDb, true));
      return Promise.reject(`ExecuteStatementProcess: ${err}`);
    }
  }
}
