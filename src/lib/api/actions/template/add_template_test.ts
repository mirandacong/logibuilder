// tslint:disable: no-magic-numbers
import {isException} from '@logi/base/ts/common/exception'
import {EditorServiceBuilder, handleAction} from '@logi/src/lib/api'
import {
    assertIsSheet,
    assertIsTable,
    BookBuilder,
    NodeType,
    RowBlockBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {TemplateBuilder, TemplateSetBuilder, Type} from '@logi/src/lib/template'

import {ActionBuilder} from './add_template'

// tslint:disable-next-line: max-func-body-length
describe('test set expression action', (): void => {
    it('set expression', (): void => {
        const col1 = new RowBuilder().name('col1').build()
        const col2 = new RowBuilder().name('col2').expression('{row1}').build()
        const table = new TableBuilder()
            .name('table')
            .subnodes([col1, col2])
            .build()
        const sheet = new SheetBuilder().name('sheet').tree([table]).build()
        const book = new BookBuilder().name('book').sheets([sheet]).build()
        const templateRow1 = new RowBuilder().name('row1').build()
        const templateRow2 = new RowBuilder().name('row2').build()
        const templateRb = new RowBlockBuilder()
            .name('rb')
            .tree([templateRow1, templateRow2])
            .build()
        const templateSet = new TemplateSetBuilder()
            .templates([new TemplateBuilder().node(templateRb).build()])
            .build()

        const service = new EditorServiceBuilder()
            .book(book)
            .templateSet(templateSet)
            .build()
        const action = new ActionBuilder()
            .name('new_template')
            .type(Type.TABLE)
            .build()
        const result = handleAction(action, service)
        expect(isException(result)).toBe(false)
        if (isException(result))
            return
        expect(service.templateSet.templates.length).toBe(2)
        const newTemplate = service.templateSet.templates[1]
        expect(newTemplate.node.name).toBe('new_template')
        expect(newTemplate.node.nodetype).toBe(NodeType.SHEET)
        const s = newTemplate.node
        assertIsSheet(s)
        assertIsTable(s.tree[0])
    })
})
