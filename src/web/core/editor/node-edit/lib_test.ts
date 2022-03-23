// tslint:disable: no-magic-numbers
import {
    assertIsTable,
    Book,
    BookBuilder,
    ColumnBlockBuilder,
    ColumnBuilder,
    isTable,
    RowBlockBuilder,
    RowBuilder,
    SheetBuilder,
    Table,
    TableBuilder,
    TitleBuilder,
} from '@logi/src/lib/hierarchy/core'

import {getInsertPosition} from './lib'

// tslint:disable-next-line: max-func-body-length
describe('test add children action', (): void => {
    let table: Readonly<Table>
    let book: Readonly<Book>
    beforeEach((): void => {
        book = mockBook()
        const t = book.sheets[0].tree[0]
        expect(isTable(t)).toBe(true)
        assertIsTable(t)
        table = t
    })
    it('get position for inserting a row or rowblock', (): void => {
        const index = getInsertPosition(table.rows[0])
        expect(index).toBe(1)
    })
    it('get position for inserting a column or columnblock', (): void => {
        const index = getInsertPosition(table.cols[0])
        expect(index).toBe(1)
    })
    it('get position for inserting a table', (): void => {
        const index = getInsertPosition(table)
        expect(index).toBe(1)
    })
    it('get position for inserting a title', (): void => {
        const index = getInsertPosition(book.sheets[0].tree[5])
        expect(index).toBe(6)
    })
})

// tslint:disable-next-line: max-func-body-length
function mockBook(): Readonly<Book> {
    const table1 = new TableBuilder()
        .name('table1')
        .subnodes([
            new RowBuilder().name('row1').build(),
            new ColumnBuilder().name('col1').build(),
            new RowBuilder().name('row2').build(),
            new ColumnBuilder().name('col2').build(),
        ])
        .build()
    const table2 = new TableBuilder()
        .name('table2')
        .subnodes([
            new RowBuilder().name('row3').build(),
        ])
        .build()
    const table3 = new TableBuilder()
        .name('table3')
        .subnodes([new RowBuilder().name('row4').build()])
        .build()
    const cb = new ColumnBlockBuilder().name('template cb').build()
    const table4 = new TableBuilder()
        .name('table4')
        .referenceHeader(cb.uuid)
        .build()
    const table5 = new TableBuilder()
        .name('table5')
        .referenceHeader('')
        .subnodes([
            new RowBuilder().name('t5row1').build(),
            new ColumnBuilder().name('t5col1').build(),
            new RowBlockBuilder().name('t5rb1').build(),
            new ColumnBlockBuilder().name('t5cb1').build(),
        ])
        .build()
    const title1 = new TitleBuilder().name('title').build()
    const sheet = new SheetBuilder()
        .name('sheet')
        .tree([table1, table2, table3, table4, table5, title1])
        .build()
    return new BookBuilder().name('book').sheets([sheet]).build()
}
