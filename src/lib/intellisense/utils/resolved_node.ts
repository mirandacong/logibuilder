import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {
    isBook,
    isColumnBlock,
    isRow,
    isRowBlock,
    isSheet,
    isTable,
    Node,
} from '@logi/src/lib/hierarchy/core'

export interface ResolvedNode {
    /**
     * The uuid of the last node.
     */
    readonly last?: string
    readonly node: string
    /**
     * The uuid of the next node.
     */
    readonly next?: string
}

class ResolvedNodeImpl implements Impl<ResolvedNode> {
    public last?: string
    public node!: string
    public next?: string
}

export class ResolvedNodeBuilder extends
    Builder<ResolvedNode, ResolvedNodeImpl> {
    public constructor(obj?: Readonly<ResolvedNode>) {
        const impl = new ResolvedNodeImpl()
        if (obj)
            ResolvedNodeBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public last(last: string): this {
        this.getImpl().last = last
        return this
    }

    public node(node: string): this {
        this.getImpl().node = node
        return this
    }

    public next(next: string): this {
        this.getImpl().next = next
        return this
    }

    protected get daa(): readonly string[] {
        return ResolvedNodeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['node']
}

export function isResolvedNode(value: unknown): value is ResolvedNode {
    return value instanceof ResolvedNodeImpl
}

export function assertIsResolvedNode(
    value: unknown,
): asserts value is ResolvedNode {
    if (!(value instanceof ResolvedNodeImpl))
        throw Error('Not a ResolvedNode!')
}

/**
 * Export this function only for test.
 */
export function getResolvedNode(node: Readonly<Node>): Readonly<ResolvedNode> {
    const parent = node.parent
    const builder = new ResolvedNodeBuilder().node(node.uuid)
    if (parent === null)
        return builder.build()
    let siblings: readonly Readonly<Node>[] = []
    if (isTable(parent))
        siblings = isRow(node) ? parent.rows : parent.cols
    else if (isRowBlock(parent) || isColumnBlock(parent))
        siblings = parent.tree
    else if (isSheet(parent))
        siblings = parent.tree
    else if (isBook(parent))
        siblings = parent.sheets
    const idx = siblings.indexOf(node)
    if (idx < 0)
        return builder.build()
    const l = siblings.length
    if (idx > 0)
        builder.last(siblings[idx - 1].uuid)
    if (idx < l - 1)
        builder.next(siblings[idx + 1].uuid)
    return builder.build()
}
