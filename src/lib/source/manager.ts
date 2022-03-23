import {Builder} from '@logi/base/ts/common/builder'
import {History} from '@logi/base/ts/common/history'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {preOrderWalk2} from '@logi/base/ts/common/walk_utils'
import {
    Book,
    getNodesVisitor,
    Node,
    NodeType,
} from '@logi/src/lib/hierarchy/core'

import {Source} from './base'
import {ManualSourceBuilder} from './manual'
import {View, ViewBuilder} from './view'

/**
 * Indicating a source and its position.
 */
export interface Item {
    /**
     * The uuid of the row.
     */
    readonly row: string
    /**
     * The uuid of the column.
     */
    readonly col: string
    readonly source: Source
}

class ItemImpl implements Impl<Item> {
    public row!: string
    public col!: string
    public source!: Source
}

export class ItemBuilder extends Builder<Item, ItemImpl> {
    public constructor(obj?: Readonly<Item>) {
        const impl = new ItemImpl()
        if (obj)
            ItemBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public col(col: string): this {
        this.getImpl().col = col
        return this
    }

    public source(source: Source): this {
        this.getImpl().source = source
        return this
    }

    protected get daa(): readonly string[] {
        return ItemBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'col',
        'row',
        'source',
    ]
}

export function isItem(value: unknown): value is Item {
    return value instanceof ItemImpl
}

export function assertIsItem(value: unknown): asserts value is Item {
    if (!(value instanceof ItemImpl))
        throw Error('Not a Item!')
}

export class Manager extends History {
    // tslint:disable-next-line: readonly-array
    public constructor(data: Readonly<Item>[]) {
        super()
        this.data = data
        data.forEach((item: Readonly<Item>, idx: number): void => {
            const row = item.row
            const col = item.col
            const sourceId = getSourceId(row, col)
            this.map.set(sourceId, idx)
        })
    }

    public map = new Map<string, number>()

    // tslint:disable-next-line: readonly-array
    public data: Readonly<Item>[] = []
    public getSource(row: string, col: string): Source | undefined {
        const key = getSourceId(row, col)
        const idx = this.map.get(key)
        if (idx === undefined)
            return
        const source = this.data[idx]?.source
        if (source === undefined || source.value === '')
            return
        return source
    }

    /**
     * You are not supposed to use this method to set the source during an
     * action. In that case, use modification instead.
     */
    public setManualSource(
        row: string,
        col: string,
        value: string | number,
    ): void {
        const key = getSourceId(row, col)
        const idx = this.map.get(key)
        const item = new ItemBuilder()
            .row(row)
            .col(col)
            .source(new ManualSourceBuilder().value(value).build())
            .build()
        if (idx !== undefined) {
            this.data[idx] = item
            return
        }
        this.data.push(item)
        this.map.set(key, this.data.length - 1)
    }

    public getView(row: string, col: string): View | undefined {
        const idx = this.map.get(getSourceId(row, col))
        if (idx === undefined)
            return
        const item = this.data[idx]
        const value = item.source.value
        if (value === '')
            return
        const type = item.source.sourceType
        return new ViewBuilder()
            .row(row)
            .col(col)
            .value(value)
            .type(type)
            .build()
    }

    public gc(book: Readonly<Book>): void {
        const resultMap = new Map<string, number>()
        const resultData: Readonly<Item>[] = []
        const formulas = preOrderWalk2(
            book,
            getNodesVisitor,
            [NodeType.ROW, NodeType.COLUMN],
        ).map((n: Readonly<Node>): string => n.uuid)
        this.map.forEach((value: number, key: string): void => {
            const item = this.data[value]
            if (item === undefined ||
                item.source.value === '')
                return
            if (!formulas.includes(item.row) || !formulas.includes(item.col))
                return
            resultMap.set(key, resultData.length)
            resultData.push(item)
        })
        this.map = resultMap
        this.data = resultData
        return
    }
}

export function getSourceId(row: string, col: string): string {
    return `${row}-${col}`
}
