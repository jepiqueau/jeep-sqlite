# Stencil Applications

## Getting started

- Run 

```bash
npm install --save jeep-sqlite
npm install --save-dev rollup-plugin-node-polyfills
```

- Add an import to the npm packages `import jeep-sqlite;` in the `app.ts` file

- Modify the `stencil.config.ts` has followed

```js
import { Config } from '@stencil/core';
import nodePolyfills from 'rollup-plugin-node-polyfills';

// https://stenciljs.com/docs/config

export const config: Config = {
  globalScript: 'src/global/app.ts',
  globalStyle: 'src/global/app.css',
  taskQueue: 'async',
  rollupPlugins: {
    after: [
      nodePolyfills(),
    ]
  },
  outputTargets: [{
    type: 'www',
    serviceWorker: null,
    copy: [
      { src: '../node_modules/sql.js/dist/sql-wasm.wasm', dest: 'assets/sql-wasm.wasm' },
    ]
}],
};
```

- Then you can use the element anywhere in your template, JSX, html etc

## Usage 

```js
import { Component, h } from '@stencil/core';
@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css',
})
export class AppHome {
  async componentDidLoad() {
    console.log('The component has been rendered');
    await customElements.whenDefined('jeep-sqlite');
    const jeepSqlite: HTMLJeepSqliteElement = document.querySelector('jeep-sqlite');
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
          // Delete all users
          let delUsers = `DELETE FROM users;`;
          delUsers += `VACUUM;`;
          ret = await jeepSqlite.execute({database: "testNew", statements: delUsers, transaction: false});
          console.log(`after Execute 2 ${JSON.stringify(ret)}`);
          // Insert some Users
          const row = [["Whiteley","Whiteley.com",30,1.83],["Jones","Jones.com",44,1.75]];            
          let twoUsers = `INSERT INTO users (name,email,age,size) VALUES ("${row[0][0]}","${row[0][1]}",${row[0][2]},${row[0][3]});`;
          twoUsers += `INSERT INTO users (name,email,age,size) VALUES ("${row[1][0]}","${row[1][1]}",${row[1][2]},${row[1][3]});`;
          ret = await jeepSqlite.execute({database: "testNew", statements: twoUsers});
          console.log(`after Execute 3 ${JSON.stringify(ret)}`);
          if (ret.changes.changes !== 2) {
            throw new Error("Execute 3 users failed");
          }
          // Select all users
          let retValues = await jeepSqlite.query({database: "testNew",
                                        statement: "SELECT * FROM users;"});
          console.log(`after Query 1 ${JSON.stringify(retValues)}`);
          // Select users where size > 1.80
          retValues = await jeepSqlite.query({database: "testNew",
                                        statement: "SELECT * FROM users where size > ?;",
                                        values:[1.80]});
          console.log(`after Query 2 ${JSON.stringify(retValues)}`);
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
          retValues = await jeepSqlite.query({database: "testNew",
                                        statement: "SELECT * FROM users;"});
          console.log(`after Query 3 ${JSON.stringify(retValues)}`);
          if(retValues.values.length != 4) {
            throw new Error("Query 3 user failed");
          }
          // Test executeSet
          await jeepSqlite.createConnection({
              database:"testSet",
              version: 1
          });
          const isDBSetExists = await jeepSqlite.isDBExists({database:"testSet"});
          console.log(`is "testSet" database exist : ${isDBSetExists.result}`);
          if (isDBSetExists.result) {
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
          const isDBSetOpen = await jeepSqlite.isDBOpen({database: "testSet"});
          if (!isDBSetOpen.result) {
            return Promise.reject(new Error(`testSet isDBSetOpen failed to open`));
          }
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
          let isJsonValid = await jeepSqlite.isJsonValid({jsonstring: JSON.stringify(dataToImport)});
          if(!isJsonValid.result) {
            return Promise.reject(new Error("IsJsonValid failed"));
          }
          // full import
          ret = await jeepSqlite.importFromJson({jsonstring: JSON.stringify(dataToImport)});
          if(ret.changes.changes === -1 ) return Promise.reject(new Error("ImportFromJson 'full' dataToImport failed"));
          // create the connection to the database
          await jeepSqlite.createConnection({database:"db-from-json", version: 1});
          // open db testNew
          await jeepSqlite.open({database: "db-from-json"});
          const isDBJson = await jeepSqlite.isDBOpen({database: "db-from-json"})
          if (!isDBJson.result) return Promise.reject(new Error("isDBOpen 'db-from-json' failed"));
          // create synchronization table
          ret = await jeepSqlite.createSyncTable({database: "db-from-json"});
          if (ret.changes.changes < 0) return Promise.reject(new Error("CreateSyncTable failed"));
          let retSyncDate = await jeepSqlite.getSyncDate({database: "db-from-json"});
          if(!retSyncDate.syncDate) return Promise.reject(new Error("GetSyncDate failed"));
          // Select all users
          retValues = await jeepSqlite.query({database: "db-from-json",
                                        statement: "SELECT * FROM users;"});
          if(retValues.values.length !== 4 ||
              retValues.values[0].name !== "Whiteley" ||
              retValues.values[1].name !== "Jones" ||
              retValues.values[2].name !== "Simpson" ||
              retValues.values[3].name !== "Brown"  ) {
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
          isJsonValid = await jeepSqlite.isJsonValid({jsonstring: JSON.stringify(partialImport1)});
          if(!isJsonValid.result) {
            return Promise.reject(new Error("IsJsonValid failed"));
          }
          // partial import
          ret = await jeepSqlite.importFromJson({jsonstring: JSON.stringify(partialImport1)});
          if(ret.changes.changes === -1 ) return Promise.reject(new Error("ImportFromJson 'partial1' dataToImport failed"));


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
          ret = await jeepSqlite.importFromJson({jsonstring: JSON.stringify(partialImport2)});
          if(ret.changes.changes === -1 ) return Promise.reject(new Error("ImportFromJson 'partial2' dataToImport failed"));

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
          ret = await jeepSqlite.importFromJson({jsonstring: JSON.stringify(partialImport3)});
          if(ret.changes.changes === -1 ) return Promise.reject(new Error("ImportFromJson 'partial3' dataToImport failed"));

          // create the connection to the database
          await jeepSqlite.createConnection({database:"db-from-json", version: 1});
          // open db testNew
          await jeepSqlite.open({database: "db-from-json"});
          // Select all users
          retValues = await jeepSqlite.query({database: "db-from-json",
                                        statement: "SELECT * FROM users;"});
          if(retValues.values.length !== 6 ||
              retValues.values[0].name !== "Whiteley" ||
              retValues.values[1].name !== "Jones" ||
              retValues.values[2].name !== "Simpson" ||
              retValues.values[3].name !== "Brown" ||
              retValues.values[4].name !== "Addington" ||
              retValues.values[5].name !== "Bannister" ) {
            return Promise.reject(new Error("Query 2 db-from-json Users failed"));
          }

          // Select all messages
          retValues = await jeepSqlite.query({database: "db-from-json",
                                        statement: "SELECT * FROM messages;"});
          if(retValues.values.length !== 4 ||
              retValues.values[0].title !== "test post 1" ||
              retValues.values[1].title !== "test post 2" ||
              retValues.values[2].title !== "test post 3" ||
              retValues.values[3].title !== "test post 4" ) {
            return Promise.reject(new Error("Query 3 db-from-json Messages failed"));
          }
          // test full export
          let jsonObj = await jeepSqlite.exportToJson({database: "db-from-json",jsonexportmode: 'full'});
          // test Json object validity
          isJsonValid = await jeepSqlite.isJsonValid({jsonstring: JSON.stringify(jsonObj.export)});
          if(!isJsonValid.result) {
            return Promise.reject(new Error("IsJsonValid 'full' export failed"));
          }
          //test partial export
          const syncDate = "2020-05-20T18:40:00.000Z";
          await jeepSqlite.setSyncDate({database: "db-from-json", syncdate: syncDate});
          jsonObj = await jeepSqlite.exportToJson({database: "db-from-json",jsonexportmode: 'partial'});
          // test Json object validity
          isJsonValid = await jeepSqlite.isJsonValid({jsonstring: JSON.stringify(jsonObj.export)});
          if(!isJsonValid.result) {
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
          console.log("db success");
        } catch (err) {
          console.log(`Error ${err}`);
        }
    } else {
      console.log("store creation failed")
    }


  }
  render() {
    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Home</ion-title>
        </ion-toolbar>
      </ion-header>,

      <ion-content class="ion-padding">
        <p>
          Welcome to the PWA Toolkit. You can use this starter to build entire apps with web components using Stencil and ionic/core! Check out the README for everything that comes
          in this starter out of the box and check out our docs on <a href="https://stenciljs.com">stenciljs.com</a> to get started.
        </p>
        <jeep-sqlite></jeep-sqlite>
        <ion-button href="/profile/ionic" expand="block">
          Profile page
        </ion-button>
      </ion-content>,
    ];
  }
}

```