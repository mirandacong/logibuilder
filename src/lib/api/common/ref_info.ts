import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {FormulaBearer, SliceExpr} from '@logi/src/lib/hierarchy/core'

type Range = readonly [number, number]

/**
 * Indicate the expression(string) ranges of fb.
 *
 * For example, the expression of a row and the ranges is following.
 *                        range                     range
 *                        |   |                     |   |
 *                        v   v                     v   v
 *           `{book!sheet!table!row1} + {book!sheet!table!row2}`
 *
 * When user rename a refname, this struct is useful for frontend to highlight
 * the refname and ask if the user want to rename the highlight refname.
 */
export interface RefInfo {
    readonly node: Readonly<FormulaBearer>
    readonly slice?: Readonly<SliceExpr>
    readonly ranges: readonly Range[]
    updateRanges(ranges: readonly Range[]): void
    updateNode(node: Readonly<FormulaBearer>): void
}

class RefInfoImpl implements Impl<RefInfo> {
    public node!: Readonly<FormulaBearer>
    public slice?: Readonly<SliceExpr>
    public ranges: readonly (readonly [number, number])[] = []
    public updateRanges(ranges: readonly Range[]): void {
        this.ranges = ranges
    }

    public updateNode(node: Readonly<FormulaBearer>): void {
        this.node = node
    }
}

// tslint:disable-next-line: max-classes-per-file
export class RefInfoBuilder extends Builder<RefInfo, RefInfoImpl> {
    public constructor(obj?: Readonly<RefInfo>) {
        const impl = new RefInfoImpl()
        if (obj)
            RefInfoBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public node(node: Readonly<FormulaBearer>): this {
        this.getImpl().node = node
        return this
    }

    public slice(slice: Readonly<SliceExpr>): this {
        this.getImpl().slice = slice
        return this
    }

    public ranges(ranges: readonly (readonly [number, number])[]): this {
        this.getImpl().ranges = ranges
        return this
    }

    protected get daa(): readonly string[] {
        return RefInfoBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['node']
}
