// tslint:disable:max-file-line-count
// tslint:disable:max-classes-per-file
import {preOrderWalk} from '@logi/base/ts/common/walk_utils'

import {Column, isColumn} from './column'
import {ColumnBlock, isColumnBlock} from './column_block'
import {FormulaBearer} from './formula_bearer'
import {BookSubnode, Node, NodeBuilder, NodeType} from './node'
import {isRow, Row} from './row'
import {isRowBlock, RowBlock} from './row_block'

/**
 * The header of formula bearer, if the formula bearer is
 *      - row: The header is the leaf columns in the table
 *      - column: The header is the leaf rows in the table
 *      - row selection: The columns which select by the selection
 *      - column selection: The rows which select by the selection
 */
type FbHeader = readonly Readonly<Row | Column>[]

type Subnode = Readonly<RowBlock | Row | ColumnBlock | Column>

export type ScalarHeader = '__SCALAR_HEADER__'

export const SCALAR_HEADER: ScalarHeader = '__SCALAR_HEADER__'

export interface Table extends BookSubnode, Node {
    readonly rows: readonly (Readonly<RowBlock | Row>)[]
    /**
     * The columns or column blocks of table. It is different
     * objects from the cols of referenceHeader. When table reference a public
     * header or template header, the cols of header will be copied to the cols
     * of table. If user change the cols, the `referenceHeader` should be reset
     * to undefined.
     *
     * Get more information about `Header` in './header.ts'.
     */
    readonly cols: readonly (Readonly<ColumnBlock | Column>)[]
    /**
     * The uuid of public header or template header. If cols or headerStub of
     * table change, this field should be reset to undefined.
     *
     * Get more information about `Header` in './header.ts'.
     */
    readonly referenceHeader?: string | ScalarHeader
    /**
     * The stub of table. It is different from the stub of referenceHeader.
     * When table reference a public header or template header, the stub of
     * header will be copied to the stub of table.
     *
     * Get more information about `Header` in './header.ts'.
     */
    readonly headerStub: string
    /**
     * Insert node into given position, if there is no given position means
     * append to the subnodes.
     */
    insertSubnode(node: Subnode, position?: number): void

    /**
     * Delete node in the subnodes, if the node is not existed raise an error.
     */
    deleteSubnode(node: Subnode): void

    /**
     * Get all rows which belong to the table.
     */
    getLeafRows(): readonly Readonly<Row>[]

    /**
     * Get all cols which belong to the table.
     */
    getLeafCols(): readonly Readonly<Column>[]

    /**
     * Get header of given formula bearer.
     *
     * Use `table.getFbHeader` instead of `formulaBearer.getHeader` because the
     * information of formulaBearer is not enough for `getHeader`.
     *
     */
    getFbHeader(fb: Readonly<FormulaBearer>): FbHeader

    /**
     * Get all formulaBearers of the table.
     */
    getFormulaBearers(): readonly Readonly<FormulaBearer>[]
}

export function isTable(node: unknown): node is Readonly<Table> {
    return node instanceof TableImpl
}

class TableImpl extends Node implements Table {
    public get cols(): readonly Readonly<Column | ColumnBlock>[] {
        // tslint:disable-next-line: no-type-assertion
        const subnodes = this.subnodes as Node[]
        // tslint:disable-next-line: no-type-assertion
        return subnodes.filter((n: Node): boolean => isColumn(n) ||
            isColumnBlock(n)) as (ColumnBlock | Column)[]
    }

    public get nodetype(): NodeType {
        return TableImpl.__NODETYPE__
    }

    public get rows(): readonly (Readonly<RowBlock | Row>)[] {
        // tslint:disable-next-line: no-type-assertion
        const subnodes = this.subnodes as Node[]
        // tslint:disable-next-line: no-type-assertion
        return subnodes.filter((n: Node): boolean => isRow(n) ||
            isRowBlock(n)) as (RowBlock | Row)[]
    }

    public headerStub = ''

    public referenceHeader?: string | ScalarHeader

    public deleteSubnode = super.deleteSubnode

    public setSubnodes(subnodes: readonly Subnode[]): void {
        subnodes.forEach((n: Readonly<Subnode>): void => this.insertSubnode(n))
    }

