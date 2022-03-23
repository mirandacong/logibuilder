import {isException} from '@logi/base/ts/common/exception'
import {
    EditorService,
    EditorServiceBuilder,
    handleAction,
} from '@logi/src/lib/api'
import {FormulaItemBuilder, FormulaManager} from '@logi/src/lib/formula'
import {
    assertIsTable,
    BookBuilder,
    ColumnBlockBuilder,
    ColumnBuilder,
    getSubnodes,
    isTable,
    RowBlockBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {
    FontBuilder,
    ModifierBuilder,
    ModifierManager,
} from '@logi/src/lib/modifier'
import {
    ItemBuilder,
    ManualSourceBuilder,
    SourceManager,
} from '@logi/src/lib/source'
import {TemplateBuilder, TemplateSetBuilder} from '@logi/src/lib/template'

import {ActionBuilder} from './paste'

// tslint:disable-next-line: max-func-body-length
describe('test add slice action', (): void => {
    it('paste to table', (): void => {
        const service = mockService()
        const table2 = service.book.sheets[0].tree[1]
        service.clipboard
            .setNodes([getSubnodes(table2)[0].uuid, table2.uuid], false)
        const action = new ActionBuilder()
            .base(service.book.sheets[0].tree[0].uuid)
            .build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        // tslint:disable: no-magic-numbers
        expect(service.book.sheets[0].tree.length).toBe(3)
        expect(service.book.sheets[0].tree[1].name).toBe('table2')
        const newTable = service.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        expect(newTable.rows.length).toBe(3)
        expect(newTable.rows[2].name).toBe('row2')
    })
    it('paste to sheet', (): void => {
        const service = mockService()
        const table1 = service.book.sheets[0].tree[0]
        service.clipboard
            .setNodes([getSubnodes(table1)[0].uuid, table1.uuid], false)
        const action = new ActionBuilder()
            .base(service.book.sheets[0].uuid)
            .build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        // tslint:disable: no-magic-numbers
        expect(service.book.sheets[0].tree.length).toBe(3)
        expect(service.book.sheets[0].tree[2].name).toBe('table1')
    })
    it('paste to row', (): void => {
        const service = mockService()
        const table = service.book.sheets[0].tree[0]
        expect(isTable(table)).toBe(true)
        if (!isTable(table))
            return
        const table2 = service.book.sheets[0].tree[1]
        service.clipboard.setNodes(
            [getSubnodes(table2)[0].uuid, table2.uuid,
                getSubnodes(table2)[1].uuid],
            false,
        )
        const action = new ActionBuilder().base(table.rows[0].uuid).build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        expect(service.book.sheets[0].tree.length).toBe(3)
        expect(service.book.sheets[0].tree[1].name).toBe('table2')
        const newTable = service.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        expect(newTable.rows.length).toBe(3)
        expect(newTable.rows[1].name).toBe('row2')
    })
    it('paste to row block', (): void => {
        const service = mockService()
        const table = service.book.sheets[0].tree[0]
        expect(isTable(table)).toBe(true)
        if (!isTable(table))
            return
        const table2 = service.book.sheets[0].tree[1]
        service.clipboard.setNodes(
            [
                getSubnodes(table2)[0].uuid,
                table2.uuid,
                getSubnodes(table2)[1].uuid,
                getSubnodes(table)[1].uuid,
            ],
            false,
        )
        const action = new ActionBuilder().base(table.rows[1].uuid).build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        expect(service.book.sheets[0].tree.length).toBe(3)
        expect(service.book.sheets[0].tree[1].name).toBe('table2')
        const newTable = service.book.sheets[0].tree[0]
        expect(isTable(newTable)).toBe(true)
        if (!isTable(newTable))
            return
        const newRows = newTable.rows
        expect(newRows.length).toBe(4)
        expect(newRows[2].name).toBe('row2')
        expect(newRows[3].name).toBe('rb')
    })
    it('paste to postion zero', (): void => {
        const service = mockService()
        const table = service.book.sheets[0].tree[0]
        expect(isTable(table)).toBe(true)
        if (!isTable(table))
            return
        service.clipboard.setNodes(
            [table.rows[0].uuid, table.rows[1].uuid],
            false,
        )
        const action = new ActionBuilder().base(table.uuid).build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const newTable = service.book.sheets[0].tree[0]
        assertIsTable(newTable)
        const subnodes = newTable.rows
        expect(subnodes.length).toBe(4)
        expect(subnodes[2].name).toBe('row1')
        expect(subnodes[3].name).toBe('rb')
    })
    it('paste source', (): void => {
        const service = mockService()
        const table2 = service.book.sheets[0].tree[1]
        service.clipboard
            .setNodes([table2.uuid, getSubnodes(table2)[0].uuid], false)
        const action = new ActionBuilder().base(table2.uuid).build()
        const res = handleAction(action, service)
        expect(isException(res)).toBe(false)
        if (isException(res))
            return
        const table3 = service.book.sheets[0].tree[2]
        assertIsTable(table3)
        const src1 = service.sourceManager.getSource(
            table3.rows[0].uuid,
            table3.cols[0].uuid,
        )
        expect(src1?.value).toEqual(1)
        const formula = service.formulaManager.getFormula(
            table3.rows[0].uuid,
            table3.cols[0].uuid,
        )
        expect(formula).toBe('1')
        const modifier = service.modifierManager.getModifier(
            table3.rows[0].uuid,
        )
        expect(modifier?.font.bold).toBe(true)
        const newTable2 = service.book.sheets[0].tree[1]
        assertIsTable(newTable2)
        const src2 = service.sourceManager.getSource(
            newTable2.rows[1].uuid,
            newTable2.cols[0].uuid,
        )
        expect(src2?.value).toEqual(1)
    })
})

function mockService(): EditorService {
    const shareColSet = new ColumnBlockBuilder().name('').build()
    const template = new TemplateBuilder().node(shareColSet).build()
    const templateSet = new TemplateSetBuilder().templates([template]).build()
    const row = new RowBuilder().name('row1').build()
    const rb = new RowBlockBuilder().name('rb').build()
    const col1 = new ColumnBuilder().name('col1').build()
    const table = new TableBuilder()
        .name('table1')
        .subnodes([row, rb, col1])
        .build()
    const row2 = new RowBuilder().name('row2').build()
    const col2 = new ColumnBuilder().name('col2').build()
    const table2 = new TableBuilder()
        .name('table2')
        .subnodes([row2, col2])
        .build()
    const sheet = new SheetBuilder().name('s').tree([table, table2]).build()
    const book = new BookBuilder().name('').sheets([sheet]).build()
    const source = new ManualSourceBuilder().value(1).build()
    const item = new ItemBuilder()
        .row(row2.uuid)
        .col(col2.uuid)
        .source(source)
        .build()
    const sm = new SourceManager([item])
    const fi = new FormulaItemBuilder()
        .row(row2.uuid)
        .col(col2.uuid)
        .formula('1')
        .build()
    const fm = new FormulaManager([fi])
    const mi = new ModifierBuilder()
        .uuid(row2.uuid)
        .font(new FontBuilder().bold(true).build())
        .build()
    const mm = new ModifierManager([mi])
    return new EditorServiceBuilder()
        .book(book)
        .templateSet(templateSet)
        .sourceManager(sm)
        .formulaManager(fm)
        .modifierManager(mm)
        .build()
}
