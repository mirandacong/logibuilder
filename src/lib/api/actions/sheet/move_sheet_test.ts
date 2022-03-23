// tslint:disable: ordered-imports
// tslint:disable-next-line: no-import-side-effect
import '@logi/base/ts/spreadjs/spreadjs_init'
// tslint:disable-next-line: no-wildcard-import
import * as GC from '@grapecity/spread-sheets'
import {
    EditorService,
    EditorServiceBuilder,
    handleAction,
    RenderActionBuilder,
} from '@logi/src/lib/api'
import {BookBuilder, SheetBuilder} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './move_sheet'

// tslint:disable-next-line: max-func-body-length
describe('add sheet test', (): void => {
    let service: EditorService
    beforeEach((): void => {
        const s1 = new SheetBuilder().name('s1').build()
        const s2 = new SheetBuilder().name('s2').build()
        const book = new BookBuilder().name('book').sheets([s1, s2]).build()
        service = new EditorServiceBuilder().book(book).build()
        const ws1 = new GC.Spread.Sheets.Worksheet('ws1')
        const ws2 = new GC.Spread.Sheets.Worksheet('ws2')
        const ws3 = new GC.Spread.Sheets.Worksheet('ws3')
        // tslint:disable: no-magic-numbers
        service.excel.addSheet(2, ws3)
        service.excel.addSheet(1, ws2)
        service.excel.addSheet(0, ws1)
        const render = new RenderActionBuilder().build()
        handleAction(render, service)
    })
    it('move pos 1 to 0', (): void => {
        const action = new ActionBuilder().sheetName('s1').position(0).build()
        handleAction(action, service)
        expect(service.book.sheets.map(s => s.name)).toEqual(['s1', 's2'])
        expect(service.excel.sheets.map(s => s.name()))
            .toEqual(['s1', 'ws1', 'ws2', 's2', 'ws3'])
    })
    it('move pos 1 to 2', (): void => {
        const action = new ActionBuilder().sheetName('s1').position(2).build()
        handleAction(action, service)
        expect(service.book.sheets.map(s => s.name)).toEqual(['s1', 's2'])
        expect(service.excel.sheets.map(s => s.name()))
            .toEqual(['ws1', 'ws2', 's1', 's2', 'ws3'])
    })
    it('move pos 1 to 3', (): void => {
        const action = new ActionBuilder().sheetName('s1').position(3).build()
        handleAction(action, service)
        expect(service.book.sheets.map(s => s.name)).toEqual(['s2', 's1'])
        expect(service.excel.sheets.map(s => s.name()))
            .toEqual(['ws1', 'ws2', 's2', 's1', 'ws3'])
    })
    it('move pos 1 to 4', (): void => {
        const action = new ActionBuilder().sheetName('s1').position(4).build()
        handleAction(action, service)
        expect(service.book.sheets.map(s => s.name)).toEqual(['s2', 's1'])
        expect(service.excel.sheets.map(s => s.name()))
            .toEqual(['ws1', 'ws2', 's2', 'ws3', 's1'])
    })
    it('move pos 2 to 0', (): void => {
        const action = new ActionBuilder().sheetName('ws2').position(0).build()
        handleAction(action, service)
        expect(service.book.sheets.map(s => s.name)).toEqual(['s1', 's2'])
        expect(service.excel.sheets.map(s => s.name()))
            .toEqual(['ws2', 'ws1', 's1', 's2', 'ws3'])
    })
    it('move pos 2 to 1', (): void => {
        const action = new ActionBuilder().sheetName('ws2').position(1).build()
        handleAction(action, service)
        expect(service.book.sheets.map(s => s.name)).toEqual(['s1', 's2'])
        expect(service.excel.sheets.map(s => s.name()))
            .toEqual(['ws1', 'ws2', 's1', 's2', 'ws3'])
    })
    it('move pos 2 to 3', (): void => {
        const action = new ActionBuilder().sheetName('ws2').position(3).build()
        handleAction(action, service)
        expect(service.book.sheets.map(s => s.name)).toEqual(['s1', 's2'])
        expect(service.excel.sheets.map(s => s.name()))
            .toEqual(['ws1', 's1', 's2' , 'ws2', 'ws3'])
    })
    it('move pos 2 to 4', (): void => {
        const action = new ActionBuilder().sheetName('ws2').position(4).build()
        handleAction(action, service)
        expect(service.book.sheets.map(s => s.name)).toEqual(['s1', 's2'])
        expect(service.excel.sheets.map(s => s.name()))
            .toEqual(['ws1', 's1', 's2', 'ws3', 'ws2'])
    })
})
