// tslint:disable: no-magic-numbers
import {isException} from '@logi/base/ts/common/exception'
import {
    EditorService,
    EditorServiceBuilder,
    handleAction,
} from '@logi/src/lib/api'
import {
    assertIsTable,
    BookBuilder,
    ColumnBlockBuilder,
    SheetBuilder,
    Table,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {TemplateBuilder, TemplateSetBuilder} from '@logi/src/lib/template'

import {ActionBuilder} from './unlink'

describe('test unlink action', (): void => {
    let table: Readonly<Table>
    let backend: Readonly<EditorService>
    beforeEach((): void => {
        backend = mockService()
        const t = backend.book.sheets[0].tree[0]
        assertIsTable(t)
        table = t
    })
    it('unlink', (): void => {
        const action = new ActionBuilder().targets([table.uuid]).build()
        const res = handleAction(action, backend)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = backend.book.sheets[0].tree[0]
        assertIsTable(newTable)
        expect(newTable.referenceHeader).toBe(undefined)
    })
})

function mockService(): Readonly<EditorService> {
    const sharedCol = new ColumnBlockBuilder().name('share col').build()
    const template1 = new TemplateBuilder().node(sharedCol).build()
    const table1 = new TableBuilder()
        .name('table1')
        .referenceHeader(sharedCol.uuid)
        .build()
    const table2 = new TableBuilder()
        .name('table2')
        .referenceHeader(sharedCol.uuid)
        .build()
    const sheet = new SheetBuilder()
        .name('sheet')
        .tree([table1, table2])
        .build()
    const book = new BookBuilder().name('book').sheets([sheet]).build()
    const templateSet = new TemplateSetBuilder().templates([template1]).build()
    return new EditorServiceBuilder()
        .book(book)
        .templateSet(templateSet)
        .build()
}
