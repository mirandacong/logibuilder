// tslint:disable: no-magic-numbers
import {isException} from '@logi/base/ts/common/exception'
import {
    EditorService,
    EditorServiceBuilder,
    handleAction,
} from '@logi/src/lib/api'
import {
    assertIsTable,
    BookBuilder,
    ColumnBuilder,
    isTable,
    Row,
    RowBlockBuilder,
    RowBuilder,
    SheetBuilder,
    Table,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './move'

// tslint:disable-next-line: max-func-body-length
describe('test move action', (): void => {
    it('move', (): void => {
        const row1 = new RowBuilder().name('r1').build()
        const row2 = new RowBuilder().name('r2').build()
        const row3 = new RowBuilder().name('r3').build()
        const rb = new RowBlockBuilder().name('rb').tree([row2]).build()
        const col = new ColumnBuilder().name('col').build()
        const table = new TableBuilder()
            .name('')
            .subnodes([col, row1, rb, row3])
            .build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder()
            .target(table.uuid)
            .children([row2.uuid, row1.uuid])
            .position(2)
            .build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = service.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        expect(newTable.rows.length).toBe(4)
        expect(newTable.rows[0].name).toBe('rb')
        expect(newTable.rows[1].name).toBe('r2')
        expect(newTable.rows[2].name).toBe('r1')
        expect(newTable.rows[3].name).toBe('r3')
    })
})

describe('update dep expr', (): void => {
    let service: EditorService
    let c: Readonly<Row>
    let b: Readonly<Row>
    let t2: Readonly<Table>
    beforeEach((): void => {
        const a = new RowBuilder().name('a').build()
        b = new RowBuilder().name('b').build()
        const rb = new RowBlockBuilder().name('rb').tree([a, b]).build()
        c = new RowBuilder()
            .name('c')
            .expression('{rb!a} + {rb!b} + {rb!a} + {rb!b}')
            .build()
        const t = new TableBuilder().name('t').subnodes([rb, c]).build()
        t2 = new TableBuilder().name('t2').build()
        const sheet = new SheetBuilder().name('sheet').tree([t, t2]).build()
        const book = new BookBuilder().name('book').sheets([sheet]).build()
        service = new EditorServiceBuilder().book(book).build()
    })
    it('move c', (): void => {
        const action = new ActionBuilder()
            .target(t2.uuid)
            .children([c.uuid])
            .build()
        handleAction(action, service)

        const newT2 = service.book.sheets[0].tree[1]
        assertIsTable(newT2)
        const newC = newT2.getLeafRows()[0]
        expect(newC.expression)
            .toBe('{t!rb!a} + {t!rb!b} + {t!rb!a} + {t!rb!b}')
    })
    it('move b and c', (): void => {
        const action = new ActionBuilder()
            .target(t2.uuid)
            .children([c.uuid, b.uuid])
            .build()
        handleAction(action, service)

        const newT2 = service.book.sheets[0].tree[1]
        assertIsTable(newT2)
        const newC = newT2.getLeafRows()[1]
        expect(newC.expression).toBe('{t!rb!a} + {b} + {t!rb!a} + {b}')
    })
})
