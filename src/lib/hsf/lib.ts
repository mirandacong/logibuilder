import {Builder} from '@logi/base/ts/common/builder'
import {Address} from '@logi/base/ts/common/excel'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Column, NodeType} from '@logi/src/lib/hierarchy/core'

import {Block, BlockType, ColumnPositionType, StyleTag} from './defs'

export function getCellId(row: string, col: string): string {
    return `${row}-${col}`
}

/**
 * An auxiliary tool to convey the information during the convertig from
 * hierarchy node to hsf node.
 */
export interface ConvertInfo {
    readonly blocks: readonly Block[]
    /**
     * When converting the table node, we should know the largest depth of the
     * rows and columns. We use this property to help us.
     */
    readonly level: number
    /**
     * When converting the row node, we should know the count of columns to set
     * the cells.
     */
    readonly cols: number
}

class ConvertInfoImpl implements Impl<ConvertInfo> {
    public blocks: readonly Block[] = []
    public level!: number
    public cols = 0
}

export class ConvertInfoBuilder extends Builder<ConvertInfo, ConvertInfoImpl> {
    public constructor(obj?: Readonly<ConvertInfo>) {
        const impl = new ConvertInfoImpl()
        if (obj)
            ConvertInfoBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public blocks(blocks: readonly Block[]): this {
        this.getImpl().blocks = blocks
        return this
    }

    public level(level: number): this {
        this.getImpl().level = level
        return this
    }

    public cols(cols: number): this {
        this.getImpl().cols = cols
        return this
    }

    protected get daa(): readonly string[] {
        return ConvertInfoBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['blocks']
}

export function getRowCount(blocks: readonly Block[]): number {
    let result = 0
    blocks.forEach((b: Block): void => {
        if (b.type === BlockType.COLUMN
            || b.type === BlockType.COLUMN_BLOCK
            || b.type === BlockType.ROW_BLOCK)
            return
        result += b.area.row
    })
    return result
}

export function getColumnPosTag(pos: ColumnPositionType): readonly StyleTag[] {
    switch (pos) {
    case ColumnPositionType.FIRST:
        return [StyleTag.FIRST_COLUMN]
    case ColumnPositionType.LAST:
        return [StyleTag.LAST_COLUMN]
    case ColumnPositionType.ONLY:
        return [StyleTag.FIRST_COLUMN, StyleTag.LAST_COLUMN]
    case ColumnPositionType.MIDDLE:
    case ColumnPositionType.NONE:
    default:
        return []
    }
}

/**
 * The information of an excel cell.
 */
export interface VizData {
    readonly row: number
    readonly col: number
    /**
     * The formula string in the cell.
     */
    readonly formula: string
    /**
     * The expression of the formula bearer or the slice.
     */
    readonly expression: string
    readonly value: string
    readonly address: Address
}

class VizDataImpl implements Impl<VizData> {
    public row!: number
    public col!: number
    public formula = ''
    public expression = ''
    public value!: string
    public address!: Address
}

export class VizDataBuilder extends Builder<VizData, VizDataImpl> {
    public constructor(obj?: Readonly<VizData>) {
        const impl = new VizDataImpl()
        if (obj)
            VizDataBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: number): this {
        this.getImpl().row = row
        return this
    }

    public col(col: number): this {
        this.getImpl().col = col
        return this
    }

    public formula(formula: string): this {
        this.getImpl().formula = formula
        return this
    }

    public expression(expr: string): this {
        this.getImpl().expression = expr
        return this
    }

    public value(value: string): this {
        this.getImpl().value = value
        return this
    }

    public address(address: Address): this {
        this.getImpl().address = address
        return this
    }

    protected get daa(): readonly string[] {
        return VizDataBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'col',
        'value',
        'address',
    ]
}

export function getColHeight(cols: readonly Readonly<Column>[]): number {
    let max = 0
    cols.forEach((c: Readonly<Column>): void => {
        let h = 1
        let p = c.parent
        while (p !== null && p.nodetype !== NodeType.TABLE) {
            p = p.parent
            h += 1
        }
        if (h > max)
            max = h
    })
    return max
}
