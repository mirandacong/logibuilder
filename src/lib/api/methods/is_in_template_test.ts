import {EditorServiceBuilder} from '@logi/src/lib/api'
import {
    BookBuilder,
    ColumnBlockBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {TemplateBuilder, TemplateSetBuilder} from '@logi/src/lib/template'

import {isInTemplate} from './is_in_template'

describe('test is in template', (): void => {
    it('', (): void => {
        const book = new BookBuilder().name('').build()
        const col = new ColumnBlockBuilder().name('').build()
        const table = new TableBuilder().name('').subnodes([col]).build()
        const tmpl = new TemplateBuilder().node(table).build()
        const set = new TemplateSetBuilder().templates([tmpl]).build()
        const service = new EditorServiceBuilder()
            .book(book)
            .templateSet(set)
            .build()
        expect(isInTemplate(book, service)).toBe(false)
        expect(isInTemplate(table, service)).toBe(true)
        expect(isInTemplate(col, service)).toBe(true)
    })
})
