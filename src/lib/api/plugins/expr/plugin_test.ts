import {
    EditorService,
    EditorServiceBuilder,
    handleAction,
    ModifyLabelActionBuilder,
} from '@logi/src/lib/api'
import {
    assertIsRow,
    assertIsTable,
    BookBuilder,
    ColumnBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

describe('', (): void => {
    let service: EditorService
    beforeEach((): void => {
        service = mockService()
    })
    it('set label action', (): void => {
        const table = service.book.sheets[0].tree[0]
        assertIsTable(table)
        // tslint:disable: no-magic-numbers
        const col = table.cols[2]
        const action = new ModifyLabelActionBuilder()
            .targets([col.uuid])
            .oldLabel('PROJ')
            .newLabel('HIST')
            .build()
        handleAction(action, service)
        const newTable = service.book.sheets[0].tree[0]
        assertIsTable(newTable)
        const row = newTable.rows[1]
        assertIsRow(row)
        const cells = service.exprManager.cellStorage.getRowCellExpr(row)
        expect(cells[0].inNodes).toEqual([['row1', 'col1']])
        expect(cells[1].inNodes).toEqual([['row1', 'col2']])
        expect(cells[2].inNodes).toEqual([['row1', 'col3']])
        expect(cells[3].inNodes).toEqual([])
    })
})

function mockService(): EditorService {
    const col1 = new ColumnBuilder()
        .uuid('col1')
        .name('2017')
        .labels(['HIST'])
        .build()
    const col2 = new ColumnBuilder()
        .uuid('col2')
        .name('2018')
        .labels(['HIST'])
        .build()
    const col3 = new ColumnBuilder()
        .uuid('col3')
        .name('2019')
        .labels(['PROJ'])
        .build()
    const col4 = new ColumnBuilder()
        .uuid('col4')
        .name('2020')
        .labels(['PROJ'])
        .build()
    const row1 = new RowBuilder().uuid('row1').name('row1').build()
    const row2 = new RowBuilder()
        .uuid('row2')
        .name('row2')
        .expression('{row1}[HIST]')
        .build()
    const table = new TableBuilder()
        .name('table')
        .subnodes([row1, row2, col1, col2, col3, col4])
        .build()
    const sheet = new SheetBuilder().name('sheet').tree([table]).build()
    const book = new BookBuilder().name('book').sheets([sheet]).build()
    return new EditorServiceBuilder().book(book).build()
}
