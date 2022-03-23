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
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './remove_all'

describe('test remove slice action', (): void => {
    it('remove slice', (): void => {
        const slice1 = new SliceExprBuilder()
            .name('slice1')
            .expression('foo')
            .build()
        const slice2 = new SliceExprBuilder().name('slice2').build()
        const row = new RowBuilder()
            .name('')
            .sliceExprs([slice1, slice2])
            .build()
        const table = new TableBuilder().name('').subnodes([row]).build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder().targets([row.uuid]).build()
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
        expect(newTable.rows[0].sliceExprs.length).toBe(0)
        expect(newTable.rows[0].expression).toBe('foo')
    })
})
