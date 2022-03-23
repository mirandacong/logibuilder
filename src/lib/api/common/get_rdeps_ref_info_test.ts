// tslint:disable: no-magic-numbers
import {EditorServiceBuilder} from '@logi/src/lib/api'
import {ExprManager} from '@logi/src/lib/dsl/semantic'
import {
    Book,
    BookBuilder,
    Node,
    Row,
    RowBlockBuilder,
    RowBuilder,
    Sheet,
    SheetBuilder,
    SliceExprBuilder,
    Table,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {getRdeps, getRdepsRefInfo, Rdep} from './get_rdeps_ref_info'

// tslint:disable-next-line: max-func-body-length
describe('updateRef test', (): void => {
    let book: Readonly<Book>
    let sheet1: Readonly<Sheet>
    let table1: Readonly<Table>
    let table2: Readonly<Table>
    let exprManager: ExprManager
    let nodeMap: Map<string, Readonly<Node>>
    beforeEach((): void => {
        book = buildBook()
        sheet1 = book.sheets[0]
        // tslint:disable: no-type-assertion
        table1 = sheet1.tree[0] as Readonly<Table>
        table2 = sheet1.tree[1] as Readonly<Table>
        const service = new EditorServiceBuilder().book(book).build()
        exprManager = service.exprManager
        exprManager.convert(book)
        nodeMap = service.bookMap
    })
    /**
     * row3 = {row1} + {row2}
     * row4 = {sheet1!table1!row1} + {sheet1!table1!row2!rbr1}
     * hist = {row2}[hist]
     * proj = {row2}[hist] + {sheet1!table1!row2}[proj]
     * row21 = {sheet1!table2!row22}
     * row23 = {row22}
     * rs1 = {row22}
     */
    it('table2 getRdepsRefInfo test', (): void => {
        const tableResult = getRdepsRefInfo(table2, exprManager, nodeMap)
        expect(tableResult.length).toBe(1)
        expect(tableResult[0].ranges).toEqual([[8, 13]])
    })
    it('row1 getRdepsRefInfo test', (): void => {
        const row1 = table1.rows[0] as Readonly<Row>
        const row1Result = getRdepsRefInfo(row1, exprManager, nodeMap)
        expect(row1Result.length).toBe(1)
        expect(row1Result[0].ranges).toEqual([[1, 4]])
    })
    it('row21 getRdepsRefInfo test', (): void => {
        const row21 = table2.rows[0] as Readonly<Row>
        const row21Result = getRdepsRefInfo(row21, exprManager, nodeMap)
        expect(row21Result.length).toBe(0)
    })
    it('row22 getRdepsRefInfo test', (): void => {
        const row22 = table2.rows[1] as Readonly<Row>
        const row22Result = getRdepsRefInfo(row22, exprManager, nodeMap)
        expect(row22Result.length).toBe(3)
        expect(row22Result[0].ranges).toEqual([[15, 19]])
        expect(row22Result[1].ranges).toEqual([[1, 5]])
        expect(row22Result[2].ranges).toEqual([[1, 5]])
    })
    it('sheet1 getRdepsRefInfo test', (): void => {
        const sheetResult = getRdepsRefInfo(sheet1, exprManager, nodeMap)
        expect(sheetResult.length).toBe(2)
        expect(sheetResult[0].ranges).toEqual([[16, 21]])
        expect(sheetResult[1].ranges).toEqual([[1, 6]])
    })
    it('sheet getRdeps test', (): void => {
        const rdeps = getRdeps(sheet1, exprManager, nodeMap)
        expect(rdeps.length).toBe(6)
        const names = ['row3', 'row4', 'row4', 'row21', 'row23', 'row24']
        const sliceNames = [undefined, 'hist', 'proj', undefined,
            undefined, 'rs1']
        rdeps.forEach((rdep: Readonly<Rdep>, i: number): void => {
            expect(rdep.fb.name).toBe(names[i])
            expect(rdep.slice?.name).toBe(sliceNames[i])
        })
    })
    it('table2 getRdeps test', (): void => {
        const rdeps = getRdeps(table2, exprManager, nodeMap)
        expect(rdeps.length).toBe(3)
        const names = ['row21', 'row23', 'row24']
        const sliceNames = [undefined, undefined, 'rs1']
        rdeps.forEach((rdep: Readonly<Rdep>, i: number): void => {
            expect(rdep.fb.name).toBe(names[i])
            expect(rdep.slice?.name).toBe(sliceNames[i])
        })
    })
})

// tslint:disable-next-line: max-func-body-length
function buildBook(): Readonly<Book> {
    const book = new BookBuilder().name('book1').build()
    const sheet = new SheetBuilder().name('sheet1').build()
    book.insertSubnode(sheet)
    const table1 = new TableBuilder().name('table1').build()
    sheet.insertSubnode(table1)
    const r1 = new RowBuilder().name('row1').build()
    table1.insertSubnode(r1)
    const r2s1 = new SliceExprBuilder().name('hist').build()
    const r2s2 = new SliceExprBuilder().name('proj').build()
    const r2 = new RowBuilder().name('row2').sliceExprs([r2s1, r2s2]).build()
    const rb2 = new RowBlockBuilder().name('row2').build()
    const rbr1 = new RowBuilder().name('rbr1').build()
    rb2.insertSubnode(rbr1)
    table1.insertSubnode(r2)
    table1.insertSubnode(rb2)
    const r3 = new RowBuilder()
        .name('row3')
        .expression('{row1} + {row2}')
        .build()
    table1.insertSubnode(r3)
    const r4s1 = new SliceExprBuilder()
        .name('hist')
        .expression('{row2}[hist]')
        .build()
    const r4s2 = new SliceExprBuilder()
        .name('proj')
        .expression('{row2}[hist] + {sheet1!table1!row2}[proj]')
        .build()
    const r4 = new RowBuilder()
        .name('row4')
        .expression('{sheet1!table1!row1} + {sheet1!table1!row2!rbr1}')
        .sliceExprs([r4s1, r4s2])
        .build()
    table1.insertSubnode(r4)
    const row21 = new RowBuilder()
        .name('row21')
        .expression('{sheet1!table2!row22}')
        .build()
    const row22 = new RowBuilder().name('row22').build()
    const row23 = new RowBuilder().name('row23').expression('{row22}').build()
    const rs1 = new SliceExprBuilder().name('rs1').expression('{row22}').build()
    const row4 = new RowBuilder().name('row24').sliceExprs([rs1]).build()
    const rb = new RowBlockBuilder().name('rb2').tree([row4]).build()
    const table2 = new TableBuilder()
        .name('table2')
        .labels(['label'])
        .subnodes([row21, row22, row23, rb])
        .build()
    sheet.insertSubnode(table2)
    return book
}
