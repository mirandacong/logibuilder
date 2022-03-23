import {isException} from '@logi/base/ts/common/exception'
import {EditorServiceBuilder, handleAction} from '@logi/src/lib/api'
import {
    AnnotationKey,
    assertIsRow,
    BookBuilder,
    ColumnBuilder,
    isRow,
    isTable,
    RowBuilder,
    SheetBuilder,
    SliceExprBuilder,
    TableBuilder,
    Type,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './add_slice'

// tslint:disable-next-line: max-func-body-length
describe('test add slice action', (): void => {
    it('add slice with init', (): void => {
        const row = new RowBuilder()
            .name('row1')
            .type(Type.FACT)
            .expression('1')
            .build()
        const table = new TableBuilder().name('').subnodes([row]).build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder()
            .target(row.uuid)
            .addInitSlice(true)
            .build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = service.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        expect(isRow(newTable.rows[0])).toBe(true)
        if (!isRow(newTable.rows[0]))
            return
        // tslint:disable: no-magic-numbers
        expect(newTable.rows[0].expression).toBe('')
        expect(newTable.rows[0].sliceExprs.length).toBe(2)
        expect(newTable.rows[0].sliceExprs[0].type).toBe(Type.FACT)
        expect(newTable.rows[0].sliceExprs[0].expression).toBe('1')
        expect(newTable.rows[0].sliceExprs[1].type).toBe(Type.FX)
        expect(newTable.rows[0].sliceExprs[1].expression).toBe('')
    })
    it('add slice without init', (): void => {
        const row = new RowBuilder()
            .name('row1')
            .type(Type.FACT)
            .annotations(new Map([
                [AnnotationKey.LINK_CODE, 'code'],
                [AnnotationKey.LINK_NAME, 'name'],
            ]))
            .expression('1')
            .build()
        const table = new TableBuilder().name('').subnodes([row]).build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder().target(row.uuid).build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = service.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        expect(isRow(newTable.rows[0])).toBe(true)
        if (!isRow(newTable.rows[0]))
            return
        expect(newTable.rows[0].sliceExprs.length).toBe(1)
        expect(newTable.rows[0].sliceExprs[0].type).toBe(Type.FACT)
        expect(newTable.rows[0].sliceExprs[0].expression).toBe('1')
        expect(newTable.rows[0].sliceExprs[0].annotations
            .get(AnnotationKey.LINK_CODE),
        ).toBe('code')
        expect(newTable.rows[0].sliceExprs[0].annotations
            .get(AnnotationKey.LINK_NAME),
        ).toBe('name')
    })
    it('label test', (): void => {
        const row = new RowBuilder().name('row1').build()
        const row2 = new RowBuilder().name('row2').build()
        const row3 = new RowBuilder()
            .name('row3')
            .sliceExprs([new SliceExprBuilder().name('历史期').build()])
            .build()
        const row4 = new RowBuilder()
            .name('row4')
            .sliceExprs([new SliceExprBuilder().name('预测期').build()])
            .build()
        const col1 = new ColumnBuilder().name('col1').labels(['历史期']).build()
        const col2 = new ColumnBuilder().name('col2').labels(['预测期']).build()
        const table = new TableBuilder()
            .name('')
            .subnodes([row, row2, row3, row4, col1, col2])
            .build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()

        const action = new ActionBuilder().target(row.uuid).build()
        handleAction(action, service)
        const newRow = service.bookMap.get(row.uuid)
        assertIsRow(newRow)
        expect(newRow.sliceExprs[0].name).toBe('历史期')

        const action2 = new ActionBuilder()
            .target(row2.uuid)
            .addInitSlice(true)
            .build()
        handleAction(action2, service)
        const newRow2 = service.bookMap.get(row2.uuid)
        assertIsRow(newRow2)
        expect(newRow2.sliceExprs[0].name).toBe('历史期')
        expect(newRow2.sliceExprs[1].name).toBe('预测期')

        const action3 = new ActionBuilder().target(row3.uuid).build()
        handleAction(action3, service)
        const newRow3 = service.bookMap.get(row3.uuid)
        assertIsRow(newRow3)
        expect(newRow3.sliceExprs[1].name).toBe('预测期')

        const action4 = new ActionBuilder().target(row4.uuid).build()
        handleAction(action4, service)
        const newRow4 = service.bookMap.get(row4.uuid)
        assertIsRow(newRow4)
        expect(newRow4.sliceExprs[1].name).toBe('历史期')
    })
})
