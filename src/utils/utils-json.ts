import { JsonColumn, JsonIndex, JsonTrigger, JsonView } from '../interfaces/interfaces';
import { queryAll } from './utils-sqlite';

export const isJsonSQLite = async (obj: any): Promise<boolean> => {
  const keyFirstLevel: string[] = [
    'database',
    'version',
    'overwrite',
    'encrypted',
    'mode',
    'tables',
    'views'
  ];
  if (
    obj == null ||
    (Object.keys(obj).length === 0 && obj.constructor === Object)
  )
    return false;
  for (const key of Object.keys(obj)) {
    if (keyFirstLevel.indexOf(key) === -1) return false;
    if (key === 'database' && typeof obj[key] != 'string') return false;
    if (key === 'version' && typeof obj[key] != 'number') return false;
    if (key === 'overwrite' && typeof obj[key] != 'boolean') return false;
    if (key === 'encrypted' && typeof obj[key] != 'boolean') return false;
    if (key === 'mode' && typeof obj[key] != 'string') return false;
    if (key === 'tables' && typeof obj[key] != 'object') return false;
    if (key === 'tables') {
      for (const oKey of obj[key]) {
        const retTable: boolean = await isTable(oKey);
        if (!retTable) return false;
      }
    }
    if (key === 'views' && typeof obj[key] != 'object') return false;
    if (key === 'views') {
      for (const oKey of obj[key]) {
        const retView: boolean = await isView(oKey);
        if (!retView) return false;
      }
    }

  }
  return true;
}
export const isTable = async (obj: any): Promise<boolean> => {
  const keyTableLevel: string[] = [
    'name',
    'schema',
    'indexes',
    'triggers',
    'values',
  ];
  let nbColumn = 0;
  if (
    obj == null ||
    (Object.keys(obj).length === 0 && obj.constructor === Object)
  )
    return false;
  for (const key of Object.keys(obj)) {
    if (keyTableLevel.indexOf(key) === -1) return false;
    if (key === 'name' && typeof obj[key] != 'string') return false;
    if (key === 'schema' && typeof obj[key] != 'object') return false;
    if (key === 'indexes' && typeof obj[key] != 'object') return false;
    if (key === 'triggers' && typeof obj[key] != 'object') return false;
    if (key === 'values' && typeof obj[key] != 'object') return false;
    if (key === 'schema') {
      obj['schema'].forEach(
        (element: {
          column?: string;
          value: string;
          foreignkey?: string;
          primarykey?: string;
          constraint?: string;
        }) => {
          if (element.column) {
            nbColumn++;
          }
        },
      );
      for (let i = 0; i < nbColumn; i++) {
        const retSchema: boolean = await isSchema(obj[key][i]);
        if (!retSchema) return false;
      }
    }
    if (key === 'indexes') {
      for (const oKey of obj[key]) {
        const retIndexes: boolean = await isIndexes(oKey);
        if (!retIndexes) return false;
      }
    }
    if (key === 'triggers') {
      for (const oKey of obj[key]) {
        const retTriggers: boolean = await isTriggers(oKey);
        if (!retTriggers) return false;
      }
    }
    if (key === 'values') {
      if (nbColumn > 0) {
        for (const oKey of obj[key]) {
          if (typeof oKey != 'object' || oKey.length != nbColumn)
            return false;
        }
      }
    }
  }

  return true;
}
export const isSchema = async (obj: any): Promise<boolean> => {
  const keySchemaLevel: string[] = [
    'column',
    'value',
    'foreignkey',
    'primarykey',
    'constraint',
  ];
  if (
    obj == null ||
    (Object.keys(obj).length === 0 && obj.constructor === Object)
  )
    return false;
  for (const key of Object.keys(obj)) {
    if (keySchemaLevel.indexOf(key) === -1) return false;
    if (key === 'column' && typeof obj[key] != 'string') return false;
    if (key === 'value' && typeof obj[key] != 'string') return false;
    if (key === 'foreignkey' && typeof obj[key] != 'string') return false;
    if (key === 'primarykey' && typeof obj[key] != 'string') return false;
    if (key === 'constraint' && typeof obj[key] != 'string') return false;
  }
  return true;
}
export const isIndexes = async (obj: any): Promise<boolean> => {
  const keyIndexesLevel: string[] = ['name', 'value', 'mode'];
  if (
    obj == null ||
    (Object.keys(obj).length === 0 && obj.constructor === Object)
  )
    return false;
  for (const key of Object.keys(obj)) {
    if (keyIndexesLevel.indexOf(key) === -1) return false;
    if (key === 'name' && typeof obj[key] != 'string') return false;
    if (key === 'value' && typeof obj[key] != 'string') return false;
    if (
      key === 'mode' &&
      (typeof obj[key] != 'string' || obj[key].toUpperCase() != 'UNIQUE')
    )
      return false;
  }
  return true;
}
export const isTriggers = async (obj: any): Promise<boolean> => {
  const keyTriggersLevel: string[] = [
    'name',
    'timeevent',
    'condition',
    'logic',
  ];
  if (
    obj == null ||
    (Object.keys(obj).length === 0 && obj.constructor === Object)
  )
    return false;
  for (const key of Object.keys(obj)) {
    if (keyTriggersLevel.indexOf(key) === -1) return false;
    if (key === 'name' && typeof obj[key] != 'string') return false;
    if (key === 'timeevent' && typeof obj[key] != 'string') return false;
    if (key === 'condition' && typeof obj[key] != 'string') return false;
    if (key === 'logic' && typeof obj[key] != 'string') return false;
  }
  return true;
}
export const isView = async (obj: any): Promise<boolean> => {
  const keyViewLevel: string[] = ['name', 'value'];
  if (
    obj == null ||
    (Object.keys(obj).length === 0 && obj.constructor === Object)
  )
    return false;
  for (const key of Object.keys(obj)) {
    if (keyViewLevel.indexOf(key) === -1) return false;
    if (key === 'name' && typeof obj[key] != 'string') return false;
    if (key === 'value' && typeof obj[key] != 'string') return false;
  }
  return true;
}
export const checkSchemaValidity = async (schema: JsonColumn[]): Promise<void> => {
  for (let i = 0; i < schema.length; i++) {
    const sch: JsonColumn = {} as JsonColumn;
    const keys: string[] = Object.keys(schema[i]);
    if (keys.includes('column')) {
      sch.column = schema[i].column;
    }
    if (keys.includes('value')) {
      sch.value = schema[i].value;
    }
    if (keys.includes('foreignkey')) {
      sch.foreignkey = schema[i].foreignkey;
    }
    if (keys.includes('constraint')) {
      sch.constraint = schema[i].constraint;
    }
    const isValid: boolean = await isSchema(sch);
    if (!isValid) {
      return Promise.reject(
        new Error(`CheckSchemaValidity: schema[${i}] not valid`),
      );
    }
  }
  return Promise.resolve();
}

