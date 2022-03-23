import {EditorServiceBuilder, handleAction} from '@logi/src/lib/api'
import {
    assertIsTable,
    BookBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {
    ReportDateBuilder,
    StandardHeaderBuilder,
    TemplateSetBuilder,
} from '@logi/src/lib/template'

import {ActionBuilder} from './remove_std_header'

// tslint:disable-next-line: max-func-body-length
describe('test remove std header action', (): void => {
    it('remove std header', (): void => {
        const table = new TableBuilder()
            .name('t')
            .referenceHeader('std')
            .build()
        const sheet = new SheetBuilder().name('sheet').tree([table]).build()
        const book = new BookBuilder().name('book').sheets([sheet]).build()
        const stdHeader = new StandardHeaderBuilder()
            .reportDate(new ReportDateBuilder().build())
            .name('std')
            .build()
        const set = new TemplateSetBuilder()
            .standardHeaders([stdHeader])
            .defaultHeader('std')
            .build()
        const service = new EditorServiceBuilder()
            .book(book)
            .templateSet(set)
            .build()
        const action = new ActionBuilder().name('std').build()
        handleAction(action, service)
        expect(service.templateSet.standardHeaders.length).toBe(0)
        expect(service.templateSet.defaultHeader).toBe(undefined)
        const newTable = service.book.sheets[0].tree[0]
        assertIsTable(newTable)
        expect(newTable.referenceHeader).toBe(undefined)
    })
})
