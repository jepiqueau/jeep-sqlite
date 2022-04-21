import { SQLiteVersionUpgrade, SQLiteSet } from '../interfaces/interfaces';
import { setForeignKeyConstraintsEnabled, dbChanges, backupTables, execute,
         executeSet, findCommonColumns, updateNewTablesData,
         setVersion, isTableExists } from '../utils/utils-sqlite';
import { copyDBToStore, setDBToStore } from './utils-store';
import { dropElements, dropTempTables } from './utils-drop';

export const onUpgrade = async (
  mDb: any,
  vUpgDict: Record<number, SQLiteVersionUpgrade>,
  dbName: string,
  curVersion: number,
  targetVersion: number,
  store: any
): Promise<number> => {
  let changes: number = -1;
  const upgrade: SQLiteVersionUpgrade = vUpgDict[curVersion];
  if (upgrade != null) {
    const keys: string[] = Object.keys(upgrade);
    if (!keys.includes('toVersion')) {
      return Promise.reject(new Error('onUpgrade: toVersion not given'));
    }
    const toVersion: number = upgrade.toVersion;
    if (!keys.includes('statement')) {
      return Promise.reject(new Error('onUpgrade: statement not given'));
    }
    const statement: string = upgrade.statement;
    let set: SQLiteSet[] = [];
    if (keys.includes('set')) {
      set = upgrade.set;
    }
    if (targetVersion < toVersion) {
      let msg = 'Error: version mistmatch ';
      msg += 'Upgrade Statement would upgrade to ';
      msg += `version ${toVersion} , but target version `;
      msg += `is ${targetVersion} for database ${dbName}`;
      msg += ` and version ${curVersion}`;
      return Promise.reject(new Error(`onUpgrade: ${msg}`));
    }
    try {
        // set Foreign Keys Off
        await setForeignKeyConstraintsEnabled(mDb, false);
        // copy the db

        await copyDBToStore(dbName, `backup-${dbName}`, store);
        const initChanges = await dbChanges(mDb);

        // Here we assume that all table schemas are given
        // in the upgrade statement
        if (statement.length > 0) {
          await executeStatementProcess(mDb, statement);
          // save the database to store
          await setDBToStore(mDb, dbName, store);

          // Here we assume that the Set contains only
          // - the data for new tables
          //   as INSERT statements
          // - the data for new columns in existing tables
          //   as UPDATE statements
          if (set.length > 0) {
            await executeSetProcess(mDb, set, toVersion);
            // save the database to store
            await setDBToStore(mDb, dbName, store);
          }
        }
        // set Foreign Keys On
        await setForeignKeyConstraintsEnabled(mDb, true);
        changes = (await dbChanges(mDb)) - initChanges;
        // save the database to store
        await setDBToStore(mDb, dbName, store);
        return Promise.resolve(changes);
    } catch (err) {
      return Promise.reject(new Error(`onUpgrade: ${err.message}`));
    }
  } else {
    return Promise.reject(new Error('onUpgrade: upgrade not found'));
  }
}
export const executeStatementProcess = async (mDb: any, statement: string): Promise<void> => {
  let alterTables: Record<string, string[]> = {};
  let commonColumns : Record<string, string[]> = {};
  try {


    // -> backup all existing tables  "tableName" in
    //    "temp_tableName"
    alterTables = await backupTables(mDb);

    // -> Drop all Indexes
    await dropElements(mDb, 'index');
    // -> Drop all Triggers
    await dropElements(mDb, 'trigger');

    // -> Create new tables from upgrade.statement
    const changes: number = await execute(mDb, statement);
    if (changes < 0) {
      return Promise.reject(
        new Error('ExecuteStatementProcess: ' + 'changes < 0'),
      );
    }
    // -> Create the list of table's common fields
    commonColumns = await findCommonColumns(mDb, alterTables);

    // -> Update the new table's data from old table's data
    if (Object.keys(commonColumns).length > 0) {
      await updateNewTablesData(mDb, commonColumns);
    }

    return Promise.resolve();
  } catch (err) {
    return Promise.reject(
      new Error(`ExecuteStatementProcess: ${err.message}`),
    );
  } finally {
    // -> Drop _temp_tables
    await dropTempTables(mDb, alterTables);
      // -> Do some cleanup
      alterTables = {};
      commonColumns = {};
  }

}
export const executeSetProcess = async (mDb: any, set: SQLiteSet[], toVersion: number): Promise<void> => {
  try {
    // -> load new data
    const lastId = await executeSet(mDb, set);
    if (lastId < 0) {
      return Promise.reject(new Error('ExecuteSetProcess: lastId ' + '< 0'));
    }
    // -> update database version
    await setVersion(mDb, toVersion);
    // -> update syncDate if any
    const retB = await isTableExists(mDb, 'sync_table');
    if (retB) {
      const sDate: number = Math.round(new Date().getTime() / 1000);
      let stmt = 'UPDATE sync_table SET ';
      stmt += `sync_date = ${sDate} WHERE id = 1;`;
      const changes: number = await execute(mDb, stmt);
      if (changes < 0) {
        return Promise.reject(
          new Error('ExecuteSetProcess: changes ' + '< 0'),
        );
      }
    }
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(new Error(`ExecuteSetProcess: ${err.message}`));
  }
}
