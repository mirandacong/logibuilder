import {
    Book,
    BookBuilder,
    Column,
    ColumnBuilder,
    isBook,
    isRowBlock,
    Row,
    RowBlock,
    RowBlockBuilder,
    RowBuilder,
    Sheet,
    SheetBuilder,
    Table,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ReplacementBuilder} from './replacement'
import {shallowCopy, updateRoot} from './utils'

// tslint:disable-next-line: max-func-body-length
describe('update node', (): void => {
    let book: Readonly<Book>
    let sheet: Readonly<Sheet>
    let table1: Readonly<Table>
    let table2: Readonly<Table>
    let rowblock1: Readonly<RowBlock>
    let rowblock2: Readonly<RowBlock>
    let column1: Readonly<Column>
    let column2: Readonly<Column>
    let row1: Readonly<Row>
    let row2: Readonly<Row>
    let row3: Readonly<Row>
    beforeEach((): void => {
        book = new BookBuilder().name('book').build()
        sheet = new SheetBuilder().name('sheet').build()
        book.insertSubnode(sheet)
        table1 = new TableBuilder().name('table1').build()
        table2 = new TableBuilder().name('table2').build()
        sheet.insertSubnode(table1)
        sheet.insertSubnode(table2)
        rowblock1 = new RowBlockBuilder().name('rowblock1').build()
        table1.insertSubnode(rowblock1)
        rowblock2 = new RowBlockBuilder().name('rowblock2').build()
        table2.insertSubnode(rowblock2)
        row1 = new RowBuilder().name('row1').build()
        row2 = new RowBuilder().name('row2').build()
        row3 = new RowBuilder().name('row3').build()
        column1 = new ColumnBuilder().name('column1').build()
        column2 = new ColumnBuilder().name('column2').build()
        table1.insertSubnode(column1)
        table2.insertSubnode(column2)
        rowblock1.insertSubnode(row1)
        rowblock1.insertSubnode(row2)
        rowblock1.insertSubnode(row3)
    })
    it('update patches', (): void => {
        const newRow1 = new RowBuilder(row1).name('new_row1').build()
        const replacement1 = new ReplacementBuilder()
            .original(row1)
            .substitute(newRow1)
            .build()
        const newTable1 = new TableBuilder(table1).name('new_table1').build()
        const replacement2 = new ReplacementBuilder()
            .original(table1)
            .substitute(newTable1)
            .build()
        const patches = [replacement1, replacement2]
        const root = updateRoot(patches)
        expect(isBook(root)).toBe(true)
        if (!isBook(root))
            return
        const newSheet = root.sheets[0]
        // tslint:disable-next-line: no-type-assertion
        const t1 = newSheet.tree[0] as Table
        expect(t1.name).toBe('new_table1')
        // tslint:disable-next-line: no-type-assertion
        const rb1 = t1.rows[0] as RowBlock
        // tslint:disable-next-line: no-type-assertion
        const r1 = rb1.tree[0] as Row
        expect(r1.name).toBe('new_row1')
    })
    it('update patches', (): void => {
        const rb3 = new RowBlockBuilder().name('title3').build()
        const rb2 = new RowBlockBuilder().name('title2').tree([rb3]).build()
        const rb = new RowBlockBuilder().name('title').tree([rb2]).build()
        const newRb2 = new RowBlockBuilder().name('title2').build()
        const replacement1 = new ReplacementBuilder()
            .original(rb2)
            .substitute(newRb2)
            .build()
        const newRb = new RowBlockBuilder()
            .name('title')
            .tree([rb3, rb2])
            .build()
        const replacement2 = new ReplacementBuilder()
            .original(rb)
            .substitute(newRb)
            .build()
        const patches = [replacement1, replacement2]
        const root = updateRoot(patches)
        expect(isRowBlock(root)).toBe(true)
        if (!isRowBlock(root))
            return
        // tslint:disable-next-line: no-magic-numbers
        expect(root.tree.length).toBe(2)
        expect(root.tree[0]).toBe(rb3)
        expect(root.tree[1]).toBe(newRb2)
    })
    it('shallow copy', (): void => {
        // tslint:disable-next-line: no-type-assertion
        const copyBook = shallowCopy(book) as Book
        expect(copyBook.uuid).toBe(book.uuid)
        expect(copyBook.sheets).toEqual(book.sheets)
        expect(copyBook.sheets).not.toBe(book.sheets)
        // tslint:disable-next-line: no-type-assertion
        const copySheet = shallowCopy(sheet) as Sheet
        expect(copySheet.uuid).toBe(sheet.uuid)
        expect(copySheet.tree).toEqual(sheet.tree)
        expect(copySheet.tree).not.toBe(sheet.tree)
        // tslint:disable-next-line: no-type-assertion
        const copyTable = shallowCopy(table1) as Table
        expect(copyTable.uuid).toBe(table1.uuid)
        expect(copyTable.cols).toEqual(table1.cols)
        expect(copyTable.rows).toEqual(table1.rows)
        expect(copyTable.cols).not.toBe(table1.cols)
        expect(copyTable.rows).not.toBe(table1.rows)
        // tslint:disable-next-line: no-type-assertion
        const copyRow = shallowCopy(row1) as Row
        expect(copyRow.uuid).toBe(row1.uuid)
        expect(copyRow.sliceExprs).toEqual(row1.sliceExprs)
        expect(copyRow.sliceExprs).not.toBe(row1.sliceExprs)
    })
})
