// tslint:disable: ordered-imports
// tslint:disable-next-line: no-import-side-effect
import '@logi/base/ts/spreadjs/spreadjs_init'
// tslint:disable-next-line: no-wildcard-import
import * as GC from '@grapecity/spread-sheets'
import {EditorServiceBuilder, handleAction} from '@logi/src/lib/api'
import {BookBuilder, SheetBuilder} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './load_tbr_workbook'

describe('load tbr workbook action test', (): void => {
    it('load tbr workbook action test', (): void => {
        const book = new BookBuilder()
            .name('')
            .sheets([
                new SheetBuilder().name('logi1').build(),
                new SheetBuilder().name('logi2').build(),
            ])
            .build()
        const wb = new GC.Spread.Sheets.Workbook()
        wb.clearSheets()
        const ws1 = new GC.Spread.Sheets.Worksheet('custom1')
        const ws2 = new GC.Spread.Sheets.Worksheet('logi1')
        const ws3 = new GC.Spread.Sheets.Worksheet('custom2')
        wb.addSheet(0, ws1)
        wb.addSheet(1, ws2)
        // tslint:disable-next-line: no-magic-numbers
        wb.addSheet(2, ws3)
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder()
            .workbook(wb)
            .customSheets(['custom1', 'custom2'])
            .build()
        handleAction(action, service)
        const targetSheets = service.excel.sheets.map(s => s.name())
        expect(targetSheets).toEqual(['logi1', 'logi2', 'custom1', 'custom2'])
    })
})
