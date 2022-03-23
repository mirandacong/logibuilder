// tslint:disable: no-magic-numbers
import {EditorServiceBuilder, handleAction} from '@logi/src/lib/api'
import {
    BookBuilder,
    isTable,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './defined'

// tslint:disable-next-line: max-func-body-length
describe('test move action', (): void => {
    it('move', (): void => {
        const row1 = new RowBuilder().name('r1').build()
        const row2 = new RowBuilder().name('r2').build()
        const row3 = new RowBuilder().name('r3').build()
        const table = new TableBuilder()
            .name('')
            .subnodes([row1, row2, row3])
            .build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder().row(row2.uuid).name('new').build()
        const action2 = new ActionBuilder()
            .row(row2.uuid)
            .name('new2:foo/bar')
            .build()
        handleAction(action, service)
        handleAction(action2, service)
        const newTable = service.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        expect(newTable.rows.length).toBe(5)
        expect(newTable.rows[1].name).toBe('new')
        expect(newTable.rows[2].name).toBe('new2')
    })
})
