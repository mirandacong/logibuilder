import {Builder} from '@logi/base/ts/common/builder'

import {Block} from './block'
import {TableData} from './table_data'

export interface Table {
    readonly data: TableData
    readonly titles: readonly Block[]
    readonly name: Block
    readonly stub: Block
    readonly cols: readonly Block[]
    readonly rows: readonly Block[]
    readonly end: Block
    getBlocks(): readonly Block[]
}

class TableImpl implements Table {
    public data!: TableData
    public titles: readonly Block[] = []
    public name!: Block
    public stub!: Block
    public cols: readonly Block[] = []
    public rows: readonly Block[] = []
    public end!: Block
    public getBlocks(): readonly Block[] {
        return [
            ...this.titles,
            this.name,
            this.stub,
            ...this.cols,
            ...this.rows,
            this.end,
        ]
    }
}

export class TableBuilder extends Builder<Table, TableImpl> {
    public constructor(obj?: Readonly<Table>) {
        const impl = new TableImpl()
        if (obj)
            TableBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public data(data: TableData): this {
        this.getImpl().data = data
        return this
    }

    public titles(titles: readonly Block[]): this {
        this.getImpl().titles = titles
        return this
    }

    public name(name: Block): this {
        this.getImpl().name = name
        return this
    }

    public stub(stub: Block): this {
        this.getImpl().stub = stub
        return this
    }

    public cols(cols: readonly Block[]): this {
        this.getImpl().cols = cols
        return this
    }

    public rows(rows: readonly Block[]): this {
        this.getImpl().rows = rows
        return this
    }

    public end(end: Block): this {
        this.getImpl().end = end
        return this
    }
}

export function isTable(value: unknown): value is Table {
    return value instanceof TableImpl
}

export function assertIsTable(value: unknown): asserts value is Table {
    if (!(value instanceof TableImpl))
        throw Error('Not a Table!')
}
