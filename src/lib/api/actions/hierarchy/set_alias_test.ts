import {EditorServiceBuilder, handleAction} from '@logi/src/lib/api'
import {
    assertIsTable,
    BookBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './set_alias'

// tslint:disable-next-line: max-func-body-length
describe('test set alias action', (): void => {
    it('set alias', (): void => {
        const row = new RowBuilder().name('').alias('old').build()
        const table = new TableBuilder().name('').subnodes([row]).build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder().target(row.uuid).alias('new').build()
        handleAction(action, service)

        const newTable = service.book.sheets[0].tree[0]
        assertIsTable(newTable)
        const newRow = newTable.getLeafRows()[0]
        expect(newRow.alias).toBe('new')
    })
    it('update alias', (): void => {
        const row = new RowBuilder().name('row').alias('old').build()
        const row2 = new RowBuilder().name('row2').build()
        const row3 = new RowBuilder()
            .name('row3')
            .expression('{row@old} + {row2}')
            .build()
        const table = new TableBuilder()
            .name('')
            .subnodes([row, row2, row3])
            .build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()

        const action = new ActionBuilder().target(row.uuid).alias('new').build()
        handleAction(action, service)
        const newTable = service.book.sheets[0].tree[0]
        assertIsTable(newTable)
        // tslint:disable: no-magic-numbers
        const newRow3 = newTable.getLeafRows()[2]
        expect(newRow3.expression).toBe('{row@new} + {row2}')

        const action2 = new ActionBuilder()
            .target(row2.uuid)
            .alias('new')
            .build()
        handleAction(action2, service)
        const newTable2 = service.book.sheets[0].tree[0]
        assertIsTable(newTable2)
        const newRow32 = newTable2.getLeafRows()[2]
        expect(newRow32.expression).toBe('{row@new} + {row2@new}')

        const action3 = new ActionBuilder().target(row.uuid).alias('').build()
        handleAction(action3, service)
        const newTable3 = service.book.sheets[0].tree[0]
        assertIsTable(newTable3)
        const newRow33 = newTable3.getLeafRows()[2]
        expect(newRow33.expression).toBe('{row} + {row2@new}')
    })
})
