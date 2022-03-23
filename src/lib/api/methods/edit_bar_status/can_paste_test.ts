import {
    Book,
    BookBuilder,
    Column,
    ColumnBlock,
    ColumnBlockBuilder,
    ColumnBuilder,
    Row,
    RowBlock,
    RowBlockBuilder,
    RowBuilder,
    Sheet,
    SheetBuilder,
    SliceExprBuilder,
    Table,
    TableBuilder,
    Title,
    TitleBuilder,
} from '@logi/src/lib/hierarchy/core'

import {canPaste} from './can_paste'

// tslint:disable-next-line: max-func-body-length
describe('test can paste', (): void => {
    let book: Readonly<Book>
    let sheet: Readonly<Sheet>
    let table: Readonly<Table>
    let title: Readonly<Title>
    let row: Readonly<Row>
    let rb: Readonly<RowBlock>
    let col: Readonly<Column>
    let cb: Readonly<ColumnBlock>
    beforeEach((): void => {
        row = new RowBuilder().name('').build()
        rb = new RowBlockBuilder().name('').build()
        col = new ColumnBuilder().name('').build()
        cb = new ColumnBlockBuilder().name('').build()
        table = new TableBuilder().name('').subnodes([row, rb, col, cb]).build()
        title = new TitleBuilder().name('').build()
        sheet = new SheetBuilder()
            .name('')
            .name('')
            .tree([table, title])
            .build()
        book = new BookBuilder().name('').sheets([sheet]).build()
    })
    it('paste to book', (): void => {
        const nodes1 = [table, title, row, col, rb, cb]
        expect(canPaste(book, nodes1, [])).toBe(false)
        const nodes2 = [sheet]
        expect(canPaste(book, nodes2, [])).toBe(true)
    })
    it('paste to sheet', (): void => {
        const nodes1 = [row, col, rb, cb, sheet]
        expect(canPaste(sheet, nodes1, [])).toBe(false)
        const nodes2 = [title]
        expect(canPaste(sheet, nodes2, [])).toBe(true)
        const nodes3 = [table]
        expect(canPaste(sheet, nodes3, [])).toBe(true)
    })
    it('paste to title', (): void => {
        const nodes1 = [row, col, rb, cb, sheet]
        expect(canPaste(title, nodes1, [])).toBe(false)
        const nodes2 = [title]
        expect(canPaste(sheet, nodes2, [])).toBe(true)
        const nodes3 = [table]
        expect(canPaste(sheet, nodes3, [])).toBe(true)
    })
    it('paste to table', (): void => {
        const nodes1 = [sheet]
        expect(canPaste(table, nodes1, [])).toBe(false)
        const nodes2 = [title]
        expect(canPaste(table, nodes2, [])).toBe(true)
        const nodes3 = [table]
        expect(canPaste(table, nodes3, [])).toBe(true)
        const nodes4 = [row]
        expect(canPaste(table, nodes4, [])).toBe(true)
        const nodes5 = [rb]
        expect(canPaste(table, nodes5, [])).toBe(true)
        const nodes6 = [col]
        expect(canPaste(table, nodes6, [])).toBe(true)
        const nodes7 = [cb]
        expect(canPaste(table, nodes7, [])).toBe(true)
    })
    it('paste to row/row block', (): void => {
        const nodes1 = [sheet, col, cb]
        expect(canPaste(row, nodes1, [])).toBe(false)
        expect(canPaste(rb, nodes1, [])).toBe(false)
        const nodes2 = [title]
        expect(canPaste(row, nodes2, [])).toBe(true)
        expect(canPaste(rb, nodes2, [])).toBe(true)
        const nodes3 = [table]
        expect(canPaste(row, nodes3, [])).toBe(true)
        expect(canPaste(rb, nodes3, [])).toBe(true)
        const nodes4 = [row]
        expect(canPaste(row, nodes4, [])).toBe(true)
        expect(canPaste(rb, nodes4, [])).toBe(true)
        const nodes5 = [rb]
        expect(canPaste(row, nodes5, [])).toBe(true)
        expect(canPaste(rb, nodes5, [])).toBe(true)
    })
    it('paste to col/col block', (): void => {
        const nodes1 = [sheet, row, rb]
        expect(canPaste(col, nodes1, [])).toBe(false)
        expect(canPaste(cb, nodes1, [])).toBe(false)
        const nodes2 = [title]
        expect(canPaste(col, nodes2, [])).toBe(true)
        expect(canPaste(cb, nodes2, [])).toBe(true)
        const nodes3 = [table]
        expect(canPaste(col, nodes3, [])).toBe(true)
        expect(canPaste(cb, nodes3, [])).toBe(true)
        const nodes4 = [col]
        expect(canPaste(col, nodes4, [])).toBe(true)
        expect(canPaste(cb, nodes4, [])).toBe(true)
        const nodes5 = [cb]
        expect(canPaste(col, nodes5, [])).toBe(true)
        expect(canPaste(cb, nodes5, [])).toBe(true)
    })
    it('paste to template table', (): void => {
        sheet = new SheetBuilder().name('').tree([table]).build()
        const nodes1 = [sheet, table, title]
        expect(canPaste(table, nodes1, [])).toBe(false)
        expect(canPaste(cb, nodes1, [])).toBe(false)
        const nodes2 = [row, rb, col , cb]
        expect(canPaste(table, nodes2, [])).toBe(true)
        expect(canPaste(rb, nodes2, [])).toBe(true)
    })
    it('paste to template col', (): void => {
        cb = new ColumnBlockBuilder().name('').tree([col]).build()
        const nodes1 = [sheet, table, title, row, rb]
        expect(canPaste(cb, nodes1, [])).toBe(false)
        expect(canPaste(col, nodes1, [])).toBe(false)
        const nodes2 = [col , cb]
        expect(canPaste(cb, nodes2, [])).toBe(true)
        expect(canPaste(col, nodes2, [])).toBe(true)
    })
    it('paste slice', (): void => {
        const slices = [new SliceExprBuilder().name('').build().uuid]
        expect(canPaste(table, [], slices)).toBe(false)
        expect(canPaste(row, [], slices)).toBe(true)
    })
})
