export const isJsonSQLite = async (obj: any): Promise<boolean> => {
  const keyFirstLevel: string[] = [
    'database',
    'version',
    'encrypted',
    'mode',
    'tables',
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
    if (key === 'encrypted' && typeof obj[key] != 'boolean') return false;
    if (key === 'mode' && typeof obj[key] != 'string') return false;
    if (key === 'tables' && typeof obj[key] != 'object') return false;
    if (key === 'tables') {
      for (const oKey of obj[key]) {
        const retTable: boolean = await isTable(oKey);
        if (!retTable) return false;
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
      (typeof obj[key] != 'string' || obj[key] != 'UNIQUE')
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


