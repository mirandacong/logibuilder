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
    Table,
    TableBuilder,
    Type,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './paste'

// tslint:disable-next-line: max-func-body-length
describe('paste slice test', (): void => {
    let service: EditorService
    let row: Readonly<Row>
    let row2: Readonly<Row>
    let slice1: SliceExpr
    let slice2: SliceExpr
    let table: Readonly<Table>
    beforeEach((): void => {
        slice1 = new SliceExprBuilder().name('slice1').build()
        slice2 = new SliceExprBuilder().name('slice2').build()
        row = new RowBuilder().name('').sliceExprs([slice1, slice2]).build()
        row2 = new RowBuilder()
            .name('')
            .expression('foo')
            .type(Type.FACT)
            .build()
        table = new TableBuilder().name('').subnodes([row, row2]).build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        service = new EditorServiceBuilder().book(book).build()
    })
    it('paste to end', (): void => {
        service.clipboard.setSlices([slice1.uuid, slice2.uuid], false)
        const action = new ActionBuilder().target(row.uuid).build()
        const res = handleAction(action, service)
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
        // tslint:disable: no-magic-numbers
        expect(newRow.sliceExprs.length).toBe(4)
        expect(newRow.sliceExprs[2].name).toBe('slice1')
        expect(newRow.sliceExprs[2]).not.toBe(slice1)
        expect(newRow.sliceExprs[3].name).toBe('slice2')
        expect(newRow.sliceExprs[3]).not.toBe(slice2)
        expect(newRow.sliceExprs[0]).toBe(slice1)
        expect(newRow.sliceExprs[1]).toBe(slice2)
    })
    it('paste to postion zero', (): void => {
        service.clipboard.setSlices([slice1.uuid, slice2.uuid], false)
        const action = new ActionBuilder().target(row.uuid).position(0).build()
        const res = handleAction(action, service)
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
        // tslint:disable: no-magic-numbers
        expect(newRow.sliceExprs.length).toBe(4)
        expect(newRow.sliceExprs[0].name).toBe('slice1')
        expect(newRow.sliceExprs[0]).not.toBe(slice1)
        expect(newRow.sliceExprs[1].name).toBe('slice2')
        expect(newRow.sliceExprs[1]).not.toBe(slice2)
        expect(newRow.sliceExprs[2]).toBe(slice1)
        expect(newRow.sliceExprs[3]).toBe(slice2)
    })
    it('paste to empty slices', (): void => {
        service.clipboard.setSlices([slice1.uuid, slice2.uuid], false)
        const action = new ActionBuilder().target(row2.uuid).build()
        const res = handleAction(action, service)
        if (isException(res))
            return
        const newTable = service.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        const newRow = newTable.rows[1]
        expect(isRow(newRow)).toBe(true)
        if (!isRow(newRow))
            return
        expect(newRow.expression).toBe('')
        expect(newRow.sliceExprs.length).toBe(3)
        expect(newRow.sliceExprs[0].expression).toBe('foo')
        expect(newRow.sliceExprs[0].type).toBe(Type.FACT)
        expect(newRow.sliceExprs[1].name).toBe('slice1')
        expect(newRow.sliceExprs[1]).not.toBe(slice1)
        expect(newRow.sliceExprs[2].name).toBe('slice2')
        expect(newRow.sliceExprs[2]).not.toBe(slice2)
    })
})
