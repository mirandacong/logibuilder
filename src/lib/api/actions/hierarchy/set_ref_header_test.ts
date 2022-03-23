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
    Column,
    ColumnBlock,
    ColumnBlockBuilder,
    ColumnBuilder,
    isColumn,
    isColumnBlock,
    isTable,
    Row,
    RowBuilder,
    SCALAR_HEADER,
    SheetBuilder,
    Table,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {
    Frequency,
    HeaderInfoBuilder,
    ReportDateBuilder,
    StandardHeaderBuilder,
    TemplateBuilder,
    TemplateSetBuilder,
} from '@logi/src/lib/template'

import {ActionBuilder} from './set_ref_header'

// tslint:disable-next-line: max-func-body-length
describe('test ref header action', (): void => {
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
    it('set new header', (): void => {
        const action = new ActionBuilder()
            .referenceHeader(backend.templateSet.standardHeaders[0].name)
            .targets([table.uuid])
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
        expect(newTable.getLeafCols()[0].name).toBe('2020')

        const header2 = backend.templateSet.standardHeaders[1].name
        const action2 = new ActionBuilder()
            .referenceHeader(header2)
            .targets([table.uuid])
            .build()
        handleAction(action2, backend)
        const table1 = backend.book.sheets[0].tree[0]
        assertIsTable(table1)
        expect(table1.referenceHeader).toBe(header2)
        expect(table1.cols.length).toBe(1)
        expect(table1.cols[0].name).toBe('2021')
    })
    it('single col', (): void => {
        const action = new ActionBuilder()
            .referenceHeader(SCALAR_HEADER)
            .targets([table.uuid])
            .build()
        handleAction(action, backend)
        const newTable = backend.book.sheets[0].tree[0]
        assertIsTable(newTable)
        expect(newTable.cols.length).toBe(1)
        expect(newTable.cols[0].name).toBe('')
        expect(newTable.referenceHeader).toBe(SCALAR_HEADER)
        expect(newTable.getLeafRows()[0].isDefScalar).toBe(true)
        expect(newTable.getLeafRows()[1].isDefScalar).toBe(false)

        const action2 = new ActionBuilder()
            .referenceHeader(backend.templateSet.standardHeaders[0].name)
            .targets([table.uuid])
            .build()
        handleAction(action2, backend)
        const newTable2 = backend.book.sheets[0].tree[0]
        assertIsTable(newTable2)
        expect(newTable2.getLeafRows()[0].isDefScalar).toBe(false)
    })
})

// tslint:disable-next-line: max-func-body-length
function mockService(): Readonly<EditorService> {
    const header1 = new ColumnBlockBuilder()
        .name('header1')
        .tree(buildTableChildren().filter(isCol))
        .build()
    const header2 = new ColumnBlockBuilder()
        .name('header2')
        .tree([new ColumnBuilder().name('').build()])
        .build()
    const template1 = new TemplateBuilder().node(header1).build()
    const template2 = new TemplateBuilder().node(header2).build()
    const table1 = new TableBuilder()
        .name('table1')
        .subnodes(buildTableChildren())
        .referenceHeader(header1.uuid)
        .build()
    const table2 = new TableBuilder()
        .name('table2')
        .subnodes(buildTableChildren())
        .referenceHeader(header1.uuid)
        .build()
    const sheet = new SheetBuilder()
        .name('sheet')
        .tree([table1, table2])
        .build()
    const book = new BookBuilder().name('book').sheets([sheet]).build()
    const stdHeader = new StandardHeaderBuilder()
        .name('std1')
        .reportDate(new ReportDateBuilder().year(2021).build())
        .headerInfos([new HeaderInfoBuilder()
            .startYear(2020)
            .endYear(2020)
            .frequency(Frequency.YEAR)
            .build()],
        )
        .build()
    const stdHeader2 = new StandardHeaderBuilder()
        .name('std2')
        .reportDate(new ReportDateBuilder().year(2022).build())
        .headerInfos([new HeaderInfoBuilder()
            .startYear(2021)
            .endYear(2021)
            .frequency(Frequency.YEAR)
            .build()],
        )
        .build()
    const templateSet = new TemplateSetBuilder()
        .templates([template1, template2])
        .standardHeaders([stdHeader, stdHeader2])
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
    const row2 = new RowBuilder().name('separator').separator(true).build()
    return [col1, cb2, row, row2]
}

function isCol(object: unknown): object is Column | ColumnBlock {
    return isColumn(object) || isColumnBlock(object)
}
