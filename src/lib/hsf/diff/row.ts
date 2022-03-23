import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {DeltaType} from './lib'

/**
 * Indicating that a row should be repainted.
 */
export interface RowRepaint {
    readonly sheetName: string
    readonly tableId: string
    /**
     * The uuid of the row that is to be repainted.
     */
    readonly row: string
}

class RowRepaintImpl implements Impl<RowRepaint> {
    public sheetName!: string
    public tableId!: string
    public row!: string
}

export class RowRepaintBuilder extends Builder<RowRepaint, RowRepaintImpl> {
    public constructor(obj?: Readonly<RowRepaint>) {
        const impl = new RowRepaintImpl()
        if (obj)
            RowRepaintBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public sheetName(sheetName: string): this {
        this.getImpl().sheetName = sheetName
        return this
    }

    public tableId(tableId: string): this {
        this.getImpl().tableId = tableId
        return this
    }

    protected get daa(): readonly string[] {
        return RowRepaintBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['row']
}

/**
 * Add or remove rows in the excel sheet.
 */
export interface RowCntChanged {
    readonly sheetName: string
    /**
     * The row index where rows are added or removed
     */
    readonly row: number
    /**
     * The col index where rows are added or removed
     */
    readonly col: number
    readonly cnt: number
    readonly type: DeltaType
}

class RowCntChangedImpl implements Impl<RowCntChanged> {
    public sheetName!: string
    public row!: number
    public col!: number
    public cnt!: number
    public type = DeltaType.REMOVE
}

// tslint:disable-next-line: max-classes-per-file
export class RowCntChangedBuilder extends
    Builder<RowCntChanged, RowCntChangedImpl> {
    public constructor(obj?: Readonly<RowCntChanged>) {
        const impl = new RowCntChangedImpl()
        if (obj)
            RowCntChangedBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public sheetName(sheetName: string): this {
        this.getImpl().sheetName = sheetName
        return this
    }

    public row(row: number): this {
        this.getImpl().row = row
        return this
    }

    public col(col: number): this {
        this.getImpl().col = col
        return this
    }

    public cnt(cnt: number): this {
        this.getImpl().cnt = cnt
        return this
    }

    public type(type: DeltaType): this {
        this.getImpl().type = type
        return this
    }
}
