import {isException} from '@logi/base/ts/common/exception'
import {EditorServiceBuilder, handleAction} from '@logi/src/lib/api'
import {
    BookBuilder,
    isRow,
    isTable,
    RowBuilder,
    SheetBuilder,
    SliceExprBuilder,
    TableBuilder,
    Type,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './set_type'

describe('test set slice expr action', (): void => {
    it('set slice expr', (): void => {
        const slice = new SliceExprBuilder()
            .name('')
            .type(Type.ASSUMPTION)
            .build()
        const row = new RowBuilder().name('').sliceExprs([slice]).build()
        const table = new TableBuilder().name('').subnodes([row]).build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder()
            .target(row.uuid)
            .slice(slice)
            .type(Type.ASSUMPTION)
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
        expect(newTable.rows[0].sliceExprs[0].type).toBe(Type.ASSUMPTION)
    })
})