export const checkIndexesValidity = async (indexes: JsonIndex[]): Promise<void> => {
  for (let i = 0; i < indexes.length; i++) {
    const index: JsonIndex = {} as JsonIndex;
    const keys: string[] = Object.keys(indexes[i]);
    if (keys.includes('value')) {
      index.value = indexes[i].value;
    }
    if (keys.includes('name')) {
      index.name = indexes[i].name;
    }
    if (keys.includes('mode')) {
      index.mode = indexes[i].mode;
    }

    const isValid: boolean = await isIndexes(index);
    if (!isValid) {
      return Promise.reject(
        new Error(`CheckIndexesValidity: indexes[${i}] not valid`),
      );
    }
  }
  return Promise.resolve();
}
export const checkTriggersValidity = async (triggers: JsonTrigger[]): Promise<void> => {
  for (let i = 0; i < triggers.length; i++) {
    const trigger: JsonTrigger = {} as JsonTrigger;
    const keys: string[] = Object.keys(triggers[i]);
    if (keys.includes('logic')) {
      trigger.logic = triggers[i].logic;
    }
    if (keys.includes('name')) {
      trigger.name = triggers[i].name;
    }
    if (keys.includes('timeevent')) {
      trigger.timeevent = triggers[i].timeevent;
    }
    if (keys.includes('condition')) {
      trigger.condition = triggers[i].condition;
    }

    const isValid: boolean = await isTriggers(trigger);
    if (!isValid) {
      return Promise.reject(
        new Error(`CheckTriggersValidity: triggers[${i}] not valid`),
      );
    }
  }
  return Promise.resolve();
}
export const checkViewsValidity = async (views: JsonView[]): Promise<void> => {
  for (let i = 0; i < views.length; i++) {
    const view: JsonView = {} as JsonView;
    const keys: string[] = Object.keys(views[i]);
    if (keys.includes('value')) {
      view.value = views[i].value;
    }
    if (keys.includes('name')) {
      view.name = views[i].name;
    }

    const isValid: boolean = await isView(view);
    if (!isValid) {
      return Promise.reject(
        new Error(`CheckViewsValidity: views[${i}] not valid`),
      );
    }
  }
  return Promise.resolve();
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
export const getValues = async (db: any, query: string, tableName: string): Promise<any[]> => {
  const values: any[] = [];
  try {
    // get table column names and types
    const tableNamesTypes = await getTableColumnNamesTypes(db, tableName);
    let rowNames: string[] = [];
    if (Object.keys(tableNamesTypes).includes('names')) {
      rowNames = tableNamesTypes.names;
    } else {
      return Promise.reject(
        new Error(`GetValues: Table ${tableName} no names`),
      );
    }
    const retValues = await queryAll(db, query, []);
    for (const rValue of retValues) {
      const row: any[] = [];
      for (const rName of rowNames) {
        if (Object.keys(rValue).includes(rName)) {
          row.push(rValue[rName]);
        } else {
          row.push(null);
        }
      }
      values.push(row);
    }
    return Promise.resolve(values);
  } catch (err) {
    return Promise.reject(new Error(`GetValues: ${err.message}`));
  }
}


