![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

# jeep-sqlite

`jeep-sqlite`is a Stencil component to create SQLite database and query it in the browser. The entire database is stored in an `IndexedDB` store named `jeepSQLiteStore` in a table `databases`. Multiple databases can be stored on this table.

`jeep-sqlite` is based on `sql.js`for SQLite queries and `localforage`for database storage in IndexedDB.

This component might be used in PWA applications. It will also be used in the web implementation of the `@capacitor-community-sqlite`.

This is the reason for having similar API than the `@capacitor-community-sqlite`.

This is the initial version `ALPHA` and does not include all the functionalities especially in the import and export of databases.

It will be used at that stage to test the integration with the `@capacitor-community-sqlite` but can also be used in development of `Stencil` or `Ionic/Angular` applications.

Integration in other frameworks (`Vue`, `React`, `Ionic/Vue`, `Ionic/React`) will be looked at later but if some of you want to contribute feel free.

Stencil is also great for building entire apps. For that, use the [stencil-app-starter](https://github.com/ionic-team/stencil-app-starter) instead.

# Stencil

Stencil is a compiler for building fast web apps using Web Components.

Stencil combines the best concepts of the most popular frontend frameworks into a compile-time rather than run-time tool.  Stencil takes TypeScript, JSX, a tiny virtual DOM layer, efficient one-way data binding, an asynchronous rendering pipeline (similar to React Fiber), and lazy-loading out of the box, and generates 100% standards-based Web Components that run in any browser supporting the Custom Elements v1 spec.

Stencil components are just Web Components, so they work in any major framework or with no framework at all.


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
| createConnection            | ✅      |
| closeConnection             | ✅      |
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
| createSyncTable             | ✅      |
| getSyncDate                 | ✅      |
| setSyncDate                 | ✅      |
| isJsonValid                 | ✅      |
| importFromJson              | ✅      |
| exportToJson                | ✅      |
| copyFromAssets              | ✅      |


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
    console.log("jeepSqlite " + JSON.stringify(jeepSqlite));
      console.log("$$$ in script before createConnection");
      let result = await jeepSqlite.echo("Hello World from Jeep");
      console.log("from Echo " + result.value);
      if(await jeepSqlite.isStoreOpen()) {
          try {
            await jeepSqlite.createConnection({
                      database:"testNew",
                      version: 1
                  });
            // open db testNew
              await jeepSqlite.open({database: "testNew"});
              const isDB = await jeepSqlite.isDBOpen({database: "testNew"})
              console.log(`in script ${JSON.stringify(isDB)}`);
              let sql = "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY NOT NULL,email TEXT UNIQUE NOT NULL,name TEXT,company TEXT,size REAL,age INTEGER,last_modified INTEGER DEFAULT (strftime('%s', 'now')));";
              sql += "CREATE INDEX IF NOT EXISTS users_index_name ON users (name);";
              sql += "CREATE INDEX IF NOT EXISTS users_index_last_modified ON users (last_modified);";
              sql += "CREATE TRIGGER IF NOT EXISTS users_trigger_last_modified AFTER UPDATE ON users FOR EACH ROW WHEN NEW.last_modified <= OLD.last_modified BEGIN UPDATE users SET last_modified= (strftime('%s', 'now')) WHERE id=OLD.id; END;";
              sql += "PRAGMA user_version = 1;";
              console.log("@@@ sql " + sql);
              let ret = await jeepSqlite.execute({database: "testNew", statements: sql});
              console.log(`after Execute 1 ${JSON.stringify(ret)}`);
              // Insert some Users
              const row = [["Whiteley","Whiteley.com",30,1.83],["Jones","Jones.com",44,1.75]];
              let delUsers = `DELETE FROM users;`;
              delUsers += `VACUUM;`;
              ret = await jeepSqlite.execute({database: "testNew", statements: delUsers, transaction: false});
              console.log(`after Execute 2 ${JSON.stringify(ret)}`);
              let twoUsers = `INSERT INTO users (name,email,age,size) VALUES ("${row[0][0]}","${row[0][1]}",${row[0][2]},${row[0][3]});`;
              twoUsers += `INSERT INTO users (name,email,age,size) VALUES ("${row[1][0]}","${row[1][1]}",${row[1][2]},${row[1][3]});`;
              ret = await jeepSqlite.execute({database: "testNew", statements: twoUsers});
              console.log(`after Execute 3 ${JSON.stringify(ret)}`);
              if (ret.changes.changes !== 2) {
                throw new Error("Execute 3 users failed");
              }
              // Select all users
              ret = await jeepSqlite.query({database: "testNew",
                                            statement: "SELECT * FROM users;"});
              console.log(`after Query 1 ${JSON.stringify(ret)}`);
              // Select users where size > 1.80
              ret = await jeepSqlite.query({database: "testNew",
                                            statement: "SELECT * FROM users where size > ?;",
                                            values:[1.80]});
              console.log(`after Query 2 ${JSON.stringify(ret)}`);
              // add one user with statement and values
              let sqlcmd = "INSERT INTO users (name,email,age,size,company) VALUES (?,?,?,?,?)";
              let values = ["Simpson","Simpson@example.com",69,1.82,null];
              ret = await jeepSqlite.run({database: "testNew",
                                            statement: sqlcmd,
                                            values: values});
              console.log(`after run 1: ${JSON.stringify(ret)} `);
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
              console.log(`after Query 3 ${JSON.stringify(ret)}`);
              if(ret.values.length != 4) {
                throw new Error("Query 3 user failed");
              }
              // Test executeSet
              await jeepSqlite.createConnection({
                      database:"testSet",
                      version: 1
              });
              ret = await jeepSqlite.isDBExists({database:"testSet"});
              console.log(`is "testSet" database exist : ${ret.result}`);
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
              console.log(`after Contact Execute 1 ${JSON.stringify(ret)}`);
              // Create testSet contact
              ret = await jeepSqlite.executeSet({database: "testSet", set: setContacts});
              console.log(`after Contact Execute 1 ${JSON.stringify(ret)}`);
              if (ret.changes.changes !== 5) {
                return Promise.reject(new Error("ExecuteSet 5 contacts failed"));
              }


              await jeepSqlite.closeConnection({database:"testNew"});
              await jeepSqlite.closeConnection({database:"testSet"});
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
