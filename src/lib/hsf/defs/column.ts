import {Block, BlockImpl, BlockType} from './block'
import {BaseBlockBuilder} from './lib'

export interface Column extends Block {
    readonly position: ColumnPositionType
    readonly separator: boolean
}

class ColumnImpl extends BlockImpl implements Column {
    public position = ColumnPositionType.NONE
    public separator = false
    public type = BlockType.COLUMN
}

export class ColumnBuilder extends BaseBlockBuilder<Column, ColumnImpl> {
    // tslint:disable-next-line: max-func-body-length
    public constructor(obj?: Readonly<Column | Block>) {
        const impl = new ColumnImpl()
        super(impl)
        if (obj === undefined)
            return
        if (obj instanceof ColumnImpl) {
            ColumnBuilder.shallowCopy(impl, obj)
            return
        }
        // tslint:disable-next-line: no-type-assertion
        ColumnBuilder.shallowCopy(impl as BlockImpl, obj)
    }

    public position(position: ColumnPositionType): this {
        this.getImpl().position = position
        return this
    }

    public separator(sep: boolean): this {
        this.getImpl().separator = sep
        return this
    }
}

export function isColumn(value: unknown): value is Column {
    return value instanceof ColumnImpl
}

export function assertIsColumn(value: unknown): asserts value is Column {
    if (!(value instanceof ColumnImpl))
        throw Error('Not a Column!')
}

/**
 * Indicating if the first child or the last child of its parent(ColumnBlock).
 */
export const enum ColumnPositionType {
    NONE,
    FIRST,
    MIDDLE,
    LAST,
    /**
     * The only one column in this table. It is the first and the last one.
     */
    ONLY,
}
