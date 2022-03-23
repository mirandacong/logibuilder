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

import {ActionBuilder} from './growth_rate'

describe('test growth rate action', (): void => {
    it('growth rate', (): void => {
        const row = new RowBuilder().name('row1').build()
        const table = new TableBuilder().name('').subnodes([row]).build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder().target(row.uuid).build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = service.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        expect(isRow(newTable.rows[1])).toBe(true)
        if (!isRow(newTable.rows[1]))
            return
        expect(newTable.rows[1].name).toBe('增长率')
        expect(newTable.rows[1].expression)
            .toBe('IFERROR({row1}/{row1}.lag(1y)-1,NULL)')
    })
})
