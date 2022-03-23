import {preOrderWalk2} from '@logi/base/ts/common/walk_utils'
import {
    ALL_TYPES,
    Book,
    BookBuilder,
    Column,
    ColumnBlock,
    ColumnBlockBuilder,
    ColumnBuilder,
    getNodesVisitor,
    Node,
    Row,
    RowBlock,
    RowBlockBuilder,
    RowBuilder,
    Sheet,
    SheetBuilder,
    Table,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

interface Model1Nodes {
    readonly book: Readonly<Book>
    readonly sheet1: Readonly<Sheet>
    readonly table1: Readonly<Table>
    readonly table2: Readonly<Table>
    readonly rowBlock1: Readonly<RowBlock>
    readonly colBlock1: Readonly<ColumnBlock>
    readonly row1: Readonly<Row>
    readonly row2: Readonly<Row>
    readonly row3: Readonly<Row>
    readonly row4: Readonly<Row>
    readonly row5: Readonly<Row>
    readonly row6: Readonly<Row>
    readonly col1: Readonly<Column>
    readonly col2: Readonly<Column>
    readonly col3: Readonly<Column>
    readonly col4: Readonly<Column>
    readonly col5: Readonly<Column>
    readonly col6: Readonly<Column>
    readonly nodeMap: Map<string, Readonly<Node>>
}

/**
 * model_1
 * sheet_1
 * = table_1 ====================
 *     row_1          col_1
 *     rowblock_1     colblock_1
 *       row_2          col_2
 *       row_3          col_3
 *     row_4          col_4
 *     row_5          col_5
 *
 * = table_2 ====================
 *     row_6          col_6
 *
 * This model is used to test node focus service.
 */
// tslint:disable-next-line: max-func-body-length
export function mockModel1(): Model1Nodes {
    const row1 = new RowBuilder().name('row_1').build()
    const row2 = new RowBuilder().name('row_2').build()
    const row3 = new RowBuilder().name('row_3').build()
    const row4 = new RowBuilder().name('row_4').build()
    const row5 = new RowBuilder().name('row_5').build()
    const row6 = new RowBuilder().name('row_6').build()

    const col1 = new ColumnBuilder().name('col_1').build()
    const col2 = new ColumnBuilder().name('col_2').build()
    const col3 = new ColumnBuilder().name('col_3').build()
    const col4 = new ColumnBuilder().name('col_4').build()
    const col5 = new ColumnBuilder().name('col_5').build()
    const col6 = new ColumnBuilder().name('col_6').build()

    const rowBlock1 = new RowBlockBuilder()
        .name('rowblock_1')
        .tree([row2, row3])
        .build()
    const rows: (Readonly<Row> | Readonly<RowBlock>)[] = [
        row1,
        rowBlock1,
        row4,
        row5,
    ]

    const colBlock1 = new ColumnBlockBuilder()
        .name('colblock_1')
        .tree([col2, col3])
        .build()
    const cols: (Readonly<Column> | Readonly<ColumnBlock>)[] = [
        col1,
        colBlock1,
        col4,
        col5,
    ]

    const table1 = new TableBuilder()
        .name('table_1')
        .subnodes(cols.concat(rows))
        .build()
    const table2 = new TableBuilder()
        .name('table_2')
        .subnodes([
            col6,
            row6,
        ])
        .build()
    const book = new BookBuilder()
        .name('model_1')
        .sheets([
            new SheetBuilder().name('sheet_1').tree([table1 , table2]).build(),
        ])
        .build()
    const nodeMap = new Map<string, Readonly<Node>>()
    preOrderWalk2(book, getNodesVisitor, ALL_TYPES)
        .forEach(n => nodeMap.set(n.uuid, n))
    return {
        book,
        col1,
        col2,
        col3,
        col4,
        col5,
        col6,
        colBlock1,
        nodeMap,
        row1,
        row2,
        row3,
        row4,
        row5,
        row6,
        rowBlock1,
        sheet1: book.sheets[0],
        table1,
        table2,
    }
}
