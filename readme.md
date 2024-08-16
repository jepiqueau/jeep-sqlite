![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

# jeep-sqlite

`jeep-sqlite`is a Stencil component to create SQLite database and query it in the browser. The entire database is stored in an `IndexedDB` store named `jeepSQLiteStore` in a table `databases`. Multiple databases can be stored on this table.

`jeep-sqlite` is based on `sql.js`for SQLite queries and `localforage`for database storage in IndexedDB.

This component might be used in PWA applications. It will also be used in the web implementation of the `@capacitor-community-sqlite`.

This is the reason for having similar API than the `@capacitor-community-sqlite`. Look at the `@capacitor-community-sqlite`documentation and CHANGELOG.md

It will be used at that stage to test the integration with the `@capacitor-community-sqlite` but can also be used in development of `Stencil` or `Ionic/Angular` applications.

Integration in other frameworks (`Vue`, `React`, `Ionic/Vue`, `Ionic/React`,`SolidJS`) are alos available.

Stencil is also great for building entire apps. For that, use the [stencil-app-starter](https://github.com/ionic-team/stencil-app-starter) instead.

!!!!!!!!!!!!!!!!!!!!!!!!!! 
When you get this message

```
I am getting the following error in console in ionic Application.
Error: Uncaught (in promise): TypeError: x is not a function
TypeError: x is not a function
at x (jeep-sqlite.entry.js:2648:80)
at f.onRuntimeInitialized (jeep-sqlite.entry.js:2555:318) 
...
``` 

means that you have to copy the sql-wasm.wasm from node_modules/sql.js/dist/sql-wasm.wasm to your application assets directory
!!!!!!!!!!!!!!!!!!!!!!!!!! 

## Notes
 - Realease 2.8.0 ->>
    Update @stencil/core to 4.20.0
    Update sql.js to 1.11.0
    Merge PR#41: Support production build for bundlers like Vite by setting Stencil extra.enableImportInjection=true  frpm thomasjahoda 

 - Release 2.5.6 ->>
    Step back to sql.js@1.8.0  as sql.js@1.9.0  give an `Error: out of memory` see issue #33.

 - Release 2.5.0 ->>
    - add methods to manage the transaction process flow :
      `beginTransaction, commitTransaction, rollbackTransaction,
       isActiveTransaction` see index_transaction.html
    - upgrade to @stencil/core@4.0.5
    
 - Release 2.3.8 ->>
    - add support for RETURNING in sqlite statement

 - Release 2.3.2 ->>
    - add property `pickText` to customize the pick button text.
    - add property `saveText` to customize the save button text.
    - add property `buttonOptions` to customise the button style.
    - add - From Local Disk to Store - to Usage chapter.
    
 - Release 2.3.1 ->>
    - add `jeepSqliteSaveDatabaseToDisk`event listener.

 - Release 2.3.0 ->>
    Use of the `File System Access API` through the [Browser-FS-Access](https://www.npmjs.com/package/browser-fs-access) module.
    - add `getFromLocalDiskToStore`: read a database from your local disk and save it to the IndexedDB `jeepSqliteStore` store.
    - add `saveToLocalDisk`: save a database to your local disk will allows developers to view the database in separate DB tools like `DB Browser for Sqlite`.
    - add `jeepSqlitePickDatabaseEnded` event listener.
    - add `index_getFromLocalDiskToStore.html` to demonstrate the use of the two new methods.

 - Release 2.1.0, 2.2.0->> DEPRECATED

 - Release 1.6.6 ->>
    fix WAL mode for concurrency access to databases. WAL2 is not supported
    
 - Release 1.6.4 ->> 
    add `jeepSqliteHTTPRequestEnded` event listener

 - Release 1.6.3 ->> 
    add `getFromHTTPRequest` to get database or zip containing multiple database files from a remote server.

 - Release 1.6.2 ->> 
    add database read-only mode

 - Release 1.6.0 ->> 
    Update sql.js@1.8.0
    
 - Release 1.5.8 ->> 
    The API method `addUpgradeStatement` has been modified to define the new structure of the database as a list of incremental upgrades. Every upgrade is executed over the previous version.
    see https://github.com/capacitor-community/sqlite/blob/master/docs/UpgradeDatabaseVersion.md

 - Release 1.5.7 ->> 
    The path for the `sql-wasm.wasm` file which is by default `/assets` can now be specified by adding the property `wasmPath` to `jeep-sqlite`

    - default

    ```
    <jeep-sqlite autoSave="true"></jeep-sqlite>
    ```

    - given the wasm file path

    ```
    <jeep-sqlite autoSave="true" wasmPath="/assets/wasm"></jeep-sqlite>
    ```

 - Release 1.5.0 ->> 

The main change is related to the delete table's rows when a synchronization table exists as well as a last_mofidied table's column, allowing for database synchronization of the local database with a remote server database.

- All existing triggers to YOUR_TABLE_NAME_trigger_last_modified must be modified as follows
  ```
  CREATE TRIGGER YOUR_TABLE_NAME_trigger_last_modified
    AFTER UPDATE ON YOUR_TABLE_NAME
    FOR EACH ROW WHEN NEW.last_modified < OLD.last_modified
    BEGIN
        UPDATE YOUR_TABLE_NAME SET last_modified= (strftime('%s', 'now')) WHERE id=OLD.id;
    END;
  ```
- an new column `sql_deleted` must be added to each of your tables as
  ```
  sql_deleted BOOLEAN DEFAULT 0 CHECK (sql_deleted IN (0, 1))
  ```
  This column will be autommatically set to 1 when you will use a `DELETE FROM ...` sql statement in the `execute`, `run` or `executeSet` methods.

- In the JSON object that you provide to `importFromJson`, all the deleted rows in your remote server database's tables must have the `sql_deleted` column set to 1. This will indicate to the import process to physically delete the corresponding rows in your local database. All the others rows must have the `sql_deleted` column set to 0. 

- In the JSON object outputs by the `exportToJson`, all the deleted rows in your local database have got the `sql_deleted` column set to 1 to help in your synchronization management process with the remote server database. A system `last_exported_date` is automatically saved in the synchronization table at the start of the export process flow.

- On successfull completion of your synchronization management process with the remote server database, you must 
  - Set a new synchronization date (as `(new Date()).toISOString()`) with the `setSyncDate` method.
  - Execute the `deleteExportedRows` method which physically deletes all table's rows having 1 as value for the `sql_deleted` column prior to the `last_exported_date` in your local database.

An example of using this new feature is given in the `index_delete.html` file. It has been used to test the validity of the implementation.


## Getting Started


### Script tag

- Put a script tag similar to this 

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/jeep-sqlite@latest/dist/jeep-sqlite/jeep-sqlite.esm.js"></script>
```
in the head of your index.html
- Then you can use the element anywhere in your template, JSX, html etc

### Node Modules
- Run `npm install jeep-sqlite --save`
- Put a script tag similar to this
 `<script src='node_modules/jeep-sqlite/dist/jeep-sqlite.esm.js'></script>` 
 in the head of your index.html
- Then you can use the element anywhere in your template, JSX, html etc

### In a stencil-starter app
- Run `npm install jeep-sqlite --save`
- Add an import to the npm packages `import jeep-sqlite;`
- Then you can use the element anywhere in your template, JSX, html etc

## Supported methods

| Name                        | Web     |
| :-------------------------- | :------ |
| echo                        | ✅      |
| createConnection            | ✅      |
| closeConnection             | ✅      |
| isConnection                | ✅      |
| open (non-encrypted DB)     | ✅      |
| close                       | ✅      |
| execute                     | ✅      |
| executeSet                  | ✅      |
| run                         | ✅      |
| query                       | ✅      |
| deleteDatabase              | ✅      |
| isDBExists                  | ✅      | 
| isDBOpen                    | ✅      |
| isStoreOpen                 | ✅      |
| isTableExists               | ✅      |
| getVersion                  | ✅      |
| createSyncTable             | ✅      |
| getSyncDate                 | ✅      |
| setSyncDate                 | ✅      |
| isJsonValid                 | ✅      |
| importFromJson              | ✅      |
| exportToJson                | ✅      |
| deleteExportedRows          | ✅      | NEW in 1.5.0
| copyFromAssets              | ✅      |
| addUpgradeStatement         | ✅      |
| isDatabase                  | ✅      |
| getDatabaseList             | ✅      |
| getTableList                | ✅      |
| checkConnectionsConsistency | ✅      |
| saveToStore                 | ✅      |
| getFromHTTPRequest          | ✅      | New in 1.6.3
| getFromLocalDiskToStore     | ✅      | New in 2.3.0
| saveToLocalDisk             | ✅      | New in 2.3.0


The database is saved when you run the methods `close`or `closeConnection`, in the Browser Storage `IndexedDB` as a `localforage` store under the `jeepSqliteStore` name and `databases`table name.

The `copyFromAssets` required to have a `databases.json`file having the name of the databases in the `assets/databases` 

The `databases.json` file is for example
```json
{
  "databaseList" : [
    "dbForCopy.db",
    "myDBSQLite.db"
  ]
}
```
if `dbForCopy.db` and `myDBSQLite.db` are databases located in the `assets/databases` folder.

## Supported Events

| Name                         | Web     |
| :--------------------------- | :------ |
| jeepSqliteImportProgress     | ✅      |
| jeepSqliteExportProgress     | ✅      |
| jeepSqliteHTTPRequestEnded   | ✅      |
| jeepSqlitePickDatabaseEnded  | ✅      |
| jeepSqliteSaveDatabaseToDisk | ✅      |


## Usage


```html
<!DOCTYPE html>
<html dir="ltr" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0" />
    <title>Stencil Component Starter</title>

    <script type="module" src="/build/jeep-sqlite.esm.js"></script>
    <script nomodule src="/build/jeep-sqlite.js"></script>
  </head>
  <body>
    <jeep-sqlite></jeep-sqlite>
  </body>
</html>
<script>
  (async () => {
    await customElements.whenDefined('jeep-sqlite');
    const jeepSqlite = document.querySelector('jeep-sqlite');
      let result = await jeepSqlite.echo("Hello World from Jeep");
      if(await jeepSqlite.isStoreOpen()) {
          try {

            // *** test all basic methods
            await jeepSqlite.createConnection({
                      database:"testNew",
                      version: 1
                  });
              // open db testNew
              await jeepSqlite.open({database: "testNew"});
              const isDB = await jeepSqlite.isDBOpen({database: "testNew"})
              let sql = "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY NOT NULL,email TEXT UNIQUE NOT NULL,name TEXT,company TEXT,size REAL,age INTEGER,last_modified INTEGER DEFAULT (strftime('%s', 'now')));";
              sql += "CREATE INDEX IF NOT EXISTS users_index_name ON users (name);";
              sql += "CREATE INDEX IF NOT EXISTS users_index_last_modified ON users (last_modified);";
              sql += "CREATE TRIGGER IF NOT EXISTS users_trigger_last_modified AFTER UPDATE ON users FOR EACH ROW WHEN NEW.last_modified < OLD.last_modified BEGIN UPDATE users SET last_modified= (strftime('%s', 'now')) WHERE id=OLD.id; END;";
              sql += "PRAGMA user_version = 1;";
              let ret = await jeepSqlite.execute({database: "testNew", statements: sql});
              ret = await jeepSqlite.isTableExists({database: "testNew", table: "users"});
              ret = await jeepSqlite.isTableExists({database: "testNew", table: "contact"});
              // create synchronization table
              ret = await jeepSqlite.createSyncTable({database: "testNew"});
              // set the synchronization date
              let syncDate = "2021-08-01T08:42:25.000Z";
              await jeepSqlite.setSyncDate({database: "testNew", syncdate: syncDate});
              // get the synchronization date
              ret = await jeepSqlite.getSyncDate({database: "testNew"});
              if(ret.syncDate !== 1627807345) {
                throw new Error("Get the synchronization date failed");
              }
              // Insert some Users
              const row = [["Whiteley","Whiteley.com",30,1.83],["Jones","Jones.com",44,1.75]];
              let delUsers = `DELETE FROM users;`;
              delUsers += `VACUUM;`;
              ret = await jeepSqlite.execute({database: "testNew", statements: delUsers, transaction: false});
              let twoUsers = `INSERT INTO users (name,email,age,size) VALUES ("${row[0][0]}","${row[0][1]}",${row[0][2]},${row[0][3]});`;
              twoUsers += `INSERT INTO users (name,email,age,size) VALUES ("${row[1][0]}","${row[1][1]}",${row[1][2]},${row[1][3]});`;
              ret = await jeepSqlite.execute({database: "testNew", statements: twoUsers});
              if (ret.changes.changes !== 2) {
                throw new Error("Execute 3 users failed");
              }
              // Save Database to store
              await jeepSqlite.saveToStore({database: "testNew"});
              // Select all users
              ret = await jeepSqlite.query({database: "testNew",
                                            statement: "SELECT * FROM users;"});
              // Select users where size > 1.80
              ret = await jeepSqlite.query({database: "testNew",
                                            statement: "SELECT * FROM users where size > ?;",
                                            values:[1.80]});
              // add one user with statement and values
              let sqlcmd = "INSERT INTO users (name,email,age,size,company) VALUES (?,?,?,?,?)";
              let values = ["Simpson","Simpson@example.com",69,1.82,null];
              ret = await jeepSqlite.run({database: "testNew",
                                            statement: sqlcmd,
                                            values: values});
              if(ret.changes.lastId !== 3) {
                throw new Error("Run 1 user failed");
              }
              // add one user with statement
              sqlcmd = `INSERT INTO users (name,email,age,size,company) VALUES ` +
                                `("Brown","Brown@example.com",15,1.75,null)`;
              ret = await jeepSqlite.run({database: "testNew",
                          statement: sqlcmd});
              if(ret.changes.lastId !== 4) {
                throw new Error("Run 2 user failed");
              }
              // Select all users
              ret = await jeepSqlite.query({database: "testNew",
                                            statement: "SELECT * FROM users;"});
              if(ret.values.length != 4) {
                throw new Error("Query 3 user failed");
              }

              // *** test ExecuteSet
              await jeepSqlite.createConnection({
                      database:"testSet",
                      version: 1
              });
              ret = await jeepSqlite.isDBExists({database:"testSet"});
              if (ret.result) {
                await jeepSqlite.deleteDatabase({database:"testSet"});
              }
              const createSchemaContacts = `
                CREATE TABLE IF NOT EXISTS contacts (
                  id INTEGER PRIMARY KEY NOT NULL,
                  email TEXT UNIQUE NOT NULL,
                  name TEXT,
                  FirstName TEXT,
                  company TEXT,
                  size REAL,
                  age INTEGER,
                  MobileNumber TEXT
                );
                CREATE INDEX IF NOT EXISTS contacts_index_name ON contacts (name);
                CREATE INDEX IF NOT EXISTS contacts_index_email ON contacts (email);
                PRAGMA user_version = 1;
              `;
              // open db testSet
              await jeepSqlite.open({database: "testSet"});
              const isDBSet = await jeepSqlite.isDBOpen({database: "testSet"})
              const setContacts = [
                { statement:"INSERT INTO contacts (name,FirstName,email,company,age,MobileNumber) VALUES (?,?,?,?,?,?);",
                  values:["Simpson","Tom","Simpson@example.com",null,69,"4405060708"]
                },
                { statement:"INSERT INTO contacts (name,FirstName,email,company,age,MobileNumber) VALUES (?,?,?,?,?,?);",
                  values:[
                    ["Jones","David","Jones@example.com",,42.1,"4404030201"],
                    ["Whiteley","Dave","Whiteley@example.com",,45.3,"4405162732"],
                    ["Brown","John","Brown@example.com",null,35,"4405243853"]
                  ]
                },
                { statement:"UPDATE contacts SET age = ? , MobileNumber = ? WHERE id = ?;",
                  values:[51.4,"4404030202",2]
                }
              ];
              // Create testSet schema
              ret = await jeepSqlite.execute({database: "testSet", statements: createSchemaContacts});
              // Create testSet contact
              ret = await jeepSqlite.executeSet({database: "testSet", set: setContacts});
              if (ret.changes.changes !== 5) {
                return Promise.reject(new Error("ExecuteSet 5 contacts failed"));
              }

              // *** test Import from Json
              const dataToImport = {
                database : "db-from-json",
                version : 1,
                encrypted : false,
                mode : "full",
                tables :[
                  {
                    name: "users",
                    schema: [
                        {column:"id", value: "INTEGER PRIMARY KEY NOT NULL"},
                        {column:"email", value:"TEXT UNIQUE NOT NULL"},
                        {column:"name", value:"TEXT"},
                        {column:"age", value:"REAL"},
                        {column:"last_modified", value:"INTEGER"}
                    ],
                    indexes: [
                        {name: "index_user_on_name",value: "name"},
                        {name: "index_user_on_last_modified",value: "last_modified DESC"},
                        {name: "index_user_on_email_name", value: "email ASC, name", mode: "UNIQUE"}
                    ],
                    values: [
                        [1,"Whiteley.com","Whiteley",30.5,1582536810],
                        [2,"Jones.com","Jones",44.2,1582812800],
                        [3,"Simpson@example.com","Simpson",69,1583570630],
                        [4,"Brown@example.com","Brown",15,1590383895]
                    ]
                  },
                  {
                    name: "messages",
                    schema: [
                      {column:"id", value: "INTEGER PRIMARY KEY NOT NULL"},
                      {column:"title", value:"TEXT NOT NULL"},
                      {column:"body", value:"TEXT NOT NULL"},
                      {column:"last_modified", value:"INTEGER"}
                    ],
                    values: [
                        [1,"test post 1","content test post 1",1587310030],
                        [2,"test post 2","content test post 2",1590388125]
                    ]
                  },
                ]
              };
              // test Json object validity
              result = await jeepSqlite.isJsonValid({jsonstring: JSON.stringify(dataToImport)});
              if(!result.result) {
                return Promise.reject(new Error("IsJsonValid failed"));
              }
              // full import
              result = await jeepSqlite.importFromJson({jsonstring: JSON.stringify(dataToImport)});
              if(result.changes.changes === -1 ) return Promise.reject(new Error("ImportFromJson 'full' dataToImport failed"));
              // create the connection to the database
              await jeepSqlite.createConnection({database:"db-from-json", version: 1});
              // open db testNew
              await jeepSqlite.open({database: "db-from-json"});
              const isDBJson = await jeepSqlite.isDBOpen({database: "db-from-json"})
              if (!isDBJson.result) return Promise.reject(new Error("isDBOpen 'db-from-json' failed"));
              // create synchronization table
              ret = await jeepSqlite.createSyncTable({database: "db-from-json"});
              if (result.changes.changes < 0) return Promise.reject(new Error("CreateSyncTable failed"));
              ret = await jeepSqlite.getSyncDate({database: "db-from-json"});
              if(ret.length === 0) return Promise.reject(new Error("GetSyncDate failed"));
              // Select all users
              ret = await jeepSqlite.query({database: "db-from-json",
                                            statement: "SELECT * FROM users;"});
              if(ret.values.length !== 4 ||
                    ret.values[0].name !== "Whiteley" ||
                    ret.values[1].name !== "Jones" ||
                    ret.values[2].name !== "Simpson" ||
                    ret.values[3].name !== "Brown"  ) {
                return Promise.reject(new Error("Query 1 db-from-json Users failed"));
              }
              await jeepSqlite.closeConnection({database:"db-from-json"});

              const partialImport1 = {
                database : "db-from-json",
                version : 1,
                encrypted : false,
                mode : "partial",
                tables :[
                  {
                      name: "users",
                      values: [
                          [5,"Addington.com","Addington",22.7,1590388335],
                          [6,"Bannister.com","Bannister",59,1590393015],
                          [2,"Jones@example.com","Jones",45,1590393325]

                      ]
                  },
                ]
              };
              // test Json object validity
              result = await jeepSqlite.isJsonValid({jsonstring: JSON.stringify(partialImport1)});
              if(!result.result) {
                return Promise.reject(new Error("IsJsonValid failed"));
              }
              // partial import
              result = await jeepSqlite.importFromJson({jsonstring: JSON.stringify(partialImport1)});
              if(result.changes.changes === -1 ) return Promise.reject(new Error("ImportFromJson 'partial1' dataToImport failed"));


              const partialImport2 = {
                database : "db-from-json",
                version : 1,
                encrypted : false,
                mode : "partial",
                tables :[
                  {
                    name: "messages",

                    indexes: [
                      {name: "index_messages_on_title",value: "title"},
                      {name: "index_messages_on_last_modified",value: "last_modified DESC"}

                    ],
                    values: [
                        [3,"test post 3","content test post 3",1590396146],
                        [4,"test post 4","content test post 4",1590396288]
                    ]
                  }
                ]
              };
              result = await jeepSqlite.importFromJson({jsonstring: JSON.stringify(partialImport2)});
              if(result.changes.changes === -1 ) return Promise.reject(new Error("ImportFromJson 'partial2' dataToImport failed"));

              const partialImport3 = {
                database : "db-from-json",
                version : 1,
                encrypted : false,
                mode : "partial",
                tables :[
                  {
                    name: "test113",
                    schema: [
                      {column:"id", value: "TEXT PRIMARY KEY NOT NULL"},
                      {column:"name", value:"TEXT UNIQUE NOT NULL"},
                      {column:"code", value:"TEXT"},
                      {column:"last_modified", value:"INTEGER"}
                    ],
                    indexes: [
                      {name: "index_test113_on_title",value: "name"},
                      {name: "index_test113_on_last_modified",value: "last_modified DESC"}

                    ],
                    values: [
                        ["ef5c57d5-b885-49a9-9c4d-8b340e4abdbc","valve","BV50",1590396146],
                        ["bced3262-5d42-470a-9585-d3fd12c45452","pipe","PIPE100",1590396288],
                        ["ef5c57d5-b885-49a9-9c4d-8b340e4abdbc","valve","BV100",1590396300],
                    ]
                  }
                ]
              };
              result = await jeepSqlite.importFromJson({jsonstring: JSON.stringify(partialImport3)});
              if(result.changes.changes === -1 ) return Promise.reject(new Error("ImportFromJson 'partial3' dataToImport failed"));

              // create the connection to the database
              await jeepSqlite.createConnection({database:"db-from-json", version: 1});
              // open db testNew
              await jeepSqlite.open({database: "db-from-json"});
              // Select all users
              ret = await jeepSqlite.query({database: "db-from-json",
                                            statement: "SELECT * FROM users;"});
              if(ret.values.length !== 6 ||
                    ret.values[0].name !== "Whiteley" ||
                    ret.values[1].name !== "Jones" ||
                    ret.values[2].name !== "Simpson" ||
                    ret.values[3].name !== "Brown" ||
                    ret.values[4].name !== "Addington" ||
                    ret.values[5].name !== "Bannister" ) {
                return Promise.reject(new Error("Query 2 db-from-json Users failed"));
              }

              // Select all messages
              ret = await jeepSqlite.query({database: "db-from-json",
                                            statement: "SELECT * FROM messages;"});
              if(ret.values.length !== 4 ||
                    ret.values[0].title !== "test post 1" ||
                    ret.values[1].title !== "test post 2" ||
                    ret.values[2].title !== "test post 3" ||
                    ret.values[3].title !== "test post 4" ) {
                return Promise.reject(new Error("Query 3 db-from-json Messages failed"));
              }

              // *** test Export to Json
              // test full export
              let jsonObj = await jeepSqlite.exportToJson({database: "db-from-json",jsonexportmode: 'full'});
              // test Json object validity
              result = await jeepSqlite.isJsonValid({jsonstring: JSON.stringify(jsonObj.export)});
              if(!result.result) {
                return Promise.reject(new Error("IsJsonValid 'full' export failed"));
              }
              //test partial export
              syncDate = "2020-05-20T18:40:00.000Z";
              await jeepSqlite.setSyncDate({database: "db-from-json", syncdate: syncDate});
              jsonObj = await jeepSqlite.exportToJson({database: "db-from-json",jsonexportmode: 'partial'});
              // test Json object validity
              result = await jeepSqlite.isJsonValid({jsonstring: JSON.stringify(jsonObj.export)});
              if(!result.result) {
                return Promise.reject(new Error("IsJsonValid 'partial' export failed"));
              }
              if(jsonObj.export.tables.length != 3 || jsonObj.export.tables[0].name != 'users'
                  || jsonObj.export.tables[1].name != 'messages'
                  || jsonObj.export.tables[2].name != 'test113'
                  || jsonObj.export.tables[0].values.length != 4
                  || jsonObj.export.tables[1].values.length != 3
                  || jsonObj.export.tables[2].values.length != 2) {
                return Promise.reject(new Error("IsJsonValid 'partial' export failed: No 4 tables"));
              }

              await jeepSqlite.closeConnection({database:"testNew"});
              await jeepSqlite.closeConnection({database:"testSet"});
              await jeepSqlite.closeConnection({database:"db-from-json"});

              // *** test copy from asset ***

              await jeepSqlite.copyFromAssets();
              // create connection to myDB
              await jeepSqlite.createConnection({database:"myDB",version: 1});
              // open db myDB
              await jeepSqlite.open({database: "myDB"});
              let statement = `SELECT name FROM sqlite_master WHERE type='table';`;
              // Select all tables
              ret = await jeepSqlite.query({database: "myDB",
                                            statement: statement});
              if(ret.values.length !== 3 ||
                  ret.values[0].name !== "users" ||
                  ret.values[1].name !== "messages" ||
                  ret.values[2].name !== "sync_table"
              ) {
                throw new Error("Query MyDB Tables failed");
              }

              // Select all users
              ret = await jeepSqlite.query({database: "myDB",
                                            statement: "SELECT * FROM users;"});
              if(ret.values.length != 7 ||
                  ret.values[0].name !== "Whiteley" ||
                  ret.values[1].name !== "Jones" ||
                  ret.values[2].name !== "Simpson" ||
                  ret.values[3].name !== "Brown" ||
                  ret.values[4].name !== "Jackson" ||
                  ret.values[5].name !== "Kennedy" ||
                  ret.values[6].name !== "Bush"
              ) {
                throw new Error("Query MyDB Users failed");
              }
              await jeepSqlite.closeConnection({database:"myDB"});
              // create connection to dbForCopy
              await jeepSqlite.createConnection({database:"dbForCopy",version: 1});
              // open db myDB
              await jeepSqlite.open({database: "dbForCopy"});
              // Select all users
              ret = await jeepSqlite.query({database: "dbForCopy",
                                            statement: "SELECT * FROM areas;"});
              if(ret.values.length != 3 ||
                  ret.values[0].name !== "Access road" ||
                  ret.values[1].name !== "Accessway" ||
                  ret.values[2].name !== "Air handling system"              ) {
                throw new Error("Query dbForCopy Areas failed");
              }
              await jeepSqlite.closeConnection({database:"dbForCopy"});

              // *** test upgrade version ***
              // create database version 1
              await jeepSqlite.createConnection({
                      database:"test-updversion",
                      version: 1
              });
              // delete the database if exists (multiple runs)
              ret = await jeepSqlite.isDBExists({database:"test-updversion"});
              if (ret.result) {
                await jeepSqlite.deleteDatabase({database:"test-updversion"});
              }
              // open db test-updversion
              await jeepSqlite.open({database: "test-updversion"});
              const createSchemaVersion1 = `
                CREATE TABLE IF NOT EXISTS users (
                  id INTEGER PRIMARY KEY NOT NULL,
                  email TEXT UNIQUE NOT NULL,
                  name TEXT,
                  company TEXT,
                  size REAL,
                  age INTEGER,
                  last_modified INTEGER DEFAULT (strftime('%s', 'now'))
                );
                CREATE INDEX IF NOT EXISTS users_index_name ON users (name);
                CREATE INDEX IF NOT EXISTS users_index_last_modified ON users (last_modified);
                CREATE TRIGGER IF NOT EXISTS users_trigger_last_modified
                  AFTER UPDATE ON users
                  FOR EACH ROW WHEN NEW.last_modified < OLD.last_modified
                  BEGIN
                      UPDATE users SET last_modified= (strftime('%s', 'now')) WHERE id=OLD.id;
                  END;
              `;
              // Create test-updversion schema
              ret = await jeepSqlite.execute({database: "test-updversion", statements: createSchemaVersion1});
              if (ret.changes.changes < 0) {
                throw new Error("Execute createSchemaVersion1 failed");
              }
              // Insert some Users
              const rowU = [["Whiteley","Whiteley.com",30.5],["Jones","Jones.com",44]];
              const twoUsersU = `
                DELETE FROM users;
                INSERT INTO users (name,email,age) VALUES ("${rowU[0][0]}","${rowU[0][1]}",${rowU[0][2]});
                INSERT INTO users (name,email,age) VALUES ("${rowU[1][0]}","${rowU[1][1]}",${rowU[1][2]});
              `;
              ret = await jeepSqlite.execute({database: "test-updversion", statements: twoUsersU});
              if (ret.changes.changes !== 2) {
                throw new Error("Execute twoUsers failed");
              }
              // Select all users
              ret = await jeepSqlite.query({database: "test-updversion",
                                            statement: "SELECT * FROM users;"});
              if(ret.values.length !== 2 ||
                    ret.values[0].name !== "Whiteley" ||
                    ret.values[1].name !== "Jones") {
                throw new Error("Query 2 Users failed");
              }
              await jeepSqlite.closeConnection({database:"test-updversion"});
              // create version 2 of test-updversion
              const createSchemaVersion2 = `
                CREATE TABLE users (
                  id INTEGER PRIMARY KEY NOT NULL,
                  email TEXT UNIQUE NOT NULL,
                  name TEXT,
                  company TEXT,
                  country TEXT,
                  age INTEGER,
                  last_modified INTEGER DEFAULT (strftime('%s', 'now'))
                );
                CREATE TABLE messages (
                  id INTEGER PRIMARY KEY NOT NULL,
                  userid INTEGER,
                  title TEXT NOT NULL,
                  body TEXT NOT NULL,
                  last_modified INTEGER DEFAULT (strftime('%s', 'now')),
                  FOREIGN KEY (userid) REFERENCES users(id) ON DELETE SET DEFAULT
                );
                CREATE INDEX users_index_name ON users (name);
                CREATE INDEX users_index_last_modified ON users (last_modified);
                CREATE INDEX messages_index_title ON messages (title);
                CREATE INDEX messages_index_last_modified ON messages (last_modified);
                CREATE TRIGGER users_trigger_last_modified
                  AFTER UPDATE ON users
                  FOR EACH ROW WHEN NEW.last_modified < OLD.last_modified
                  BEGIN
                      UPDATE users SET last_modified= (strftime('%s', 'now')) WHERE id=OLD.id;
                  END;
                CREATE TRIGGER messages_trigger_last_modified
                  AFTER UPDATE ON messages
                  FOR EACH ROW WHEN NEW.last_modified < OLD.last_modified
                  BEGIN
                      UPDATE messages SET last_modified= (strftime('%s', 'now')) WHERE id=OLD.id;
                  END;
              `;
              setArrayVersion2 = [
                { statement:"INSERT INTO messages (userid,title,body) VALUES (?,?,?);",
                  values:[
                    [1,"test message 1","content test message 1"],
                    [2,"test message 2","content test message 2"],
                    [1,"test message 3","content test message 3"]
                  ]
                },
                { statement:"UPDATE users SET country = ?  WHERE id = ?;",
                  values:["United Kingdom",1]
                },
                { statement:"UPDATE users SET country = ?  WHERE id = ?;",
                  values:["Australia",2]
                },

              ];
              await jeepSqlite.addUpgradeStatement({database: "test-updversion",
                upgrade: [{fromVersion: 1, toVersion: 2, statement: createSchemaVersion2,
                           set: setArrayVersion2}]
                });

              await jeepSqlite.createConnection({
                      database:"test-updversion",
                      version: 2
              });
              await jeepSqlite.open({database: "test-updversion"});
              // select all user's country in db
              ret = await jeepSqlite.query({database: "test-updversion",
                                            statement: "SELECT country FROM users;"});
              if(ret.values.length !== 2 ||
                    ret.values[0].country !== "United Kingdom" ||
                    ret.values[1].country !== "Australia") {
                throw new Error("Query Version 2 Users failed");
              }
              // select all messages for user 1
              const userMessages = `
                SELECT users.name,messages.title,messages.body FROM users
                INNER JOIN messages ON users.id = messages.userid
                WHERE users.id = ?;
              `;
              ret = await jeepSqlite.query({database: "test-updversion",
                                            statement: userMessages,
                                            values : [1]});
              if(ret.values.length !== 2 ||
                  ret.values[0].name !== "Whiteley" ||
                  ret.values[0].title !== "test message 1" ||
                  ret.values[1].name !== "Whiteley" ||
                  ret.values[1].title !== "test message 3") {
                return Promise.reject(new Error("Query Messages User 1 Version 2 failed"));
              }
              // select all messages for user 2
              ret = await jeepSqlite.query({database: "test-updversion",
                                            statement: userMessages,
                                            values : [2]});
              if(ret.values.length !== 1 ||
                  ret.values[0].name !== "Jones" ||
                  ret.values[0].title !== "test message 2") {
                return Promise.reject(new Error("Query Messages User 2 Version 2 failed"));
              }
              // close the connection test-updversion
              await jeepSqlite.closeConnection({database:"test-updversion"});

              console.log("db success");
          } catch (err) {
            console.log(`Error ${err}`);
          }
      } else {
        console.log("store creation failed")
      }
  })();
</script>

```

### - From Local Disk to Store -

A database can be read from the local disk by using the `File System Access API`, save to the store, open through a standard connection.

Standard CRUD operations can then being performed, the modifications are save to the store for persistent storage during the session on user's request or at the connection close.

Before closing the connection, the database might also be saved back to the local disk for secure persistent storage (backup) and/or database visibility through the use of SQLite third party tools like DB Browser for SQLite.  

 - [from local disk to store](https://github.com/jepiqueau/jeep-sqlite/blob/master/src/index_getFromLocalDiskToStore.html)