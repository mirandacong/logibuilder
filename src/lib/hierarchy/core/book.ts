import {Node, NodeBuilder, NodeType} from './node'
import {Sheet} from './sheet'

export interface Book extends Node {
    /**
     * Sheets in the book.
     * DO NOT push sheet into sheets, use appendSheet().
     */
    readonly sheets: readonly Readonly<Sheet>[]

    /**
     * Insert node into given position, if there is no given position means
     * append to the subnodes.
     */
    insertSubnode(node: Readonly<Sheet>, position?: number): void

    /**
     * Delete node in the subnodes, if the node is not existed raise an error.
     */
    deleteSubnode(node: Readonly<Sheet>): void
}

export function isBook(node: unknown): node is Readonly<Book> {
    return node instanceof BookImpl
}

export class BookBuilder extends NodeBuilder<Book, BookImpl> {
    public constructor(obj?: Readonly<Book>) {
        const impl = new BookImpl()
        if (obj)
            BookBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    public sheets(sheets: readonly Readonly<Sheet>[]): this {
        this.getImpl().sheets = sheets
        return this
    }
}

class BookImpl extends Node implements Book {
    public get nodetype(): NodeType {
        return BookImpl.__NODETYPE__
    }

    public get sheets(): readonly Readonly<Sheet>[] {
        /**
         * Safe to use type assertion below because `this.childList` can only
         * add by `this.appendSheet`, the input type of this function is
         * `Sheet`.
         */
        return this.subnodes.map((n: Readonly<Node>): Readonly<Sheet> =>
            // tslint:disable-next-line: no-type-assertion
            n as Readonly<Sheet>)
    }

    public set sheets(sheets: readonly Readonly<Sheet>[]) {
        sheets.forEach((s: Readonly<Sheet>): void => this.insertSubnode(s))
    }

    public deleteSubnode = super.deleteSubnode

    public insertSubnode(
        node: Readonly<Sheet>,
        position = this.subnodes.length,
    ): void {
        super.insertSubnode(node, position)
    }
    private static readonly __NODETYPE__ = NodeType.BOOK
}

export function assertIsBook(node: unknown): asserts node is Readonly<Book> {
    if (!(node instanceof BookImpl))
        throw Error('Not a book!.')
}
