import {BookSubnode, Node, NodeBuilder, NodeType, TableSubnode} from './node'
import {Row} from './row'

type SubNode = Row | RowBlock
export interface RowBlock extends Node, BookSubnode, TableSubnode {
    readonly tree: readonly Readonly<SubNode>[]
    /**
     * Insert node into given position, if there is no given position means
     * append to the subnodes.
     */
    insertSubnode(node: Readonly<SubNode>, position?: number): void

    /**
     * Delete node in the subnodes, if the node is not existed raise an error.
     */
    deleteSubnode(node: Readonly<SubNode>): void
}

export function isRowBlock(node: unknown): node is Readonly<RowBlock> {
    return node instanceof RowBlockImpl
}

class RowBlockImpl extends Node implements RowBlock {
    public get nodetype(): NodeType {
        return RowBlockImpl.__NODETYPE__
    }

    public get tree(): readonly Readonly<SubNode>[] {
        // tslint:disable-next-line: no-type-assertion
        return this.subnodes as Readonly<SubNode>[]
    }

    public set tree(nodes: readonly Readonly<SubNode>[]) {
        nodes.forEach((n: Readonly<SubNode>): void => this.insertSubnode(n))
    }

    public deleteSubnode = super.deleteSubnode

    public insertSubnode(
        node: Readonly<SubNode>,
        position = this.subnodes.length,
    ): void {
        super.insertSubnode(node, position)
    }

    public getTable(): Readonly<Node> | undefined {
        return this.findParent(NodeType.TABLE)
    }

    public getBook(): Readonly<Node> | undefined {
        return this.findParent(NodeType.BOOK)
    }
    private static readonly __NODETYPE__: NodeType = NodeType.ROW_BLOCK
}

export class RowBlockBuilder extends NodeBuilder<RowBlock, RowBlockImpl> {
    public constructor(obj?: Readonly<RowBlock>) {
        const impl = new RowBlockImpl()
        if (obj)
            RowBlockBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    public tree(nodes: readonly Readonly<SubNode>[]): this {
        this.getImpl().tree = nodes
        return this
    }
}

export function assertIsRowBlock(
    node: unknown,
): asserts node is Readonly<RowBlock> {
    if (!(node instanceof RowBlockImpl))
        throw Error('Not a row block!.')
}
