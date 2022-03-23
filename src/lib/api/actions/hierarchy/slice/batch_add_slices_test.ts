import {EditorServiceBuilder, handleAction} from '@logi/src/lib/api'
import {
    AnnotationKey,
    assertIsRow,
    assertIsTable,
    BookBuilder,
    ColumnBuilder,
    RowBuilder,
    SheetBuilder,
    SliceExprBuilder,
    TableBuilder,
    Type,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './batch_add_slices'

// tslint:disable-next-line: max-func-body-length
describe('test add slice action', (): void => {
    it('add slice with init', (): void => {
        const row = new RowBuilder()
            .name('row1')
            .type(Type.FACT)
            .expression('1')
            .annotations(new Map([
                [AnnotationKey.LINK_CODE, 'code'],
                [AnnotationKey.LINK_NAME, 'name'],
            ]))
            .build()
        const row2 = new RowBuilder()
            .name('row2')
            .sliceExprs([new SliceExprBuilder().name('s1').build()])
            .build()
        const table = new TableBuilder().name('').subnodes([row, row2]).build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder()
            .targets([row.uuid, row2.uuid])
            .build()
        handleAction(action, service)
        const newTable = service.book.sheets[0].tree[0]
        assertIsTable(newTable)
        const newR1 = newTable.rows[0]
        assertIsRow(newR1)
        // tslint:disable: no-magic-numbers
        expect(newR1.expression).toBe('')
        expect(newR1.sliceExprs.length).toBe(1)
        expect(newR1.sliceExprs[0].type).toBe(Type.FACT)
        expect(newR1.sliceExprs[0].expression).toBe('1')
        expect(newR1.sliceExprs[0].annotations.get(AnnotationKey.LINK_CODE))
            .toBe('code')
        expect(newR1.sliceExprs[0].annotations.get(AnnotationKey.LINK_NAME))
            .toBe('name')
        const newR2 = newTable.rows[1]
        assertIsRow(newR2)
        expect(newR2.sliceExprs.length).toBe(2)
        expect(newR2.sliceExprs[1].name).toBe('')
    })
    it('label test', (): void => {
        const row = new RowBuilder().name('row1').build()
        const row2 = new RowBuilder()
            .name('row2')
            .sliceExprs([new SliceExprBuilder().name('其他').build()])
            .build()
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

        const action = new ActionBuilder()
            .targets([
            row.uuid,
            row2.uuid,
            row3.uuid,
            row4.uuid,
        ])
            .build()
        handleAction(action, service)
        const newRow = service.bookMap.get(row.uuid)
        assertIsRow(newRow)
        expect(newRow.sliceExprs[0].name).toBe('历史期')

        const newRow2 = service.bookMap.get(row2.uuid)
        assertIsRow(newRow2)
        expect(newRow2.sliceExprs[1].name).toBe('')

        const newRow3 = service.bookMap.get(row3.uuid)
        assertIsRow(newRow3)
        expect(newRow3.sliceExprs[1].name).toBe('预测期')

        const newRow4 = service.bookMap.get(row4.uuid)
        assertIsRow(newRow4)
        expect(newRow4.sliceExprs[1].name).toBe('历史期')
    })
})
