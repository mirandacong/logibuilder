import {isException} from '@logi/base/ts/common/exception'
import {
    EditorService,
    EditorServiceBuilder,
    handleAction,
} from '@logi/src/lib/api'
import {
    assertIsTable,
    BookBuilder,
    Column,
    ColumnBuilder,
    RowBuilder,
    SheetBuilder,
    Table,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './remove_label'

describe('test remove label action', (): void => {
    let service: Readonly<EditorService>
    let table: Readonly<Table>
    beforeEach((): void => {
        const mock = mockService()
        service = mock[0]
        table = mock[1]
    })
    it('remove label in row', (): void => {
        const action = new ActionBuilder()
            .targets([table.rows[0].uuid, table.rows[1].uuid])
            .label('2')
            .build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = service.book.sheets[0].tree[0]
        assertIsTable(newTable)
        const newRow = newTable.rows[0]
        const newRow2 = newTable.rows[1]
        expect(newRow.labels).toEqual(['1', '3'])
        expect(newRow2.labels).toEqual([])
    })
    it('remove label in cols', (): void => {
        const action = new ActionBuilder()
            .targets([table.cols[0].uuid])
            .label('2')
            .build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = service.book.sheets[0].tree[0]
        assertIsTable(newTable)
        expect(newTable.cols[0].labels).toEqual(['1'])
    })
})

function mockService(): readonly [Readonly<EditorService>, Readonly<Table>] {
    const row = new RowBuilder().name('row').labels(['1', '2', '3']).build()
    const row2 = new RowBuilder().name('row2').labels(['2']).build()
    const table = new TableBuilder()
        .name('')
        .subnodes([row, row2, ...buildCols()])
        .build()
    const table2 = new TableBuilder().name('').subnodes(buildCols()).build()
    const sheet = new SheetBuilder().name('').tree([table, table2]).build()
    const book = new BookBuilder().name('').sheets([sheet]).build()
    const service = new EditorServiceBuilder().book(book).build()
    return [service, table]
}

function buildCols(): readonly Readonly<Column>[] {
    return [new ColumnBuilder().name('col').labels(['1', '2']).build()]
}
