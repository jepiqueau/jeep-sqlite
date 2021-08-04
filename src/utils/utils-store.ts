export const getDBFromStore = async (dbName: string, store: LocalForage): Promise<Uint8Array> => {
  try {
    const retDb: Uint8Array = await store.getItem(dbName);
    return Promise.resolve(retDb);
  } catch (err) {
    return Promise.reject(`in getDBFromStore ${err.message}`);
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
    return Promise.reject(`in setDBToStore ${err.message}`);
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
    return Promise.reject(`in setDBToStore ${err.message}`);
  }
}
export const saveDBToStore = async (dbName: string, data: Uint8Array, store: LocalForage): Promise<void> => {
  try {
    // store the database
    await store.setItem(dbName, data);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(`in setDBToStore ${err.message}`);
  }
}
export const removeDBFromStore = async (dbName: string, store: LocalForage): Promise<void> => {
  try {
    await store.removeItem(dbName);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(`in removeDBFromStore ${err.message}`);
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
    return Promise.reject(`in isDBInStore ${err}`);
  }
}
