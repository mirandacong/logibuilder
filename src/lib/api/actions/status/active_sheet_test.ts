import {EditorServiceBuilder, handleAction} from '@logi/src/lib/api'
import {BookBuilder, SheetBuilder} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './active_sheet'

describe('set active sheet', (): void => {
    it('test', (): void => {
        const sheet = new SheetBuilder().name('sheet sheet sheet').build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const service = new EditorServiceBuilder().book(book).build()
        const action = new ActionBuilder().activeSheet(sheet.name).build()
        handleAction(action, service)
        const activeSheet = service.getActiveSheet()
        expect(activeSheet).toBe(sheet.name)
    })
})
