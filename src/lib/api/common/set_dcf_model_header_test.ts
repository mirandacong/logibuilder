import {
    Book,
    BookBuilder,
    ColumnBlock,
    ColumnBlockBuilder,
    ColumnBuilder,
    getSubnodes,
    isTable,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {setDcfModelHeader} from './set_dcf_model_header'

describe('set dcf model header', (): void => {
    let book: Readonly<Book>
    let header: Readonly<ColumnBlock>
    beforeEach((): void => {
        const row1 = new RowBuilder().name('row1').build()
        const col1 = new ColumnBuilder().name('col1').build()
        const table1 = new TableBuilder()
            .name('table1')
            .subnodes([row1, col1])
            .build()
        const sheet1 = new SheetBuilder().name('sheet1').tree([table1]).build()
        const table2 = new TableBuilder().name('table2').build()
        const sheet2 = new SheetBuilder().name('data').tree([table2]).build()
        book = new BookBuilder().name('').sheets([sheet1, sheet2]).build()
        const col2 = new ColumnBuilder().name('new col').build()
        header = new ColumnBlockBuilder().name('test').tree([col2]).build()
    })
    it('set default header', (): void => {
        setDcfModelHeader(book, header, true)
        const sheet1 = book.sheets[0]
        const table1 = sheet1.tree[0]
        expect(isTable(table1)).toBe(true)
        if (!isTable(table1))
            return
        expect(table1.cols.length).toBe(1)
        expect(table1.cols[0].name).toBe('new col')
        expect(table1.referenceHeader).toBe(header.uuid)

        expect(getSubnodes(book.sheets[1].tree[0]).length).toBe(0)
    })
    it('not set default header', (): void => {
        setDcfModelHeader(book, header, false)
        const table1 = book.sheets[0].tree[0]
        expect(isTable(table1)).toBe(true)
        if (!isTable(table1))
            return
        expect(table1.referenceHeader).toBe(undefined)
    })
})
