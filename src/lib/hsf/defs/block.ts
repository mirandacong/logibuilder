import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Cell} from './cell'

export interface Block {
    readonly uuid: string
    readonly type: BlockType
    readonly area: Area
    readonly cells: readonly Cell[]
    readonly merge: boolean
    readonly childrenCount: number
}

export class BlockImpl implements Impl<Block> {
    public uuid!: string
    public type!: BlockType
    public area!: Area
    public cells: readonly Cell[] = []
    public merge = false
    public childrenCount = 0
}

export class BlockBuilder extends Builder<Block, BlockImpl> {
    public constructor(obj?: Readonly<Block>) {
        const impl = new BlockImpl()
        if (obj)
            BlockBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public uuid(uuid: string): this {
        this.getImpl().uuid = uuid
        return this
    }

    public type(type: BlockType): this {
        this.getImpl().type = type
        return this
    }

    public area(area: Area): this {
        this.getImpl().area = area
        return this
    }

    public cells(cells: readonly Cell[]): this {
        this.getImpl().cells = cells
        return this
    }

    public merge(merge: boolean): this {
        this.getImpl().merge = merge
        return this
    }

    public childrenCount(count: number): this {
        this.getImpl().childrenCount = count
        return this
    }

    protected get daa(): readonly string[] {
        return BlockBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'area',
        'merge',
        'type',
        'uuid',
    ]
}

export function isBlock(value: unknown): value is Block {
    return value instanceof BlockImpl
}

export function assertIsBlock(value: unknown): asserts value is Block {
    if (!(value instanceof BlockImpl))
        throw Error('Not a Block!')
}

export interface Area {
    readonly col: number
    readonly row: number
}

class AreaImpl implements Impl<Area> {
    public col = 0
    public row = 0
}

export class AreaBuilder extends Builder<Area, AreaImpl> {
    public constructor(obj?: Readonly<Area>) {
        const impl = new AreaImpl()
        if (obj)
            AreaBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public col(col: number): this {
        this.getImpl().col = col
        return this
    }

    public row(row: number): this {
        this.getImpl().row = row
        return this
    }

    protected get daa(): readonly string[] {
        return AreaBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['row', 'col']
}

export function isArea(value: unknown): value is Area {
    return value instanceof AreaImpl
}

export function assertIsArea(value: unknown): asserts value is Area {
    if (!(value instanceof AreaImpl))
        throw Error('Not a Area!')
}

export const enum BlockType {
    TYPE_UNSPECIFIED = 0,
    TITLE = 1,
    TABLE = 2,
    COLUMN_BLOCK = 3,
    COLUMN = 4,
    ROW_BLOCK = 5,
    ROW = 6,
    TABLE_END = 7,
    HEADER_INTERVAL = 8,
    TITLE_INTERVAL = 9,
    LEFT_MARGIN = 10,
    DEFAULT = 11,
    TABLE_NAME = 12,
    TOP_MARGIN = 13,
}
