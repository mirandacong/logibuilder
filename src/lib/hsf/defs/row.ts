import {Modifier} from '@logi/src/lib/modifier'

import {Block, BlockImpl, BlockType} from './block'
import {Cell} from './cell'
import {DataCell} from './data_cell'
import {BaseBlockBuilder} from './lib'

/**
 * A special block.
 */
export interface Row extends Block {
    readonly nameCell: Cell
    readonly dataCells: readonly DataCell[]
    readonly modifier: Modifier
    readonly isDefScalar: boolean
    readonly separator: boolean
    /**
     * Depth means the steps from hierarchy table node to the row node.
     * If this row has a parent(Block1) and its parent has a parent(BLock2) too,
     * the depth of this row is 2.
     */
    readonly depth: number
    readonly last: boolean
}

class RowImpl extends BlockImpl implements Row {
    public type = BlockType.ROW
    public separator = false
    public nameCell!: Cell
    public dataCells: readonly DataCell[] = []
    public modifier!: Modifier
    public isDefScalar = false
    public depth = 0
    public last = false
}

export class RowBuilder extends BaseBlockBuilder<Row, RowImpl> {
            // tslint:disable-next-line: max-func-body-length
    public constructor(obj?: Readonly<Row | Block>) {
        const impl = new RowImpl()
        super(impl)
        if (obj === undefined)
            return
        if (obj instanceof RowImpl)
            RowBuilder.shallowCopy(impl, obj)
        else
            // tslint:disable-next-line: no-type-assertion
            BaseBlockBuilder.shallowCopy(impl as Readonly<BlockImpl>, obj)
    }

    public nameCell(nameCell: Cell): this {
        this.getImpl().nameCell = nameCell
        return this
    }

    public isDefScalar(isDefScalar: boolean): this {
        this.getImpl().isDefScalar = isDefScalar
        return this
    }

    public last(last: boolean): this {
        this.getImpl().last = last
        return this
    }

    public dataCells(dataCells: readonly DataCell[]): this {
        this.getImpl().dataCells = dataCells
        return this
    }

    public modifier(modifier: Modifier): this {
        this.getImpl().modifier = modifier
        return this
    }

    public depth(depth: number): this {
        this.getImpl().depth = depth
        return this
    }

    public separator(separator: boolean): this {
        this.getImpl().separator = separator
        return this
    }

    protected get daa(): readonly string[] {
        return RowBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'modifier',
        'area',
        'merge',
        'type',
        'uuid',
    ]

    protected preBuildHook(): void {
        const name = this.getImpl().nameCell
        const data = this.getImpl().dataCells
        this.getImpl().cells = [name, ...data]
    }
}

export function isRow(value: unknown): value is Row {
    return value instanceof RowImpl
}

export function assertIsRow(value: unknown): asserts value is Row {
    if (!(value instanceof RowImpl))
        throw Error('Not a Row!')
}
