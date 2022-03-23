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

import {ActionBuilder} from './remove_sheet'

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
    it('remove pos 0', (): void => {
        const action = new ActionBuilder().name('ws1').build()
        handleAction(action, service)
        expect(service.book.sheets.map(s => s.name)).toEqual(['s1', 's2'])
        expect(service.excel.sheets.map(s => s.name()))
            .toEqual(['s1', 'ws2', 's2', 'ws3'])
    })
    it('remove pos 1', (): void => {
        const action = new ActionBuilder().name('s1').build()
        handleAction(action, service)
        expect(service.book.sheets.map(s => s.name)).toEqual(['s2'])
        expect(service.excel.sheets.map(s => s.name()))
            .toEqual(['ws1', 'ws2', 's2', 'ws3'])
    })
    it('remove pos 2', (): void => {
        const action = new ActionBuilder().name('ws2').build()
        handleAction(action, service)
        expect(service.book.sheets.map(s => s.name)).toEqual(['s1', 's2'])
        expect(service.excel.sheets.map(s => s.name()))
            .toEqual(['ws1', 's1', 's2', 'ws3'])
    })
    it('remove pos 3', (): void => {
        const action = new ActionBuilder().name('s2').build()
        handleAction(action, service)
        expect(service.book.sheets.map(s => s.name)).toEqual(['s1'])
        expect(service.excel.sheets.map(s => s.name()))
            .toEqual(['ws1', 's1', 'ws2', 'ws3'])
    })
    it('remove pos 4', (): void => {
        const action = new ActionBuilder().name('ws3').build()
        handleAction(action, service)
        expect(service.book.sheets.map(s => s.name)).toEqual(['s1', 's2'])
        expect(service.excel.sheets.map(s => s.name()))
            .toEqual(['ws1', 's1', 'ws2', 's2'])
    })
})
