import { SQLiteVersionUpgrade } from '../interfaces/interfaces';
import { setForeignKeyConstraintsEnabled, dbChanges, execute, beginTransaction,
         commitTransaction, rollbackTransaction, setVersion } from '../utils/utils-sqlite';

export const onUpgrade = async (
  mDb: any,
  vUpgDict: Record<number, SQLiteVersionUpgrade>,
  curVersion: number,
  targetVersion: number
): Promise<number> => {
  let changes: number = -1;
  const sortedKeys: number[] = Object.keys(vUpgDict)
  .map(item => parseInt(item))
  .sort();

  for (const versionKey of sortedKeys) {
    if (versionKey > curVersion && versionKey <= targetVersion) {
      const statements = vUpgDict[versionKey].statements;
      if (statements.length === 0) {
        return Promise.reject('onUpgrade: statements not given');
      }
      try {
        // set Foreign Keys Off
        await setForeignKeyConstraintsEnabled(mDb, false);
        const initChanges = await dbChanges(mDb);
        await executeStatementsProcess(mDb, statements);
        await setVersion(mDb, versionKey);
        // set Foreign Keys On
        await setForeignKeyConstraintsEnabled(mDb, true);
        changes = (await dbChanges(mDb)) - initChanges;
      } catch (err) {
        return Promise.reject(new Error(`onUpgrade: ${err.message}`));
      }
    }
  }

  return Promise.resolve(changes);
};

export const executeStatementsProcess = async (mDb: any, statements: string[]): Promise<void> => {
  try {
    await beginTransaction(mDb, true);
    for (const statement of statements) {
      await execute(mDb, statement, false);
    }
    await commitTransaction(mDb, true);
    return Promise.resolve();
  } catch (err) {
    await rollbackTransaction(mDb, true);
    return Promise.reject(`ExecuteStatementProcess: ${err}`);
  }
}
