// tslint:disable:no-magic-numbers
import {buildTestModel4} from '@logi/src/lib/dsl/logi_test_data'
import {Cell} from '@logi/src/lib/dsl/semantic/cells'
import {
    assertIsRow,
    assertIsTable,
    BookBuilder,
    ColumnBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {assertIsExprDigest} from './base'
import {buildExprDigest} from './build_expr_digest'

// tslint:disable-next-line:max-func-body-length
describe('Semantic test:', (): void => {
    // tslint:disable-next-line: max-func-body-length
    it('semantic test1', (): void => {
        const model = buildTestModel4()
        const book = model.book
        const table = book.sheets[0].tree[2]
        assertIsTable(table)
        const cols = table.getLeafCols()
        const col2016 = cols[0]
        const col2017 = cols[1]
        const col2018 = cols[2]
        const col2019 = cols[3]

        const row1 = table.rows[0]
        assertIsRow(row1)
        const row2 = table.rows[1]
        assertIsRow(row2)
        const row3 = table.rows[2]
        assertIsRow(row3)
        const exprManager = buildExprDigest(row3)
        assertIsExprDigest(exprManager)
        const cells = exprManager.cells
        expect(cells.length).toBe(4)
        expect(cells.map((c: Readonly<Cell>): [string, string] =>
            [c.row, c.column])).toEqual([
                [row3.uuid, col2016.uuid],
                [row3.uuid, col2017.uuid],
                [row3.uuid, col2018.uuid],
                [row3.uuid, col2019.uuid],
            ])

        const cell0Expr = cells[0].cellExpr
        expect(cell0Expr?.op?.excelFormula('A1', 'A2')).toBe('A1+A2')
        expect(cell0Expr.inNodes).toEqual([
            [row1.uuid, col2016.uuid],
            [row2.uuid, col2016.uuid],
        ])
        expect(cell0Expr.castFrom.formulaBearer).toBe(row3.uuid)
        expect(cell0Expr.castFrom.sliceName).toBe(undefined)

        const cell1Expr = cells[1].cellExpr
        expect(cell1Expr?.op?.excelFormula('A1', 'A2')).toBe('A1+A2')
        expect(cell1Expr.inNodes).toEqual([
            [row1.uuid, col2017.uuid],
            [row2.uuid, col2017.uuid],
        ])
        expect(cell1Expr.castFrom.formulaBearer).toBe(row3.uuid)
        expect(cell1Expr.castFrom.sliceName).toBe(undefined)

        const cell2Expr = cells[2].cellExpr
        expect(cell2Expr?.op?.excelFormula('A1', 'A2')).toBe('A1+A2')
        expect(cell2Expr.inNodes).toEqual([
            [row1.uuid, col2018.uuid],
            [row2.uuid, col2018.uuid],
        ])
        expect(cell2Expr.castFrom.formulaBearer).toBe(row3.uuid)
        expect(cell2Expr.castFrom.sliceName).toBe(undefined)

        const cell3Expr = cells[3].cellExpr
        expect(cell3Expr?.op?.excelFormula('A1', 'A2')).toBe('A1+A2')
        expect(cell3Expr.inNodes).toEqual([
            [row1.uuid, col2019.uuid],
            [row2.uuid, col2019.uuid],
        ])
        expect(cell3Expr.castFrom.formulaBearer).toBe(row3.uuid)
        expect(cell3Expr.castFrom.sliceName).toBe(undefined)
    })
    it('', (): void => {
        const col = new ColumnBuilder().name('col').build()
        const row = new RowBuilder()
            .name('r')
            .expression('{r} + {b} + {b}')
            .build()
        const row2 = new RowBuilder().name('b').build()
        const table = new TableBuilder()
            .name('table')
            .subnodes([col, row, row2])
            .build()
        const sheet = new SheetBuilder().name('sheet').tree([table]).build()
        new BookBuilder().name('book').sheets([sheet]).build()
        const digest = buildExprDigest(row)
        assertIsExprDigest(digest)
        expect(digest.cells[0].cellExpr.inNodes.length).toBe(2)
    })
})
