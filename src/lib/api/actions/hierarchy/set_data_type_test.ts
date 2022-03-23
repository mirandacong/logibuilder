import {isException} from '@logi/base/ts/common/exception'
import {EditorServiceBuilder, handleAction} from '@logi/src/lib/api'
import {
    BookBuilder,
    DataType,
    isRow,
    isTable,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './set_data_type'

describe('test set scalar action', (): void => {
    it('set scalar', (): void => {
        const row = new RowBuilder().name('').build()
        const table = new TableBuilder().name('').subnodes([row]).build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder()
            .target(row.uuid)
            .dataType(DataType.SCALAR)
            .build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = service.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        expect(isRow(newTable.rows[0])).toBe(true)
        if (!isRow(newTable.rows[0]))
            return
        expect(newTable.rows[0].isDefScalar).toBe(true)
    })
})
