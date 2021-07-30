/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { ConnectionOptions, EchoResult, SQLiteChanges, SQLiteExecuteOptions, SQLiteOptions, SQLiteQueryOptions, SQLiteResult, SQLiteRunOptions, SQLiteSet, SQLiteSetOptions, SQLiteValues } from "./interfaces/interfaces";
export namespace Components {
    interface JeepSqlite {
        "close": (options: SQLiteOptions) => Promise<void>;
        "closeConnection": (options: SQLiteOptions) => Promise<void>;
        "createConnection": (options: ConnectionOptions) => Promise<void>;
        "deleteDatabase": (options: SQLiteOptions) => Promise<void>;
        "echo": (value: string) => Promise<EchoResult>;
        "execute": (options: SQLiteExecuteOptions) => Promise<SQLiteChanges>;
        "executeSet": (options: SQLiteSetOptions) => Promise<SQLiteChanges>;
        "isDBExists": (options: SQLiteOptions) => Promise<SQLiteResult>;
        "isDBOpen": (options: SQLiteOptions) => Promise<SQLiteResult>;
        "isStoreOpen": () => Promise<boolean>;
        "open": (options: SQLiteOptions) => Promise<void>;
        "query": (options: SQLiteQueryOptions) => Promise<SQLiteValues>;
        "run": (options: SQLiteRunOptions) => Promise<SQLiteChanges>;
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
