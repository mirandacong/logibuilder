import {Builder} from '@logi/base/ts/common/builder'
import {Address} from '@logi/base/ts/common/excel'
import {Impl} from '@logi/base/ts/common/mapped_types'

export interface TableData {
    readonly renderStart?: Address
    readonly dataStart?: Address
    readonly sheetName: string
    readonly leafRows: readonly string[]
    readonly leafCols: readonly string[]
}

class TableDataImpl implements Impl<TableData> {
    public renderStart?: Address
    public dataStart?: Address
    public sheetName!: string
    public leafRows: readonly string[] = []
    public leafCols: readonly string[] = []
}

export class TableDataBuilder extends Builder<TableData, TableDataImpl> {
    public constructor(obj?: Readonly<TableData>) {
        const impl = new TableDataImpl()
        if (obj)
            TableDataBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public dataStart(dataStart: Address): this {
        this.getImpl().dataStart = dataStart
        return this
    }

    public renderStart(renderStart: Address): this {
        this.getImpl().renderStart = renderStart
        return this
    }

    public sheetName(sheetName: string): this {
        this.getImpl().sheetName = sheetName
        return this
    }

    public leafRows(leafRows: readonly string[]): this {
        this.getImpl().leafRows = leafRows
        return this
    }

    public leafCols(leafCols: readonly string[]): this {
        this.getImpl().leafCols = leafCols
        return this
    }

    protected get daa(): readonly string[] {
        return TableDataBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['sheetName']
}

export function isTableData(value: unknown): value is TableData {
    return value instanceof TableDataImpl
}

export function assertIsTableData(value: unknown): asserts value is TableData {
    if (!(value instanceof TableDataImpl))
        throw Error('Not a TableData!')
}
