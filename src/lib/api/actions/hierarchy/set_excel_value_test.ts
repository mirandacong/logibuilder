import {
    EditorServiceBuilder,
    handleAction,
    RenderActionBuilder,
} from '@logi/src/lib/api'
import {
    assertIsRow,
    BookBuilder,
    ColumnBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './set_excel_value'

describe('test set expression action', (): void => {
    it('set expression', (): void => {
        const row = new RowBuilder().name('rol').build()
        const col = new ColumnBuilder().name('col').build()
        const table = new TableBuilder().name('').subnodes([row, col]).build()
        const sheet = new SheetBuilder().name('sheet').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const render = new RenderActionBuilder().build()
        handleAction(render, service)
        const gcSheet = service.excel.getSheetFromName('sheet')
        // tslint:disable: no-magic-numbers
        const dataCell = gcSheet.getCell(4, 1)
        dataCell.value(123)
        const action = new ActionBuilder()
            .sheetName('sheet')
            .positions([[4, 1]])
            .build()
        handleAction(action, service)
        expect(service.sourceManager.getSource(row.uuid, col.uuid)?.value)
            .toEqual(123)

        dataCell.formula('123')
        const action2 = new ActionBuilder()
            .sheetName('sheet')
            .positions([[4, 1]])
            .build()
        handleAction(action2, service)
        expect(service.formulaManager.getFormula(row.uuid, col.uuid))
            .toEqual('123')

        const rowCell = gcSheet.getCell(4, 0)
        rowCell.value('new name')
        const action3 = new ActionBuilder()
            .sheetName('sheet')
            .positions([[4, 0]])
            .build()
        handleAction(action3, service)
        const newRow = service.bookMap.get(row.uuid)
        assertIsRow(newRow)
        expect(newRow.name).toBe('new name')
    })
})
