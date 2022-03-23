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

import {ActionBuilder} from './remove_slice'

describe('test remove slice action', (): void => {
// tslint:disable-next-line: max-func-body-length
    it('remove slice', (): void => {
        const slice1 = new SliceExprBuilder().name('slice1').build()
        const slice2 = new SliceExprBuilder()
            .name('slice2')
            .expression('foo')
            .type(Type.FACT)
            .build()
        const slice3 = new SliceExprBuilder().name('slice3').build()
        const row = new RowBuilder()
            .name('')
            .sliceExprs([slice1, slice2, slice3])
            .build()
        const table = new TableBuilder().name('').subnodes([row]).build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder()
            .target(row.uuid)
            .slices([slice1, slice3])
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
        expect(newTable.rows[0].sliceExprs.length).toBe(1)
        expect(newTable.rows[0].sliceExprs[0]).toBe(slice2)

        const action2 = new ActionBuilder()
            .target(row.uuid)
            .slices([slice2])
            .build()
        const res2 = handleAction(action2, service)
        expect(isException(res2)).toBe(false)
        if (isException(res2))
            return
        const newTable2 = service.book.sheets[0].tree[0]
        expect(isTable(newTable2)).toBe(true)
        if (!isTable(newTable2))
            return
        expect(isRow(newTable2.rows[0])).toBe(true)
        if (!isRow(newTable2.rows[0]))
            return
        expect(newTable2.rows[0].sliceExprs.length).toBe(0)
        expect(newTable2.rows[0].expression).toBe('foo')
        expect(newTable2.rows[0].type).toBe(Type.FACT)
    })
})
