import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

/**
 * Indicating that to repaint an hsf table.
 */
export interface TableDiff {
    readonly sheetName: string
    /**
     * The id of the hsf table to be repainted.
     */
    readonly table: string
    /**
     * The count of the columns that should be removed.
     */
    readonly colsRemoved: number
    /**
     * The count of the rows that should be added or removed.
     */
    readonly headerRowsChanged: number
}

class TableDiffImpl implements Impl<TableDiff> {
    public sheetName!: string
    public table!: string
    public colsRemoved = 0
    public headerRowsChanged = 0
}

export class TableDiffBuilder extends Builder<TableDiff, TableDiffImpl> {
    public constructor(obj?: Readonly<TableDiff>) {
        const impl = new TableDiffImpl()
        if (obj)
            TableDiffBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public table(table: string): this {
        this.getImpl().table = table
        return this
    }

    public sheetName(sheetId: string): this {
        this.getImpl().sheetName = sheetId
        return this
    }

    public colsRemoved(num: number): this {
        this.getImpl().colsRemoved = num
        return this
    }

    public headerRowsChanged(num: number): this {
        this.getImpl().headerRowsChanged = num
        return this
    }

    protected get daa(): readonly string[] {
        return TableDiffBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'sheetName',
        'table',
    ]
}
