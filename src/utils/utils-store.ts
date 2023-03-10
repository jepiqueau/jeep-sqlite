export const getDBFromStore = async (dbName: string, store: LocalForage): Promise<Uint8Array> => {
  try {
    const retDb: Uint8Array = await store.getItem(dbName);
    return Promise.resolve(retDb);
  } catch (err) {
    return Promise.reject(`GetDBFromStore: ${err.message}`);
  }
}
export const setInitialDBToStore = async (dbName: string, store: LocalForage): Promise<void> => {
  try {
    // export the database
    const data = null;
    // store the database
    await store.setItem(dbName, data);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(`SetInitialDBToStore: ${err.message}`);
  }
}
export const setDBToStore = async (mDb: any, dbName: string, store: LocalForage): Promise<void> => {
  try {
    // export the database
    const data: Uint8Array = mDb.export();
    // store the database
    await saveDBToStore(dbName, data, store);

    return Promise.resolve();
  } catch (err) {
    return Promise.reject(`SetDBToStore: ${err.message}`);
  }
}
export const saveDBToStore = async (dbName: string, data: Uint8Array, store: LocalForage): Promise<void> => {
  try {
    // store the database
    await store.setItem(dbName, data);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(`SaveDBToStore: ${err.message}`);
  }
}
export const removeDBFromStore = async (dbName: string, store: LocalForage): Promise<void> => {
  try {
    await store.removeItem(dbName);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(`RemoveDBFromStore: ${err.message}`);
  }
}
export const isDBInStore = async (dbName: string, store: LocalForage): Promise<boolean> => {
  try {
    const retDb: Uint8Array = await store.getItem(dbName);
    if(retDb != null && retDb.length > 0) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
} catch (err) {
    return Promise.reject(`IsDBInStore: ${err}`);
  }
}
export const restoreDBFromStore = async (dbName: string, prefix: string, store: LocalForage): Promise<void> => {
  const mFileName = `${prefix}-${dbName}`;
  try {
    // check if file exists
    const isFilePre: boolean = await isDBInStore(mFileName, store);
    if (isFilePre) {
      const isFile: boolean = await isDBInStore(dbName, store);
      if (isFile) {
        const retDb = await getDBFromStore(mFileName, store);
        await saveDBToStore(dbName, retDb, store);
        await removeDBFromStore(mFileName, store);
        return Promise.resolve();
      } else {
        return Promise.reject(
          new Error(`RestoreDBFromStore: ${dbName} does not exist`));
      }
    } else {
      return Promise.reject(
        new Error(`RestoreDBFromStore: ${mFileName} does not exist`));
    }
  } catch (err) {
    return Promise.reject(`RestoreDBFromStore: ${err.message}`);
  }
}
export const copyDBToStore = async (dbName: string, toDb: string, store: LocalForage): Promise<void> => {
  try {
    // check if file exists
    const isFile: boolean = await isDBInStore(dbName, store);
    if (isFile) {
      const retDb = await getDBFromStore(dbName, store);
      await saveDBToStore(toDb, retDb, store);
      return Promise.resolve();
    } else {
      return Promise.reject(
        new Error(`CopyDBToStore: ${dbName} does not exist`));
    }
  } catch (err) {
    return Promise.reject(`CopyDBToStore: ${err.message}`);
  }
}
export const getDBListFromStore = async (store: LocalForage): Promise<string[]> => {
  try {
    const retDbList: string[] = await store.keys();
    return Promise.resolve(retDbList);
  } catch (err) {
    return Promise.reject(`GetDBListFromStore: ${err.message}`);
  }
}