    public insertSubnode(
        node: Readonly<Subnode>,
        // tslint:disable-next-line: no-optional-parameter
        position?: number,
    ): void {
        if (position === undefined) {
            super.insertSubnode(node)
            return
        }
        let actualPos: number | undefined
        if (isRow(node) || isRowBlock(node)) {
            if (this.rows.length === 0) {
                super.insertSubnode(node)
                return
            }
            if (position === 0)
                actualPos = this._getChildIndex(this.rows[0])
            if (actualPos == undefined)
                actualPos = this._getChildIndex(this.rows[position - 1]) + 1
        } else if (isColumn(node) || isColumnBlock(node)) {
            if (this.cols.length === 0) {
                super.insertSubnode(node)
                return
            }
            if (position === 0)
                actualPos = this._getChildIndex(this.cols[0])
            if (actualPos === undefined)
                actualPos = this._getChildIndex(this.cols[position - 1]) + 1
        }
        super.insertSubnode(node, actualPos)
    }

    public getBook(): Readonly<Node > | undefined {
        return this.findParent(NodeType.BOOK)
    }

    public getFormulaBearers(): readonly Readonly<FormulaBearer>[] {
        return preOrderWalk(this, formulaBearerVisitor)
    }

    public getFbHeader(fb: Readonly<FormulaBearer>): FbHeader {
        if (isRow(fb))
            return this.getLeafCols()
        if (isColumn(fb))
            return this.getLeafRows()
        return []
    }

    /**
     * Get leaf rows via given table.
     */
    public getLeafRows(): readonly Readonly<Row>[] {
        return visitLeafRows(this.rows)
    }

    /**
     * Get leaf cols via given table.
     */
    public getLeafCols(): readonly Readonly<Column>[] {
        return visitLeafCols(this.cols)
    }

    private static readonly __NODETYPE__: NodeType = NodeType.TABLE

    private _getChildIndex(node: Readonly<Node>): number {
        // tslint:disable-next-line: no-loop-statement
        for (let index = 0; index < this.subnodes.length; index += 1) {
            const child = this.subnodes[index]
            if (child === node)
                return index
        }
        return 0
    }
}

export class TableBuilder extends NodeBuilder<Table, TableImpl> {
    public constructor(obj?: Readonly<Table>) {
        const impl = new TableImpl()
        if (obj)
            TableBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    public subnodes(subnodes: readonly Subnode[]): this {
        this.getImpl().setSubnodes(subnodes)
        return this
    }

    public referenceHeader(
        referenceHeader: string | ScalarHeader | undefined,
    ): this {
        this.getImpl().referenceHeader = referenceHeader
        return this
    }

    public headerStub(headerStub: string): this {
        this.getImpl().headerStub = headerStub
        return this
    }
}

export function assertIsTable(obj: unknown): asserts obj is Table {
    if (!(obj instanceof TableImpl))
        throw Error('Not a Table!')
}

/**
 * Get row, column and selection from the given node
 */
function formulaBearerVisitor(
    node: Readonly<Node>,
): readonly [readonly Readonly<FormulaBearer>[], readonly Readonly<Node>[]] {
    if (isTable(node)) {
        const children: Readonly<Node>[] = []
        children.push(...node.rows)
        children.push(...node.cols)
        return [[], children]
    }
    if (isRowBlock(node)) {
        const children: Readonly<Node>[] = []
        children.push(...node.tree)
        return [[], children]
    }
    if (isRow(node))
        return [[node], []]
    if (isColumnBlock(node))
        return [[], node.tree]
    if (isColumn(node))
        return [[node], []]
    return [[], []]
}

function visitLeafRows(
    rows: readonly Readonly<Row | RowBlock>[],
): readonly Readonly<Row>[] {
    const res: Readonly<Row>[] = []
    rows.forEach((r: Readonly<Row | RowBlock>): void => {
        if (isRow(r)) {
            res.push(r)
            return
        }
        res.push(...visitLeafRows(r.tree))
    })
    return res
}

function visitLeafCols(
    cols: readonly Readonly<Column | ColumnBlock>[],
): readonly Readonly<Column>[] {
    const res: Readonly<Column>[] = []
    cols.forEach((c: Readonly<Column | ColumnBlock>): void => {
        if (isColumn(c)) {
            res.push(c)
            return
        }
        res.push(...visitLeafCols(c.tree))
    })
    return res
}
