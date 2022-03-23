import {isException} from '@logi/base/ts/common/exception'
import {EditorServiceBuilder, handleAction} from '@logi/src/lib/api'
import {
    BookBuilder,
    getSubnodes,
    isRowBlock,
    isTable,
    RowBlockBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './level_change'

// tslint:disable-next-line: max-func-body-length
describe('test level change action', (): void => {
    it('up', (): void => {
        const row = new RowBuilder().name('row').build()
        const row2 = new RowBlockBuilder().name('row2').build()
        const rb = new RowBlockBuilder().name('rb').tree([row, row2]).build()
        const table = new TableBuilder().name('').subnodes([rb]).build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder()
            .targets([row.uuid, row2.uuid])
            .isUp(true)
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
        expect(newTable.rows.length).toBe(2)
        expect(newTable.rows[0]).toBe(row)
        expect(newTable.rows[1]).toBe(row2)
    })
    it('down into existed rowblock', (): void => {
        const row = new RowBuilder().name('row').build()
        const row2 = new RowBlockBuilder().name('row2').build()
        const rb = new RowBlockBuilder().name('rb').build()
        const table = new TableBuilder()
            .name('')
            .subnodes([rb, row, row2])
            .build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder()
            .targets([row.uuid, row2.uuid])
            .isUp(false)
            .build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = service.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        expect(getSubnodes(newTable.rows[0])[0]).toBe(row)
        expect(getSubnodes(newTable.rows[0])[1]).toBe(row2)
    })
    it('down not into existed rowblock', (): void => {
        const row1 = new RowBuilder().name('row1').build()
        const row2 = new RowBlockBuilder().name('row2').build()
        const row3 = new RowBuilder().name('row3').build()
        const table = new TableBuilder()
            .name('')
            .subnodes([row1, row2, row3])
            .build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder()
            .targets([row3.uuid, row2.uuid])
            .isUp(false)
            .build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = service.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        expect(isRowBlock(newTable.rows[1])).toBe(true)
        expect(newTable.rows[1].name).toBe('Block')
        expect(getSubnodes(newTable.rows[1])[0]).toBe(row2)
        expect(getSubnodes(newTable.rows[1])[1]).toBe(row3)

        const action2 = new ActionBuilder()
            .targets([row1.uuid])
            .isUp(false)
            .build()
        const res2 = handleAction(action2, service)
        expect(isException(res2)).toBe(false)
        if (isException(res2))
            return
        const newTable2 = service.book.sheets[0].tree[0]
        expect(isTable(newTable2)).toBe(true)
        if (!isTable(newTable2))
            return
        expect(isRowBlock(newTable2.rows[0])).toBe(true)
        expect(newTable2.rows[0].name).toBe('Block')
        expect(getSubnodes(newTable2.rows[0])[0]).toBe(row1)
    })
    it('down not with consequent rows', (): void => {
        const row1 = new RowBuilder().name('row1').build()
        const row2 = new RowBuilder().name('row2').build()
        const row3 = new RowBuilder().name('row3').build()
        const table = new TableBuilder()
            .name('')
            .subnodes([row1, row2, row3])
            .build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder()
            .targets([row1.uuid, row3.uuid])
            .isUp(false)
            .build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = service.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        expect(isRowBlock(newTable.rows[0])).toBe(true)
        expect(newTable.rows[0].name).toBe('Block')
        expect(getSubnodes(newTable.rows[0])[0]).toBe(row1)
        expect(isRowBlock(newTable.rows[2])).toBe(true)
        expect(newTable.rows[2].name).toBe('Block')
        expect(getSubnodes(newTable.rows[2])[0]).toBe(row3)
    })
    it('update rdep expression', (): void => {
        const rb = new RowBlockBuilder().name('rb').build()
        const row = new RowBuilder().name('row').build()
        const row2 = new RowBuilder()
            .name('row2')
            .expression('{row} + {rb2!row3}')
            .build()
        const row3 = new RowBuilder().name('row3').build()
        const rb2 = new RowBlockBuilder().name('rb2').tree([row3]).build()
        const table = new TableBuilder()
            .name('')
            .subnodes([rb, row, row2, rb2])
            .build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder()
            .targets([row.uuid, rb2.uuid])
            .isUp(false)
            .build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = service.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        expect(newTable.getLeafRows()[1].expression)
            .toBe('{rb!row} + {Block!rb2!row3}')
    })
})
