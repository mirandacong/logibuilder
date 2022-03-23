// tslint:disable: no-magic-numbers
import {isException} from '@logi/base/ts/common/exception'
import {
    DefaultHeaderActionBuilder,
    EditorService,
    EditorServiceBuilder,
    handleAction,
} from '@logi/src/lib/api'
import {
    assertIsTable,
    BookBuilder,
    Column,
    ColumnBlock,
    ColumnBlockBuilder,
    ColumnBuilder,
    isTable,
    NodeType,
    Row,
    RowBuilder,
    SheetBuilder,
    Table,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {
    Frequency,
    HeaderInfoBuilder,
    ReportDateBuilder,
    StandardHeaderBuilder,
    TemplateSetBuilder,
} from '@logi/src/lib/template'

import {ActionBuilder} from './add_child'

// tslint:disable-next-line: max-func-body-length
describe('test add children action', (): void => {
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
    it('table add rows', (): void => {
        const action = new ActionBuilder()
            .name('row1')
            .type(NodeType.ROW)
            .target(table.uuid)
            .position(0)
            .build()
        const res = handleAction(action, backend)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = backend.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        const rows = newTable.getLeafRows()
        expect(rows.length).toBe(2)
        expect(rows[0].name).toBe('row1')
    })
    it('table add col', (): void => {
        const action = new ActionBuilder()
            .name('col')
            .type(NodeType.COLUMN)
            .target(table.uuid)
            .build()
        const res = handleAction(action, backend)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = backend.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        const cols = newTable.getLeafCols()
        expect(cols.length).toBe(4)
        expect(cols[3].name).toBe('col')
    })
    it('col block add col', (): void => {
        const cb = table.cols[1]
        const action = new ActionBuilder()
            .name('col')
            .type(NodeType.COLUMN)
            .target(cb.uuid)
            .position(1)
            .build()
        const res = handleAction(action, backend)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = backend.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        const cols = newTable.getLeafCols()
        expect(cols.length).toBe(4)
        expect(cols[2].name).toBe('col')
    })
    it('add sheet', (): void => {
        const action = new ActionBuilder()
            .target(backend.book.uuid)
            .name('sheet2')
            .type(NodeType.SHEET)
            .build()
        handleAction(action, backend)
        expect(backend.book.sheets.length).toBe(2)
        expect(backend.book.sheets[1].name).toBe('sheet2')
    })
    it('add table', (): void => {
        const action = new ActionBuilder()
            .target(backend.book.sheets[0].uuid)
            .name('new table')
            .type(NodeType.TABLE)
            .build()
        handleAction(action, backend)
        const newTable = backend.book.sheets[0].tree[2]
        assertIsTable(newTable)
        expect(newTable.name).toBe('new table')
        expect(newTable.cols.length).toBe(1)
        expect(newTable.rows.length).toBe(1)

        const defaultHeader = new DefaultHeaderActionBuilder()
            .defaultHeader(backend.templateSet.standardHeaders[0].name)
            .build()
        handleAction(defaultHeader, backend)

        const action2 = new ActionBuilder()
            .target(backend.book.sheets[0].uuid)
            .name('new table2')
            .type(NodeType.TABLE)
            .build()
        handleAction(action2, backend)
        const newTable2 = backend.book.sheets[0].tree[3]
        assertIsTable(newTable2)
        expect(newTable2.name).toBe('new table2')
        expect(newTable2.cols.length).toBe(1)
        expect(newTable2.cols[0].name).toBe('2020')
        expect(newTable2.rows.length).toBe(1)
    })
})

// tslint:disable-next-line: max-func-body-length
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
    const stdHeader = new StandardHeaderBuilder()
        .name('std')
        .reportDate(new ReportDateBuilder()
            .year(2021)
            .month(12)
            .day(31)
            .build())
        .headerInfos([new HeaderInfoBuilder()
            .startYear(2020)
            .endYear(2020)
            .frequency(Frequency.YEAR)
            .build()],
        )
        .build()
    const templateSet = new TemplateSetBuilder()
        .standardHeaders([stdHeader])
        .build()
    return new EditorServiceBuilder()
        .book(book)
        .templateSet(templateSet)
        .build()
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
