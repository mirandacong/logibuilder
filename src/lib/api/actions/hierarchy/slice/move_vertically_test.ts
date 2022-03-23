import {isException} from '@logi/base/ts/common/exception'
import {
    EditorService,
    EditorServiceBuilder,
    handleAction,
} from '@logi/src/lib/api'
import {
    BookBuilder,
    isRow,
    isTable,
    Row,
    RowBuilder,
    SheetBuilder,
    SliceExpr,
    SliceExprBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './move_vertically'

// tslint:disable-next-line: max-func-body-length
describe('test move slice vertically', (): void => {
    let service: EditorService
    let row: Readonly<Row>
    let slice1: SliceExpr
    let slice2: SliceExpr
    let slice3: SliceExpr
    let slice4: SliceExpr
    let slice5: SliceExpr
    beforeEach((): void => {
        slice1 = new SliceExprBuilder().name('').expression('1').build()
        slice2 = new SliceExprBuilder().name('').expression('2').build()
        slice3 = new SliceExprBuilder().name('').expression('3').build()
        slice4 = new SliceExprBuilder().name('').expression('4').build()
        slice5 = new SliceExprBuilder().name('').expression('5').build()
        row = new RowBuilder()
            .name('')
            .sliceExprs([slice1, slice2, slice3, slice4, slice5])
            .build()
        const table = new TableBuilder().name('').subnodes([row]).build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        service = new EditorServiceBuilder().book(book).build()
    })
    it('up', (): void => {
        const action = new ActionBuilder()
            .target(row.uuid)
            .slices([slice3, slice1, slice4])
            .isUp(true)
            .build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = service.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        const newRow = newTable.rows[0]
        expect(isRow(newRow)).toBe(true)
        if (!isRow(newRow))
            return
        expect(newRow.sliceExprs[0]).toBe(slice1)
        expect(newRow.sliceExprs[1]).toBe(slice3)
        // tslint:disable: no-magic-numbers
        expect(newRow.sliceExprs[2]).toBe(slice4)
        expect(newRow.sliceExprs[3]).toBe(slice2)
        expect(newRow.sliceExprs[4]).toBe(slice5)
    })
    it('down', (): void => {
        const action = new ActionBuilder()
            .target(row.uuid)
            .slices([slice1, slice3, slice5])
            .isUp(false)
            .build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = service.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        const newRow = newTable.rows[0]
        expect(isRow(newRow)).toBe(true)
        if (!isRow(newRow))
            return
        expect(newRow.sliceExprs[0]).toBe(slice2)
        expect(newRow.sliceExprs[1]).toBe(slice1)
        expect(newRow.sliceExprs[2]).toBe(slice4)
        expect(newRow.sliceExprs[3]).toBe(slice3)
        expect(newRow.sliceExprs[4]).toBe(slice5)
    })
})
