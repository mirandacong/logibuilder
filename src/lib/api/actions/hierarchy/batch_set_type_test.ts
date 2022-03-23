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

import {ActionBuilder} from './batch_set_type'

describe('test batch set type action', (): void => {
    it('batch set type', (): void => {
        const slice1 = new SliceExprBuilder()
            .name('')
            .expression('')
            .type(Type.ASSUMPTION)
            .build()
        const slice2 = new SliceExprBuilder()
            .name('')
            .expression('')
            .type(Type.FACT)
            .build()
        const row1 = new RowBuilder().name('').sliceExprs([slice1]).build()
        const row2 = new RowBuilder().name('').sliceExprs([slice2]).build()
        const table = new TableBuilder().name('').subnodes([row1, row2]).build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder()
            .targets([[row1.uuid, slice1.uuid], [row2.uuid, slice2.uuid]])
            .type(Type.CONSTRAINT)
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
        if (!isRow(newTable.rows[0]) || !isRow(newTable.rows[1]))
            return
        expect(newTable.rows[0].sliceExprs[0].type).toBe(Type.CONSTRAINT)
        expect(newTable.rows[1].sliceExprs[0].type).toBe(Type.CONSTRAINT)
    })
})
