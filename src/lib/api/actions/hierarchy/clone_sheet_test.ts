import {isException} from '@logi/base/ts/common/exception'
import {EditorServiceBuilder, handleAction} from '@logi/src/lib/api'
import {
    assertIsTable,
    BookBuilder,
    ColumnBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {
    ItemBuilder,
    ManualSourceBuilder,
    SourceManager,
} from '@logi/src/lib/source'

import {ActionBuilder} from './clone_sheet'

// tslint:disable-next-line: max-func-body-length
describe('test add formulars action', (): void => {
    it('add to table', (): void => {
        const row = new RowBuilder().name('row').build()
        const col = new ColumnBuilder().name('col').build()
        const table = new TableBuilder().name('').subnodes([row, col]).build()
        const sheet = new SheetBuilder().name('sheet1').tree([table]).build()
        const sheet2 = new SheetBuilder().name('sheet2').build()
        const book = new BookBuilder().name('').sheets([sheet, sheet2]).build()
        const source = new ManualSourceBuilder().value(1).build()
        const item = new ItemBuilder()
            .row(row.uuid)
            .col(col.uuid)
            .source(source)
            .build()
        const manager = new SourceManager([item])
        const service = new EditorServiceBuilder()
            .book(book)
            .sourceManager(manager)
            .build()
        const action = new ActionBuilder().sheet(sheet.uuid).build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newSheet = service.book.sheets[1]
        // tslint:disable: no-magic-numbers
        expect(service.book.sheets.length).toBe(3)
        expect(newSheet.name).toBe('sheet1 (1)')
        const newTable = newSheet.tree[0]
        assertIsTable(newTable)
        const newSrc = manager
            .getSource(newTable.rows[0].uuid, newTable.cols[0].uuid)
        expect(newSrc?.value).toEqual(1)
    })
})
