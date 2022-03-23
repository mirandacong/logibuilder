// tslint:disable: no-magic-numbers
import {isException} from '@logi/base/ts/common/exception'
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
} from '@logi/src/lib/hierarchy/core'
import {
    Item,
    ItemBuilder,
    ManualSourceBuilder,
    SourceManager,
} from '@logi/src/lib/source'

import {ActionBuilder} from './remove_db_data'

describe('test remove db data', (): void => {
    // tslint:disable-next-line: max-func-body-length
    it('row with link key test', (): void => {
        const col1 = new ColumnBuilder().name('col1').build()
        const col2 = new ColumnBuilder().name('col2').build()
        const slice = new SliceExprBuilder()
            .name('col2')
            .annotations(new Map([
                [AnnotationKey.LINK_NAME, 'name'],
                [AnnotationKey.LINK_CODE, 'foo'],
            ]))
            .build()
        const row = new RowBuilder().name('row').sliceExprs([slice]).build()
        const table = new TableBuilder()
            .name('table')
            .subnodes([row, col1, col2])
            .build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const source = new SourceManager([
            new ItemBuilder()
                .row(row.uuid)
                .col(col1.uuid)
                .source(new ManualSourceBuilder().value(1).build())
                .build(),
            new ItemBuilder()
                .row(row.uuid)
                .col(col2.uuid)
                .source(new ManualSourceBuilder().value(2).build())
                .build(),
        ])
        const service = new EditorServiceBuilder()
            .book(book)
            .sourceManager(source)
            .build()
        const action = new ActionBuilder().target(row.uuid).slice(slice).build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = service.book.sheets[0].tree[0]
        assertIsTable(newTable)
        const newRow = newTable.rows[0]
        assertIsRow(newRow)
        const newSlice = newRow.sliceExprs[0]
        expect(newSlice.annotations.get(AnnotationKey.LINK_NAME))
            .toBeUndefined()
        expect(newSlice.annotations.get(AnnotationKey.LINK_CODE))
            .toBeUndefined()
        expect(service.sourceManager.data.length).toBe(2)
        const expectedData = [
            [row.uuid, col1.uuid, 1],
            [row.uuid, col2.uuid, ''],
        ] as const
        service.sourceManager.data
            .forEach((d: Readonly<Item>, i: number): void => {
                const expected = expectedData[i]
                expect(d.row).toBe(expected[0])
                expect(d.col).toBe(expected[1])
                expect(d.source.value).toEqual(expected[2])
            })
    })
})
