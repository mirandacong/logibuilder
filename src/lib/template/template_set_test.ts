import {
    Book,
    BookBuilder,
    Column,
    ColumnBlock,
    ColumnBlockBuilder,
    ColumnBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {Template, TemplateBuilder} from './template'
import {TemplateSet, TemplateSetBuilder} from './template_set'

// tslint:disable-next-line: max-func-body-length
describe('Templates test: ', (): void => {
    let templateSet: Readonly<TemplateSet>
    let book: Readonly<Book>
    let bookTemplate: Readonly<Template>
    let column: Readonly<Column>
    let header: Readonly<ColumnBlock>
    let headerTemplate: Readonly<Template>

    beforeEach((): void => {
        book = new BookBuilder().name('book').build()
        bookTemplate = new TemplateBuilder().node(book).build()

        column = new ColumnBuilder().name('col').build()
        header = new ColumnBlockBuilder().name('header').tree([column]).build()
        headerTemplate = new TemplateBuilder().node(header).build()
        templateSet = new TemplateSetBuilder()
            .templates([bookTemplate, headerTemplate])
            .build()
    })
    it('add test', (): void => {
        const table = new TableBuilder().name('table').build()
        const tableTemplate = new TemplateBuilder().node(table).build()
        templateSet.add(tableTemplate)
        expect(templateSet.templates).toEqual([
            bookTemplate,
            headerTemplate,
            tableTemplate,
        ])
    })

    it('remove test', (): void => {
        templateSet.remove(bookTemplate)
        expect(templateSet.templates).toEqual([headerTemplate])
    })
})
