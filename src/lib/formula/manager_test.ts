import {FormulaItemBuilder} from './item'
import {
    Book,
    BookBuilder,
    Column,
    ColumnBuilder,
    Row,
    RowBuilder,
    SheetBuilder,
    Table,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {Manager} from './manager'

describe('formula manager test', (): void => {
    let row1: Readonly<Row>
    let row2: Readonly<Row>
    let col1: Readonly<Column>
    let col2: Readonly<Column>
    let table: Readonly<Table>
    let book: Readonly<Book>
    let manager: Manager
    beforeEach((): void => {
        row1 = new RowBuilder().name('row1').build()
        row2 = new RowBuilder().name('row2').build()
        col1 = new ColumnBuilder().name('col1').build()
        col2 = new ColumnBuilder().name('col2').build()
        table = new TableBuilder()
            .name('table')
            .subnodes([row1, row2, col1, col2])
            .build()
        const sheet = new SheetBuilder().name('sheet').tree([table]).build()
        book = new BookBuilder().name('book').sheets([sheet]).build()
        const item1 = new FormulaItemBuilder()
            .row(row1.uuid)
            .col(col1.uuid)
            .formula('formula1')
            .build()
        const item2 = new FormulaItemBuilder()
            .row(row1.uuid)
            .col(col2.uuid)
            .formula('formula2')
            .build()
        manager = new Manager([item1, item2])
    })
    it('get formula', (): void => {
        const formula = manager.getFormula(row1.uuid, col1.uuid)
        expect(formula).toBe('formula1')
    })
    it('set formula', (): void => {
        manager.setFormula(row1.uuid, col1.uuid, 'new1')
        const formula = manager.getFormula(row1.uuid, col1.uuid)
        expect(formula).toBe('new1')
        manager.setFormula(row2.uuid, col1.uuid, 'new2')
        const formula2 = manager.getFormula(row2.uuid, col1.uuid)
        expect(formula2).toBe('new2')
    })
    it('encode', (): void => {
        table.deleteSubnode(col1)
        expect(manager.encode(book).length).toBe(1)
        manager.setFormula(row1.uuid, col2.uuid, '')
        expect(manager.encode(book).length).toBe(0)
    })
})
