import {isException} from '@logi/base/ts/common/exception'
import {EditorServiceBuilder, handleAction} from '@logi/src/lib/api'
import {
    BookBuilder,
    isRow,
    isTable,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './itemized_forecast'

describe('test itemized forecast action', (): void => {
    it('itemized forecast', (): void => {
        const row = new RowBuilder().name('row1').build()
        const row1 = new RowBuilder().name('1').build()
        const table = new TableBuilder().name('').subnodes([row, row1]).build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder()
            .target(row.uuid)
            .names(['1', '2', '3'])
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
        expect(newTable.rows.length).toBe(4)
        expect(isRow(newTable.rows[0])).toBe(true)
        expect(isRow(newTable.rows[1])).toBe(true)
        expect(isRow(newTable.rows[2])).toBe(true)
        if (!isRow(newTable.rows[0]))
            return
        expect(newTable.rows[0].expression).toBe('{1}+{2}+{3}')
        expect(newTable.rows[1].name).toBe('2')
        expect(newTable.rows[2].name).toBe('3')
    })
})
