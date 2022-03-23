import {
    EditorService,
    EditorServiceBuilder,
    handleAction,
} from '@logi/src/lib/api'
import {
    BookBuilder,
    ColumnBlockBuilder,
    NodeType,
    Row,
    RowBuilder,
    SheetBuilder,
    Table,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './add_separator'

describe('add separator test', (): void => {
    let table: Readonly<Table>
    let row: Readonly<Row>
    let service: EditorService
    beforeEach((): void => {
        row = new RowBuilder().name('row').build()
        const cb = new ColumnBlockBuilder().name('cb').build()
        table = new TableBuilder().name('').subnodes([row, cb]).build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        service = new EditorServiceBuilder().book(book).build()
    })
    it('separator must be invalid', (): void => {
        const pos = 1
        const name = 'row-name'
        const action = new ActionBuilder()
            .name(name)
            .position(pos)
            .target(table.uuid)
            .type(NodeType.ROW)
            .build()
        handleAction(action, service)
        // tslint:disable-next-line: no-type-assertion
        const newTable = service.book.sheets[0].tree[0] as Table
        // tslint:disable-next-line: no-magic-numbers
        expect(newTable.rows.length).toBe(2)
        // tslint:disable-next-line: no-type-assertion
        const separator = newTable.rows[1] as Readonly<Row>
        expect(separator.separator).toBe(true)
        expect(separator.valid).toBe(false)
    })
})
