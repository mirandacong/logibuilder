// tslint:disable: no-magic-numbers
import {isException} from '@logi/base/ts/common/exception'
import {
    EditorService,
    EditorServiceBuilder,
    handleAction,
} from '@logi/src/lib/api'
import {
    BookBuilder,
    Column,
    ColumnBlock,
    ColumnBlockBuilder,
    ColumnBuilder,
    isRow,
    isTable,
    Row,
    RowBlockBuilder,
    RowBuilder,
    SheetBuilder,
    Table,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './set_name'

// tslint:disable-next-line: max-func-body-length
describe('test set name action', (): void => {
    let table: Readonly<Table>
    let backend: Readonly<EditorService>
    beforeEach((): void => {
        backend = mockService()
        const t = backend.book.sheets[0].tree[0]
        expect(isTable(t)).toBe(true)
        if (!isTable(t))
            return
        table = t
    })
    // tslint:disable-next-line: max-func-body-length
    it('no updating relative node', (): void => {
        const action = new ActionBuilder()
            .name('foo')
            .target(table.rows[0].uuid)
            .build()
        const res = handleAction(action, backend)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = backend.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        expect(newTable.rows[0].name).toBe('foo')
        expect(newTable.rows[1].name).toBe('row1')
    })
    it('rename sheet should update references', (): void => {
        const action = new ActionBuilder()
            .name('foo')
            .target(backend.book.sheets[0].uuid)
            .build()
        const res = handleAction(action, backend)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const actualSheetName = backend.book.sheets[0].name
        expect(actualSheetName).toBe('foo')
        const table3 = backend.book.sheets[1].tree[0]
        expect(isTable(table3)).toBe(true)
        if (!isTable(table3))
            return
        const row = table3.rows[0]
        expect(isRow(row)).toBe(true)
        if (!isRow(row))
            return
        const actualExpr = row.expression
        expect(actualExpr).toBe('{book!sheet!table1!row1}')
    })
    it('trim name', (): void => {
        const action = new ActionBuilder()
            .name('foo ')
            .target(table.rows[0].uuid)
            .build()
        const res = handleAction(action, backend)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = backend.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        expect(newTable.rows[0].name).toBe('foo')
    })
})

function mockService(): Readonly<EditorService> {
    const table1 = new TableBuilder()
        .name('table1')
        .subnodes(buildTableChildren())
        .build()
    const table2 = new TableBuilder()
        .name('table2')
        .subnodes(buildTableChildren())
        .build()
    const row = new RowBuilder()
        .name('row')
        .expression('{book!sheet!table1!row1}')
        .build()
    const table3 = new TableBuilder().name('table3').subnodes([row]).build()
    const table4 = new TableBuilder().name('table4').build()
    const sheet = new SheetBuilder()
        .name('sheet')
        .tree([table1, table2, table4])
        .build()
    const sheet2 = new SheetBuilder().name('sheet2').tree([table3]).build()
    const book = new BookBuilder().name('book').sheets([sheet, sheet2]).build()
    const service = new EditorServiceBuilder().book(book).build()
    service.exprManager.convert(service.book)
    return service
}

function buildTableChildren(): readonly Readonly<Column | ColumnBlock | Row>[] {
    const col1 = new ColumnBuilder().name('col1').build()
    const col2 = new ColumnBuilder().name('col2').build()
    const col3 = new ColumnBuilder().name('col3').build()
    const cb1 = new ColumnBlockBuilder().name('cb1').tree([col3]).build()
    const cb2 = new ColumnBlockBuilder().name('cb2').tree([col2, cb1]).build()
    const row = new RowBuilder().name('row1').build()
    const rb = new RowBlockBuilder().name('row1').build()
    const row2 = new RowBuilder().name('row2').labels(['2']).build()
    return [col1, cb2, row, rb, row2]
}
