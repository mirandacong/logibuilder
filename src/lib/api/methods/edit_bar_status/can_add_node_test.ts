import {
    BookBuilder,
    ColumnBlockBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
    TitleBuilder,
} from '@logi/src/lib/hierarchy/core'

import {
    canAddCol,
    canAddColBlock,
    canAddRow,
    canAddRowBlock,
    canAddTable,
    canAddTitle,
} from './can_add_node'

// tslint:disable-next-line: max-func-body-length
describe('test can add node', (): void => {
    it('add row', (): void => {
        const row = new RowBuilder().name('').build()
        const cb = new ColumnBlockBuilder().name('').build()
        const table = new TableBuilder().name('').build()
        const sheet = new SheetBuilder().name('').build()
        expect(canAddRow(row)).toBe(true)
        expect(canAddRow(cb)).toBe(false)
        expect(canAddRow(table)).toBe(true)
        expect(canAddRow(sheet)).toBe(false)
    })
    it('add col', (): void => {
        const row = new RowBuilder().name('').build()
        const cb = new ColumnBlockBuilder().name('').build()
        const table = new TableBuilder().name('').subnodes([cb]).build()
        const sheet = new SheetBuilder().name('').build()
        const table2 = new TableBuilder().name('').referenceHeader('H').build()
        expect(canAddCol(row)).toBe(false)
        expect(canAddCol(cb)).toBe(true)
        expect(canAddCol(table)).toBe(true)
        expect(canAddCol(table2)).toBe(false)
        expect(canAddCol(sheet)).toBe(false)
    })
    it('add row block', (): void => {
        const row = new RowBuilder().name('').build()
        const cb = new ColumnBlockBuilder().name('').build()
        const table = new TableBuilder().name('').build()
        const sheet = new SheetBuilder().name('').build()
        expect(canAddRowBlock(row)).toBe(true)
        expect(canAddRowBlock(cb)).toBe(false)
        expect(canAddRowBlock(table)).toBe(true)
        expect(canAddRowBlock(sheet)).toBe(false)
    })
    it('add block', (): void => {
        const row = new RowBuilder().name('').build()
        const cb = new ColumnBlockBuilder().name('').build()
        const table = new TableBuilder().name('').subnodes([cb]).build()
        const sheet = new SheetBuilder().name('').build()
        const table2 = new TableBuilder().name('').referenceHeader('H').build()
        expect(canAddColBlock(row)).toBe(false)
        expect(canAddColBlock(cb)).toBe(true)
        expect(canAddColBlock(table)).toBe(true)
        expect(canAddColBlock(table2)).toBe(false)
        expect(canAddColBlock(sheet)).toBe(false)
    })
    it('add table', (): void => {
        const row = new RowBuilder().name('').build()
        const cb = new ColumnBlockBuilder().name('').build()
        const table = new TableBuilder().name('').build()
        const title = new TitleBuilder().name('').build()
        const sheet = new SheetBuilder().name('').build()
        const book = new BookBuilder().name('').build()
        expect(canAddTable(row)).toBe(false)
        expect(canAddTable(cb)).toBe(false)
        expect(canAddTable(title)).toBe(false)
        expect(canAddTable(table)).toBe(false)
        expect(canAddTable(sheet)).toBe(false)
        table.insertSubnode(row)
        table.insertSubnode(cb)
        sheet.insertSubnode(table)
        sheet.insertSubnode(title)
        book.insertSubnode(sheet)
        expect(canAddTable(row)).toBe(true)
        expect(canAddTable(cb)).toBe(true)
        expect(canAddTable(title)).toBe(true)
        expect(canAddTable(table)).toBe(true)
        expect(canAddTable(sheet)).toBe(true)
        expect(canAddTable(book)).toBe(false)
    })
    it('add title', (): void => {
        const row = new RowBuilder().name('').build()
        const cb = new ColumnBlockBuilder().name('').build()
        const table = new TableBuilder().name('').build()
        const title = new TitleBuilder().name('').build()
        const sheet = new SheetBuilder().name('').build()
        const book = new BookBuilder().name('').build()
        expect(canAddTitle(row)).toBe(false)
        expect(canAddTitle(cb)).toBe(false)
        expect(canAddTitle(title)).toBe(false)
        expect(canAddTitle(table)).toBe(false)
        expect(canAddTitle(sheet)).toBe(false)
        table.insertSubnode(row)
        table.insertSubnode(cb)
        sheet.insertSubnode(table)
        sheet.insertSubnode(title)
        book.insertSubnode(sheet)
        expect(canAddTitle(row)).toBe(false)
        expect(canAddTitle(cb)).toBe(false)
        expect(canAddTitle(title)).toBe(true)
        expect(canAddTitle(table)).toBe(true)
        expect(canAddTitle(sheet)).toBe(true)
        expect(canAddTitle(book)).toBe(false)
    })
})
