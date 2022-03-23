import {isException} from '@logi/base/ts/common/exception'
import {EditorServiceBuilder, handleAction} from '@logi/src/lib/api'
import {
    BookBuilder,
    isTable,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './move_vertically'

// tslint:disable-next-line: max-func-body-length
describe('test level change action', (): void => {
    it('up', (): void => {
        const row = new RowBuilder().name('row').build()
        const row2 = new RowBuilder().name('row2').build()
        const row3 = new RowBuilder().name('row3').build()
        const row4 = new RowBuilder().name('row4').build()
        const table = new TableBuilder()
            .name('')
            .subnodes([row, row2, row3, row4])
            .build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder()
            .targets([row.uuid, row4.uuid, row2.uuid])
            .isUp(true)
            .build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = service.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        // tslint:disable: no-magic-numbers
        expect(newTable.rows[0].uuid).toBe(row.uuid)
        expect(newTable.rows[1].uuid).toBe(row2.uuid)
        expect(newTable.rows[2].uuid).toBe(row4.uuid)
        expect(newTable.rows[3].uuid).toBe(row3.uuid)
    })
    it('down', (): void => {
        const row = new RowBuilder().name('row').build()
        const row2 = new RowBuilder().name('row2').build()
        const row3 = new RowBuilder().name('row3').build()
        const row4 = new RowBuilder().name('row4').build()
        const table = new TableBuilder()
            .name('')
            .subnodes([row, row2, row3, row4])
            .build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder()
            .targets([row.uuid, row4.uuid, row2.uuid])
            .isUp(false)
            .build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = service.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        // tslint:disable: no-magic-numbers
        expect(newTable.rows[0].uuid).toBe(row3.uuid)
        expect(newTable.rows[1].uuid).toBe(row.uuid)
        expect(newTable.rows[2].uuid).toBe(row2.uuid)
        expect(newTable.rows[3].uuid).toBe(row4.uuid)
    })
})
