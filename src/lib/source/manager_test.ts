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

import {ItemBuilder, Manager} from './manager'
import {ManualSource, ManualSourceBuilder} from './manual'

// tslint:disable-next-line: max-func-body-length
describe('manager test', (): void => {
    let manager: Manager
    let source1: ManualSource
    let book: Readonly<Book>
    let table: Readonly<Table>
    let row1: Readonly<Row>
    let row2: Readonly<Row>
    let col1: Readonly<Column>
    let col2: Readonly<Column>
    beforeEach((): void => {
        row1 = new RowBuilder().name('row1').build()
        row2 = new RowBuilder().name('row2').build()
        col1 = new ColumnBuilder().name('col1').build()
        col2 = new ColumnBuilder().name('col2').build()
        table = new TableBuilder()
            .name('')
            .subnodes([row1, row2, col1, col2])
            .build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        book = new BookBuilder().name('').sheets([sheet]).build()
        source1 = buildSource(1)
        const item1 = new ItemBuilder()
            .row(row1.uuid)
            .col(col1.uuid)
            .source(source1)
            .build()
        // tslint:disable: no-magic-numbers
        const source2 = buildSource(2)
        const item2 = new ItemBuilder()
            .row(row2.uuid)
            .col(col2.uuid)
            .source(source2)
            .build()
        const source3 = buildSource('')
        const item3 = new ItemBuilder()
            .row(row1.uuid)
            .col(col2.uuid)
            .source(source3)
            .build()
        const empty = new ManualSourceBuilder().value('').build()
        const item4 = new ItemBuilder()
            .row(row2.uuid)
            .col(col1.uuid)
            .source(empty)
            .build()
        manager = new Manager([item1, item2, item3, item4])
    })
    it('get source', (): void => {
        const actual = manager.getSource(row1.uuid, col1.uuid)
        expect(actual).toBe(source1)
        const actual2 = manager.getSource(row1.uuid, col2.uuid)
        expect(actual2).toBeUndefined()
    })
    it('remove and gc', (): void => {
        table.deleteSubnode(row1)
        manager.gc(book)
        const item = manager.getSource(row1.uuid, col1.uuid)
        expect(item).toBeUndefined()
        const item2 = manager.getSource(row2.uuid, col2.uuid)
        expect(item2).toBeDefined()
        const item3 = manager.getSource(row2.uuid, col1.uuid)
        expect(item3).toBeUndefined()
    })
})

function buildSource(v: number | string): ManualSource {
    // tslint:disable-next-line: no-type-assertion
    const value = v
    return new ManualSourceBuilder().value(value).build()
}
