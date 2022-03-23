import {isException} from '@logi/base/ts/common/exception'
import {EditorServiceBuilder, handleAction} from '@logi/src/lib/api'
import {
    AnnotationKey,
    assertIsTable,
    BookBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './set_key_assumption'

describe('test set key assumption', (): void => {
    it('test', (): void => {
        const row = new RowBuilder().name('row').build()
        const table = new TableBuilder().name('table').subnodes([row]).build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder().row(row.uuid).isOn(true).build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = service.book.sheets[0].tree[0]
        assertIsTable(newTable)
        const newRow = newTable.rows[0]
        expect(newRow.annotations.get(AnnotationKey.KEY_ASSUMPTION))
            .toBeDefined()

        const action2 = new ActionBuilder().row(row.uuid).isOn(false).build()
        const res2 = handleAction(action2, service)
        expect(isException(res2)).toBe(false)
        if (isException(res2))
            return
        const newTable2 = service.book.sheets[0].tree[0]
        assertIsTable(newTable2)
        const newRow2 = newTable2.rows[0]
        expect(newRow2.annotations.get(AnnotationKey.KEY_ASSUMPTION))
            .toBeUndefined()
    })
})
