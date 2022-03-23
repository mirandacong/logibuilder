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
    isTable,
    Row,
    RowBuilder,
    SheetBuilder,
    Table,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './remove_nodes'

// tslint:disable-next-line: max-func-body-length
describe('test remove nodes action', (): void => {
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
    it('no updating relative node', (): void => {
        const action = new ActionBuilder()
            .targets([
                table.getLeafCols()[1].uuid,
                table.cols[1].uuid,
            ])
            .build()
        const res = handleAction(action, backend)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = backend.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        expect(newTable.getLeafCols().length).toBe(1)
        expect(newTable.cols.length).toBe(1)
    })
    it('table add col', (): void => {
        const action = new ActionBuilder()
            .targets([
                table.cols[1].uuid,
                table.getLeafCols()[1].uuid,
            ])
            .build()
        const res = handleAction(action, backend)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = backend.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        expect(newTable.getLeafCols().length).toBe(1)
        expect(newTable.cols.length).toBe(1)
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
    const sheet = new SheetBuilder()
        .name('sheet')
        .tree([table1, table2])
        .build()
    const book = new BookBuilder().name('book').sheets([sheet]).build()
    return new EditorServiceBuilder().book(book).build()
}

function buildTableChildren(): readonly Readonly<Column | ColumnBlock | Row>[] {
    const col1 = new ColumnBuilder().name('col1').build()
    const col2 = new ColumnBuilder().name('col2').build()
    const col3 = new ColumnBuilder().name('col3').build()
    const cb1 = new ColumnBlockBuilder().name('cb1').tree([col3]).build()
    const cb2 = new ColumnBlockBuilder().name('cb2').tree([col2, cb1]).build()
    const row = new RowBuilder().name('row1').build()
    return [col1, cb2, row]
}
