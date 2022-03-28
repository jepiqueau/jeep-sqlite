/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { AllConnectionsOptions, ConnectionOptions, EchoOptions, EchoResult, JsonProgressListener, SQLiteChanges, SQLiteExecuteOptions, SQLiteExportOptions, SQLiteFromAssetsOptions, SQLiteImportOptions, SQLiteJson, SQLiteOptions, SQLiteQueryOptions, SQLiteResult, SQLiteRunOptions, SQLiteSet, SQLiteSetOptions, SQLiteSyncDate, SQLiteSyncDateOptions, SQLiteTableOptions, SQLiteUpgradeOptions, SQLiteValues, SQLiteVersion, SQLiteVersionUpgrade } from "./interfaces/interfaces";
export namespace Components {
    interface JeepSqlite {
        "addUpgradeStatement": (options: SQLiteUpgradeOptions) => Promise<void>;
        /**
          * AutoSave
         */
        "autoSave": boolean;
        "checkConnectionsConsistency": (options: AllConnectionsOptions) => Promise<SQLiteResult>;
        "close": (options: SQLiteOptions) => Promise<void>;
        "closeConnection": (options: SQLiteOptions) => Promise<void>;
        "copyFromAssets": (options: SQLiteFromAssetsOptions) => Promise<void>;
        "createConnection": (options: ConnectionOptions) => Promise<void>;
        "createSyncTable": (options: SQLiteOptions) => Promise<SQLiteChanges>;
        "deleteDatabase": (options: SQLiteOptions) => Promise<void>;
        "echo": (options: EchoOptions) => Promise<EchoResult>;
        "execute": (options: SQLiteExecuteOptions) => Promise<SQLiteChanges>;
        "executeSet": (options: SQLiteSetOptions) => Promise<SQLiteChanges>;
        "exportToJson": (options: SQLiteExportOptions) => Promise<SQLiteJson>;
        "getDatabaseList": () => Promise<SQLiteValues>;
        "getSyncDate": (options: SQLiteSyncDateOptions) => Promise<SQLiteSyncDate>;
        "getTableList": (options: SQLiteOptions) => Promise<SQLiteValues>;
        "getVersion": (options: SQLiteOptions) => Promise<SQLiteVersion>;
        "importFromJson": (options: SQLiteImportOptions) => Promise<SQLiteChanges>;
        "isDBExists": (options: SQLiteOptions) => Promise<SQLiteResult>;
        "isDBOpen": (options: SQLiteOptions) => Promise<SQLiteResult>;
        "isDatabase": (options: SQLiteOptions) => Promise<SQLiteResult>;
        "isJsonValid": (options: SQLiteImportOptions) => Promise<SQLiteResult>;
        "isStoreOpen": () => Promise<boolean>;
        "isTableExists": (options: SQLiteTableOptions) => Promise<SQLiteResult>;
        "open": (options: SQLiteOptions) => Promise<void>;
        "query": (options: SQLiteQueryOptions) => Promise<SQLiteValues>;
        "run": (options: SQLiteRunOptions) => Promise<SQLiteChanges>;
        "saveToStore": (options: SQLiteOptions) => Promise<void>;
        "setSyncDate": (options: SQLiteSyncDateOptions) => Promise<void>;
    }
}
declare global {
    interface HTMLJeepSqliteElement extends Components.JeepSqlite, HTMLStencilElement {
    }
    var HTMLJeepSqliteElement: {
        prototype: HTMLJeepSqliteElement;
        new (): HTMLJeepSqliteElement;
    };
    interface HTMLElementTagNameMap {
        "jeep-sqlite": HTMLJeepSqliteElement;
    }
}
declare namespace LocalJSX {
    interface JeepSqlite {
        /**
          * AutoSave
         */
        "autoSave"?: boolean;
        "onJeepSqliteExportProgress"?: (event: CustomEvent<JsonProgressListener>) => void;
        "onJeepSqliteImportProgress"?: (event: CustomEvent<JsonProgressListener>) => void;
    }
    interface IntrinsicElements {
        "jeep-sqlite": JeepSqlite;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "jeep-sqlite": LocalJSX.JeepSqlite & JSXBase.HTMLAttributes<HTMLJeepSqliteElement>;
        }
    }
}
