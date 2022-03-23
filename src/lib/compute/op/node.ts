// tslint:disable-next-line: no-wildcard-import
import * as t from 'io-ts'

export interface Op {
    readonly name: string
    readonly inTypes: readonly t.Mixed[]
    readonly outType: t.Mixed
    readonly optype: OpType
    evaluate(...args: readonly unknown[]): unknown
    excelFormula(...cells: readonly unknown[]): string
}

// tslint:disable-next-line: const-enum
export enum OpType {
    CONSTANT,
    ATOMIC,
    COMPOSITE,
}
