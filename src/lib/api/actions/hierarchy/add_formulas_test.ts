import {isException} from '@logi/base/ts/common/exception'
import {
    EditorService,
    EditorServiceBuilder,
    handleAction,
} from '@logi/src/lib/api'
import {
    assertIsRowBlock,
    assertIsTable,
    BookBuilder,
    ColumnBlockBuilder,
    isRow,
    NodeType,
    Row,
    RowBlock,
    RowBlockBuilder,
    RowBuilder,
    SheetBuilder,
    Table,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './add_formulas'

// tslint:disable-next-line: max-func-body-length
describe('test add formulars action', (): void => {
    let table: Readonly<Table>
    let row: Readonly<Row>
    let rb: Readonly<RowBlock>
    let service: EditorService
    beforeEach((): void => {
        row = new RowBuilder().name('row').build()
        rb = new RowBlockBuilder().name('rb').build()
        const cb = new ColumnBlockBuilder().name('cb').build()
        table = new TableBuilder().name('').subnodes([row, rb, cb]).build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        service = new EditorServiceBuilder().book(book).build()
    })
    it('add row to table', (): void => {
        const action = new ActionBuilder()
            .target(table.uuid)
            .type(NodeType.ROW)
            .names(['1', '2'])
            .build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = service.book.sheets[0].tree[0]
        assertIsTable(newTable)
        // tslint:disable: no-magic-numbers
        expect(newTable.rows.length).toBe(4)
        expect(newTable.rows[2].name).toBe('1')
        expect(newTable.rows[3].name).toBe('2')
    })
    it('add col to table', (): void => {
        const action = new ActionBuilder()
            .target(table.uuid)
            .type(NodeType.COLUMN)
            .names(['1', '2'])
            .build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = service.book.sheets[0].tree[0]
        assertIsTable(newTable)
        expect(newTable.cols.length).toBe(3)
        expect(newTable.cols[1].name).toBe('1')
        expect(newTable.cols[2].name).toBe('2')
    })
    it('add to row block', (): void => {
        const action = new ActionBuilder()
            .target(rb.uuid)
            .type(NodeType.ROW)
            .names(['1', '2'])
            .build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = service.book.sheets[0].tree[0]
        assertIsTable(newTable)
        const newRb = newTable.rows[1]
        assertIsRowBlock(newRb)
        expect(newRb.tree.length).toBe(2)
        expect(newRb.tree[0].name).toBe('1')
        expect(newRb.tree[1].name).toBe('2')
    })
    it('add to row', (): void => {
        const action = new ActionBuilder()
            .target(row.uuid)
            .type(NodeType.ROW)
            .names(['1', '2'])
            .isScalar(true)
            .build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = service.book.sheets[0].tree[0]
        assertIsTable(newTable)
        expect(newTable.rows.length).toBe(4)
        expect(newTable.rows[1].name).toBe('1')
        expect(newTable.rows[2].name).toBe('2')
        expect(isRow(newTable.rows[1])).toBe(true)
        expect(isRow(newTable.rows[2])).toBe(true)
        if (!isRow(newTable.rows[1]) || !isRow(newTable.rows[2]))
            return
        expect(newTable.rows[1].isDefScalar).toBe(true)
        expect(newTable.rows[2].isDefScalar).toBe(true)
    })
})
