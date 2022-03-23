import {EditorServiceBuilder, handleAction} from '@logi/src/lib/api'
import {
    assertIsRow,
    BookBuilder,
    RowBlockBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './remove_redundant_alias'

describe('batch remove alias', (): void => {
    it('remove', (): void => {
        const row1 = new RowBuilder()
            .name('row')
            .alias('a')
            .expression('{row!row@a}')
            .build()
        const row2 = new RowBuilder().name('row').alias('a').build()
        const row3 = new RowBuilder().name('row2').alias('a').build()
        const row4 = new RowBuilder().name('row').alias('a').build()
        const row5 = new RowBuilder().name('row').alias('a').build()
        const rb1 = new RowBlockBuilder().name('row').tree([row2, row3]).build()
        const rb2 = new RowBlockBuilder().name('rb').tree([row4, row5]).build()
        const table = new TableBuilder()
            .name('t')
            .subnodes([row1, rb1, rb2])
            .build()
        const sheet = new SheetBuilder().name('s').tree([table]).build()
        const book = new BookBuilder().name('b').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder().build()
        handleAction(action, service)
        const r1 = service.bookMap.get(row1.uuid)
        const r2 = service.bookMap.get(row2.uuid)
        const r3 = service.bookMap.get(row3.uuid)
        const r4 = service.bookMap.get(row4.uuid)
        const r5 = service.bookMap.get(row5.uuid)
        assertIsRow(r1)
        assertIsRow(r2)
        assertIsRow(r3)
        assertIsRow(r4)
        assertIsRow(r5)
        expect(r1.alias).toBe('')
        expect(r1.expression).toBe('{row!row}')
        expect(r2.alias).toBe('')
        expect(r3.alias).toBe('')
        expect(r4.alias).toBe('a')
        expect(r5.alias).toBe('a')
    })
})
