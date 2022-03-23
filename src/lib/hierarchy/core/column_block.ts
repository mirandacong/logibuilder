import {Column} from './column'
import {BookSubnode, Node, NodeBuilder, NodeType, TableSubnode} from './node'
export interface ColumnBlock extends Node, BookSubnode, TableSubnode {
    readonly tree: readonly Readonly<ColumnBlock | Column>[]
    /**
     * Insert node into given position, if there is no given position means
     * append to the subnodes.
     */
    insertSubnode(node: Readonly<ColumnBlock | Column>, position?: number): void

    /**
     * Delete node in the subnodes, if the node is not existed raise an error.
     */
    deleteSubnode(node: Readonly<ColumnBlock | Column>): void
}

export function isColumnBlock(node: unknown): node is Readonly<ColumnBlock> {
    return node instanceof ColumnBlockImpl
}

class ColumnBlockImpl extends Node implements ColumnBlock {
    public get nodetype(): NodeType {
        return ColumnBlockImpl.__NODETYPE__
    }

    public get tree(): readonly Readonly<ColumnBlock | Column>[] {
        // tslint:disable-next-line: no-type-assertion
        return this.subnodes as Readonly<ColumnBlock | Column>[]
    }

    public set tree(nodes: readonly Readonly<ColumnBlock | Column>[]) {
        nodes.forEach((n: Readonly<ColumnBlock | Column>): void =>
            this.insertSubnode(n))
    }

    public deleteSubnode = super.deleteSubnode

    public insertSubnode(
        node: Readonly<ColumnBlock | Column>,
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

    private static readonly __NODETYPE__: NodeType = NodeType.COLUMN_BLOCK
}

export class ColumnBlockBuilder extends
        NodeBuilder<ColumnBlock, ColumnBlockImpl> {
    public constructor(obj?: Readonly<ColumnBlock>) {
        const impl = new ColumnBlockImpl()
        if (obj)
            ColumnBlockBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    public tree(nodes: readonly Readonly<ColumnBlock | Column>[]): this {
        this.getImpl().tree = nodes

        return this
    }
}

export function assertIsColumnBlock(
    node: unknown,
): asserts node is Readonly<ColumnBlock> {
    if (!(node instanceof ColumnBlockImpl))
        throw Error('Not a columnBlock!.')
}
