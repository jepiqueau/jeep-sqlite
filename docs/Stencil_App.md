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

            // close all connections
            await jeepSqlite.closeConnection({database:"testNew"});
            await jeepSqlite.closeConnection({database:"testSet"});
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