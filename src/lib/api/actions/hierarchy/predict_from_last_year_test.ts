// tslint:disable: no-magic-numbers
import {isException} from '@logi/base/ts/common/exception'
import {
    EditorService,
    EditorServiceBuilder,
    handleAction,
} from '@logi/src/lib/api'
import {lexSuccess, lexV2} from '@logi/src/lib/dsl'
import {buildEst} from '@logi/src/lib/dsl/semantic'
import {
    assertIsRow,
    assertIsTable,
    BookBuilder,
    Row,
    RowBuilder,
    SheetBuilder,
    SliceExprBuilder,
    Table,
    TableBuilder,
    Type,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './predict_from_last_year'

// tslint:disable-next-line: max-func-body-length
describe('generate predict-from-last-year expression action', (): void => {
    let service: EditorService
    let row1: Readonly<Row>
    let row2: Readonly<Row>
    beforeEach(() => {
        service = mockService()
        const sheet = service.book.sheets[0]
        const table = sheet.tree[0]
        assertIsTable(table)
        const r1 = table.rows[0]
        const r2 = table.rows[1]
        assertIsRow(r1)
        assertIsRow(r2)
        row1 = r1
        row2 = r2
    })
    it('row without slice', (): void => {
        const oldExpression = row1.expression
        const action = new ActionBuilder().target(row1.uuid).build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const table = getTable()
        const r1 = table.rows[0]
        assertIsRow(r1)
        expect(r1.sliceExprs.length).toBe(2)
        expect(r1.sliceExprs[0].name).toBe('历史期')
        expect(r1.sliceExprs[1].name).toBe('预测期')
        expect(r1.sliceExprs[0].type).toBe(Type.FACT)
        expect(r1.sliceExprs[1].type).toBe(Type.ASSUMPTION)
        expect(r1.sliceExprs[0].expression).toBe(oldExpression)
        const e = `{${r1.name}}.lag(1y)`
        expect(r1.sliceExprs[1].expression).toBe(e)
        const toks = lexV2(e)
        expect(lexSuccess(toks)).toBe(true)
        if (!lexSuccess(toks))
            return
        const est = buildEst(toks)
        expect(isException(est)).toBeFalse()
    })
    it('row with hist slice', () => {
        const action = new ActionBuilder().target(row2.uuid).build()
        const histSliceExpression = row2.sliceExprs[0].expression
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const table = getTable()
        const r2 = table.rows[1]
        assertIsRow(r2)
        expect(r2.sliceExprs.length).toBe(2)
        expect(r2.sliceExprs[0].name).toBe('历史期')
        expect(r2.sliceExprs[1].name).toBe('预测期')
        expect(r2.sliceExprs[0].type).toBe(Type.FACT)
        expect(r2.sliceExprs[1].type).toBe(Type.ASSUMPTION)
        expect(r2.sliceExprs[0].expression).toBe(histSliceExpression)
        const e = `{${r2.name}}.lag(1y)`
        expect(r2.sliceExprs[1].expression).toBe(e)
        const toks = lexV2(e)
        expect(lexSuccess(toks)).toBe(true)
        if (!lexSuccess(toks))
            return
        const est = buildEst(toks)
        expect(isException(est)).toBeFalse()
    })
    function getTable(): Readonly<Table> {
        const sheet = service.book.sheets[0]
        const table = sheet.tree[0]
        assertIsTable(table)
        return table
    }
})

function mockService(): EditorService {
    const r1 = new RowBuilder()
        .uuid('row1')
        .name('row1')
        .expression('{row1}')
        .build()
    const r2 = new RowBuilder()
        .uuid('row2')
        .name('row2')
        .sliceExprs([new SliceExprBuilder()
            .name('历史期')
            .expression('1')
            .type(Type.FACT)
            .build()],
        )
        .build()
    const table = new TableBuilder().name('table1').subnodes([r1, r2]).build()
    const sheet = new SheetBuilder().name('s').tree([table]).build()
    const book = new BookBuilder().name('').sheets([sheet]).build()
    return new EditorServiceBuilder().book(book).build()
}
