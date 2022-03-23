import {isException} from '@logi/base/ts/common/exception'
import {
    assertIsTable,
    Book,
    BookBuilder,
    ColumnBuilder,
    Row,
    RowBuilder,
    SheetBuilder,
    SliceExpr,
    SliceExprBuilder,
    Table,
    TableBuilder,
    Type,
} from '@logi/src/lib/hierarchy/core'

import {ExprManager} from './expr_manager'

// tslint:disable-next-line: max-func-body-length
describe('expr manager test', (): void => {
    let book: Readonly<Book>
    let manager: ExprManager
    beforeEach((): void => {
        book = buildTestBook()
        manager = new ExprManager()
    })
    it('add expr test', (): void => {
        // tslint:disable-next-line: no-type-assertion
        const table = book.sheets[0].tree[0] as Readonly<Table>
        // tslint:disable-next-line: no-type-assertion
        const row1 = table.rows[0] as Readonly<Row>
        manager.updateExpr(row1)
        const cellExprs = manager.cellStorage
            .getCellExprs('row1-id', 'column1-id')
        expect(cellExprs.length).toBe(1)
        expect(cellExprs[0].castFrom.formulaBearer).toBe('row1-id')
    })
    it('convert test and get highest cell expr', (): void => {
        const r = manager.convert(book)
        expect(isException(r)).toBe(false)
        const cellExprs1 = manager.cellStorage
            .getCellExprs('row1-id', 'column1-id')
        // tslint:disable-next-line: no-magic-numbers
        expect(cellExprs1.length).toBe(2)
        const cellExpr1 = manager.cellStorage
            .getHighestCellExpr('row1-id', 'column1-id')
        expect(cellExpr1?.castFrom.formulaBearer).toBe('row1-id')
        const cellExprs2 = manager.cellStorage
            .getCellExprs('row2-id', 'column1-id')
        // tslint:disable-next-line: no-magic-numbers
        expect(cellExprs2.length).toBe(2)
    })
    it('get row cell expr', (): void => {
        const r = manager.convert(book)
        expect(isException(r)).toBe(false)
        // tslint:disable-next-line: no-type-assertion
        const table = book.sheets[0].tree[0] as Readonly<Table>
        // tslint:disable-next-line: no-type-assertion
        const row1 = table.rows[0] as Readonly<Row>
        const rowExprs = manager.cellStorage.getRowCellExpr(row1)
        // tslint:disable-next-line: no-magic-numbers
        expect(rowExprs.length).toBe(2)
    })
    it('disable row if haing slice', (): void => {
        book = buildTestBook2()
        manager.convert(book)
        expect(manager.cellStorage
            .getHighestCellExpr('row1-id', 'column1-id')?.type,
        ).toBe(Type.FX)
    })
    it('clear expr manager before convert', (): void => {
        book = buildTestBook2()
        manager.convert(book)
        const table = book.sheets[0].tree[0]
        assertIsTable(table)
        const row = table.getLeafRows()[0]
        // tslint:disable-next-line: no-type-assertion
        const slices = row.sliceExprs as SliceExpr[]
        slices.splice(0, 1)
        manager.convert(book)
        expect(manager.cellStorage.getHighestCellExpr(
            'row1-id',
            'column2-id',
        )?.op.excelFormula()).toBe('')
    })
    it('convert exception', (): void => {
        const row1 = new RowBuilder().name('row1').expression('(1 ').build()
        const table = new TableBuilder().name('table').subnodes([row1]).build()
        const sheet = new SheetBuilder().name('sheet').tree([table]).build()
        const b = new BookBuilder().name('book').sheets([sheet]).build()
        manager.convert(b)
        const error = manager.errorStorage.grammarError.get(row1.uuid)
        expect(error?.length).toBe(1)
    })
})

function buildTestBook(): Readonly<Book> {
    const row1 = new RowBuilder()
        .uuid('row1-id')
        .name('row1')
        .expression('1 + 3')
        .build()
    const row2 = new RowBuilder()
        .uuid('row2-id')
        .name('row2')
        .expression('{row1} * 2')
        .build()
    const col1 = new ColumnBuilder().uuid('column1-id').name('column1').build()
    const col2 = new ColumnBuilder().uuid('column2-id').name('column2').build()
    const table = new TableBuilder()
        .name('table')
        .subnodes([row1, row2, col1, col2])
        .build()
    const sheet = new SheetBuilder().name('sheet').tree([table]).build()
    return new BookBuilder().name('book').sheets([sheet]).build()
}

function buildTestBook2(): Readonly<Book> {
    const row1 = new RowBuilder()
        .uuid('row1-id')
        .name('row1')
        .type(Type.ASSUMPTION)
        .sliceExprs([new SliceExprBuilder()
            .name('PROJ')
            .type(Type.FX)
            .expression('1')
            .build()],
        )
        .build()
    const col1 = new ColumnBuilder()
        .uuid('column1-id')
        .name('column1')
        .labels(['HIST'])
        .build()
    const col2 = new ColumnBuilder()
        .uuid('column2-id')
        .name('column2')
        .labels(['PROJ'])
        .build()
    const table = new TableBuilder()
        .name('table')
        .subnodes([row1, col1, col2])
        .build()
    const sheet = new SheetBuilder().name('sheet').tree([table]).build()
    return new BookBuilder().name('book').sheets([sheet]).build()
}
