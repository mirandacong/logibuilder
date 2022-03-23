// tslint:disable: no-magic-numbers
import {isException} from '@logi/base/ts/common/exception'
import {EditorServiceBuilder, handleAction} from '@logi/src/lib/api'
import {lexSuccess, lexV2} from '@logi/src/lib/dsl'
import {buildEst} from '@logi/src/lib/dsl/semantic'
import {
    assertIsRow,
    assertIsTable,
    BookBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './add_sum_snippet'

describe('test add sum snippet action', (): void => {
    it('table add rows', (): void => {
        const row1 = new RowBuilder().name('row1').build()
        const row2 = new RowBuilder().name('row2').build()
        const table = new TableBuilder()
            .name('table')
            .subnodes([row1, row2])
            .build()
        const sheet = new SheetBuilder().name('sheet').tree([table]).build()
        const book = new BookBuilder().name('book').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder()
            .target(table.uuid)
            .rows([row1.uuid, row2.uuid])
            .name('sum')
            .position(2)
            .build()
        handleAction(action, service)
        const newTable = service.book.sheets[0].tree[0]
        assertIsTable(newTable)
        expect(newTable.rows.length).toBe(3)
        const sumRow = newTable.rows[2]
        assertIsRow(sumRow)
        expect(sumRow.name).toBe('sum')
        const e = 'SUM({row1},{row2})'
        expect(sumRow.expression).toBe(e)
        const toks = lexV2(e)
        expect(lexSuccess(toks)).toBe(true)
        if (!lexSuccess(toks))
            return
        const est = buildEst(toks)
        expect(isException(est)).toBeFalse()
    })
})
