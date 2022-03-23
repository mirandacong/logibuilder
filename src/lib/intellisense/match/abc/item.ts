import {Builder} from '@logi/base/ts/common/builder'
import {
    Column,
    ColumnBlock,
    isRow,
    Node,
    NodeType,
    Row,
    RowBlock,
    Table,
} from '@logi/src/lib/hierarchy/core'

/**
 * Indicate the positon of the value in a hierarchy table.
 */
type Cell = readonly [Readonly<Row>, Readonly<Column>]

/**
 * Indicate the coordinate of the source parsed from abc.
 */
type Coordinate = readonly [number, number]

/**
 * The uniform interface for different sources used to judge
 * if they are matched.
 *
 * The workflow is like this:
 * `Table => SourceItems`
 *                                      >  => `MatchItems`
 * `Data(string[][]) => SourceItems`
 */
export interface SourceItem {
    readonly row: string
    readonly col: string
    /**
     * The ancestors whose type is rowBlock of the row.
     *
     * Sorted by their intimate degree with the row.
     */
    readonly rowBlock: readonly string[]
    readonly colBlock: readonly string[]
    /**
     * Indicate item original position of this source item.
     */
    readonly from: Readonly<Cell> | Readonly<Coordinate>
}

export class SourceItemBuilder extends Builder<SourceItem, SourceItemImpl> {
    public constructor(obj?: Readonly<SourceItem>) {
        const impl = new SourceItemImpl()
        if (obj)
            SourceItemBuilder.shallowCopy(obj, impl)
        super(impl)
    }

    public row(value: string): this {
        this.getImpl().row = value
        return this
    }

    public col(value: string): this {
        this.getImpl().col = value
        return this
    }

    public rowBlock(value: readonly string[]): this {
        this.getImpl().rowBlock = value
        return this
    }

    public colBlock(value: readonly string[]): this {
        this.getImpl().colBlock = value
        return this
    }

    public from(value: Readonly<Cell | Coordinate>): this {
        this.getImpl().from = value
        return this
    }

    protected get daa(): readonly string[] {
        return SourceItemBuilder.__DAA_PROPS__
    }

    protected static __DAA_PROPS__: readonly string[] = ['row', 'col', 'from']
}

/**
 * The result item used to inform the match relation between the hierarchy cell
 * and data.
 */
export interface MatchItem {
    readonly row: Readonly<Row>,
    readonly col: Readonly<Column>,
    readonly x: number,
    readonly y: number,
    readonly confidence: number,
}

export class MatchItemBuilder extends Builder<MatchItem, MatchItemImpl> {
    public constructor(obj?: Readonly<MatchItem>) {
        const impl = new MatchItemImpl()
        if (obj)
            MatchItemBuilder.shallowCopy(obj, impl)
        super(impl)
    }

    public row(value: Readonly<Row>): this {
        this.getImpl().row = value
        return this
    }

    public col(value: Readonly<Column>): this {
        this.getImpl().col = value
        return this
    }

    public x(value: number): this {
        this.getImpl().x = value
        return this
    }

    public y(value: number): this {
        this.getImpl().y = value
        return this
    }

    public confidence(value: number): this {
        this.getImpl().confidence = value
        return this
    }

    protected get daa(): readonly string[] {
        return MatchItemBuilder.__DAA_PROPS__
    }

    protected static __DAA_PROPS__: readonly string[] = [
        'row',
        'col',
        'x',
        'y',
    ]
}

/**
 * Build match items from a 2-d string array.
 *
 * Given data below:
 *        Y2017    Y2018    Y2019
 * row1     x         y        z
 * row2     a         b        c
 *
 * Return 6 items.
 * Now we make assumptions that the first element of a row must be the
 * row. like `row1` or `row2` above and that a col name must contains
 * `[a-zA-Z ]`.
 */
