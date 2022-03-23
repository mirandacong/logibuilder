import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {CellExpr} from './cell_expr'

export interface Cell {
    readonly row: string
    readonly column: string
    readonly cellExpr: CellExpr
}

class CellImpl implements Impl<Cell> {
    public row!: string
    public column!: string
    public cellExpr!: CellExpr
}

export class CellBuilder extends Builder<Cell, CellImpl> {
    public constructor(obj?: Readonly<Cell>) {
        const impl = new CellImpl()
        if (obj)
            CellBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public column(column: string): this {
        this.getImpl().column = column
        return this
    }

    public cellExpr(cellExpr: CellExpr): this {
        this.getImpl().cellExpr = cellExpr
        return this
    }

    protected get daa(): readonly string[] {
        return CellBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] =
        ['row', 'column']
}

export function isCell(value: unknown): value is Cell {
    return value instanceof CellImpl
}

export function assertIsCell(value: unknown): asserts value is Cell {
    if (!(value instanceof CellImpl))
        throw Error('Not a Cell!')
}
