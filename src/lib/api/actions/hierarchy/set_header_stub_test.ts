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
    isColumn,
    isColumnBlock,
    isTable,
    Row,
    RowBuilder,
    SheetBuilder,
    Table,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {TemplateBuilder, TemplateSetBuilder} from '@logi/src/lib/template'

import {ActionBuilder} from './set_header_stub'

// tslint:disable-next-line: max-func-body-length
describe('test set header stub action', (): void => {
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
            .stub('foo')
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
        expect(newTable.headerStub).toBe('foo')
    })
})

function mockService(): Readonly<EditorService> {
    const header1 = new ColumnBlockBuilder()
        .name('header1')
        .tree(buildTableChildren().filter(isCol))
        .build()
    const template1 = new TemplateBuilder().node(header1).build()
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
    const templateSet = new TemplateSetBuilder().templates([template1]).build()
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

function isCol(object: unknown): object is Column | ColumnBlock {
    return isColumn(object) || isColumnBlock(object)
}