export function getDataItems(
    data: readonly (readonly string[])[],
): readonly Readonly<SourceItem>[] {
    const rowNameIdx = 0
    /**
     * Tell the row idx from which starts the value.
     */
    let start = -1
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < data.length; i += 1) {
        const row = data[i]
        let next = false
        // tslint:disable-next-line: no-loop-statement
        for (let j = rowNameIdx + 1; j < row.length; j += 1) {
            const head = row[j]
            const colPattern = /[a-zA-Z ]/g
            if (colPattern.exec(head)) {
                start += 1
                next = true
                break
            }
        }
        if (!next)
            break
    }
    start = Math.max(start, 0)
    const result: Readonly<SourceItem>[] = []
    data.forEach((row: readonly string[], idx: number): void => {
        if (idx <= start)
            return
        const rowName = row[rowNameIdx]
        data[start].forEach((colName: string, i: number): void => {
            if (i <= rowNameIdx)
                return
            const item = new SourceItemBuilder()
                .row(rowName)
                .col(colName)
                .from([idx, i])
                .build()
            result.push(item)
        })
    })
    return result
}

/**
 * Given a `Table` and build the source items.
 */
export function getTableItems(
    table: Readonly<Table>,
): readonly Readonly<SourceItem>[] {
    const rows: Readonly<Row>[] = []
    table.rows.forEach((c: Readonly<Row | RowBlock>): void => {
        if (isRow(c))
            rows.push(c as Readonly<Row>)
        else {
            const r = getRowsOrCols(c as Readonly<RowBlock>) as Readonly<Row>[]
            rows.push(...r)
        }
    })

    const cols: Readonly<Column>[] = []
    table.cols.forEach((c: Readonly<Column | ColumnBlock>): void => {
        if (c.nodetype === NodeType.COLUMN)
            cols.push(c as Readonly<Column>)
        // tslint:disable-next-line:brace-style
        else {
            const columns = getRowsOrCols(c as Readonly<ColumnBlock>) as
                Readonly<Column>[]
            cols.push(...columns)
        }
    })

    const result: Readonly<SourceItem>[] = []
    rows.forEach((r: Readonly<Row>): void => {
        cols.forEach((c: Readonly<Column>): void => {
            const matchItem = new SourceItemBuilder()
                .row(r.name)
                .col(c.name)
                .rowBlock(getBlockNames(r))
                .colBlock(getBlockNames(c))
                .from([r, c] as Readonly<Cell>)
                .build()
            result.push(matchItem)
        })
    })
    return result
}

class SourceItemImpl implements SourceItem {
    public row = ''
    public col = ''
    public rowBlock: readonly string[] = []
    public colBlock: readonly string[] = []
    public from!: Readonly<Cell> | Readonly<Coordinate>
}

/**
 * According to a row or a column, get their block ancestors' name.
 */
function getBlockNames(node: Readonly<Row | Column>): readonly string[] {
    let curr = node.parent as Readonly<Node>
    const result: string[] = []
    // tslint:disable-next-line: no-loop-statement
    while (curr.nodetype !== NodeType.TABLE) {
        result.push(curr.name)
        curr = curr.parent as Readonly<Node>
    }
    return result
}

function getRowsOrCols(
    block: Readonly<RowBlock | ColumnBlock>,
): readonly Readonly<Row | Column>[] {
    const stack: Readonly<RowBlock | ColumnBlock>[] = [block]
    const result: Readonly<Row | Column>[] = []
    // tslint:disable-next-line: no-loop-statement
    while (stack.length > 0) {
        const curr = stack.pop() as Readonly<RowBlock | ColumnBlock>
        curr.tree.forEach(
            (c: Readonly<Row | RowBlock | Column | ColumnBlock>): void => {
                if (c.nodetype === NodeType.ROW
                    || c.nodetype === NodeType.COLUMN)
                    // Safe to use type assertion as we have checked above.
                    result.push(c as Readonly<Row | Column>)
                else
                    stack.push(c as Readonly<RowBlock | ColumnBlock>)
            },
        )
    }
    return result
}

class MatchItemImpl implements MatchItem {
    public row!: Readonly<Row>
    public col!: Readonly<Column>
    public x!: number
    public y!: number
    public confidence = 1
}
