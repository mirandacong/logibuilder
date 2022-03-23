import {BookSubnode, Node, NodeBuilder, NodeType} from './node'
import {Table} from './table'

export interface Title extends Node, BookSubnode {
    /**
     * TODO (minglong): `tree` only support title type.
     */
    readonly tree: readonly (Readonly<Title | Table>)[]
    /**
     * Insert node into given position, if there is no given position means
     * append to the subnodes.
     */
    insertSubnode(node: Readonly<Table | Title>, position?: number): void
    /**
     * Delete node in the subnodes, if the node is not existed raise an error.
     */
    deleteSubnode(node: Readonly<Table | Title>): void
}

export function isTitle(node: unknown): node is Readonly<Title> {
    return node instanceof TitleImpl
}

export function assertIsTitle(node: unknown): asserts node is Readonly<Title> {
    if (!(node instanceof TitleImpl))
        throw Error('Not a title!.')
}

export class TitleBuilder extends NodeBuilder<Title, TitleImpl> {
    public constructor(obj?: Readonly<Title>) {
        const impl = new TitleImpl()
        if (obj)
            TitleBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    public tree(tree: readonly (Readonly<Table | Title>)[]): this {
        this.getImpl().tree = tree
        return this
    }
}

class TitleImpl extends Node implements Title {
    public get nodetype(): NodeType {
        return TitleImpl.__NODETYPE__
    }

    public get tree(): readonly (Readonly<Table | Title>)[] {
        // safe to use type assertion below, checked when set info subnodes.
        // tslint:disable-next-line: no-type-assertion
        return this.subnodes as Readonly<Table | Title>[]
    }

    public set tree(tree: readonly (Readonly<Table | Title>)[]) {
        tree.forEach((n: Readonly<Table | Title>): void =>
            this.insertSubnode(n))
    }

    public deleteSubnode = super.deleteSubnode
    public insertSubnode = super.insertSubnode

    public getBook(): Readonly<Node > | undefined {
        return this.findParent(NodeType.BOOK)
    }
    private static readonly __NODETYPE__: NodeType = NodeType.TITLE
}
