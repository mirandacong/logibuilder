import {BookSubnode, Node, NodeBuilder, NodeType} from './node'
import {Table} from './table'
import {Title} from './title'

export interface Sheet extends Node, BookSubnode {
    /**
     * Indicating whether this sheet is visible from users. Invisible sheet
     * are only used in some specific situations like recording and applying
     * constraints.
     */
    readonly visible: boolean
    readonly tree: readonly (Readonly<Table | Title>)[]
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

export function isSheet(node: unknown): node is Readonly<Sheet> {
    return node instanceof SheetImpl
}

export function assertIsSheet(node: unknown): asserts node is Readonly<Sheet> {
    if (!(node instanceof SheetImpl))
        throw Error('Not a Sheet!')
}

export class SheetBuilder extends NodeBuilder<Sheet, SheetImpl> {
    public constructor(obj?: Readonly<Sheet>) {
        const impl = new SheetImpl()
        if (obj)
            SheetBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    public tree(tree: readonly (Readonly<Table | Title>)[]): this {
        this.getImpl().tree = tree

        return this
    }

    public visible(visible: boolean): this {
        this.getImpl().visible = visible
        return this
    }

    protected preBuildHook(): void {
        super.preBuildHook()
        if (this._getImpl().name === '')
            this._getImpl().name = 'sheet'
    }
}

class SheetImpl extends Node implements Sheet {
    public get nodetype(): NodeType {
        return SheetImpl.__NODETYPE__
    }

    public visible = true

    public get tree(): readonly (Readonly<Table | Title>)[] {
        // safe to use type assertion below, checked when set info subnodes.
        return this.subnodes as (Readonly<Table | Title>)[]
    }

    public set tree(tree: readonly (Readonly<Table | Title>)[]) {
        tree.forEach((n: Readonly<Table | Title>): void =>
            this.insertSubnode(n))
    }

    public insertSubnode = super.insertSubnode

    public deleteSubnode = super.deleteSubnode

    public getBook(): Readonly<Node > | undefined {
        return this.findParent(NodeType.BOOK)
    }
    private static readonly __NODETYPE__: NodeType = NodeType.SHEET
}
