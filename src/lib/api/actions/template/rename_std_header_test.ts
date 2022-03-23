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

import {ActionBuilder} from './rename_std_header'

// tslint:disable-next-line: max-func-body-length
describe('test rename std header action', (): void => {
    it('rename std header', (): void => {
        const table = new TableBuilder()
            .name('t1')
            .referenceHeader('std')
            .build()
        const table1 = new TableBuilder()
            .name('t2')
            .referenceHeader('std')
            .build()
        const sheet = new SheetBuilder()
            .name('sheet')
            .tree([table, table1])
            .build()
        const book = new BookBuilder().name('b').sheets([sheet]).build()
        const stdHeader = new StandardHeaderBuilder()
            .reportDate(new ReportDateBuilder().build())
            .name('std')
            .build()
        const set = new TemplateSetBuilder()
            .standardHeaders([stdHeader])
            .build()
        const service = new EditorServiceBuilder()
            .book(book)
            .templateSet(set)
            .build()
        const action = new ActionBuilder()
            .oldName('std')
            .newName('std1')
            .build()
        handleAction(action, service)
        expect(service.templateSet.standardHeaders[0].name).toBe('std1')
        const new1 = service.book.sheets[0].tree[0]
        const new2 = service.book.sheets[0].tree[1]
        assertIsTable(new1)
        assertIsTable(new2)
        expect(new1.referenceHeader).toBe('std1')
        expect(new2.referenceHeader).toBe('std1')
    })
})
