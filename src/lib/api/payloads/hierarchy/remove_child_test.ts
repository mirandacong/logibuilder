import {BookBuilder, SheetBuilder} from '@logi/src/lib/hierarchy/core'

import {removeChild} from './remove_child'

describe('remove child payload test', (): void => {
    it('book remove subnodes', (): void => {
        const book = new BookBuilder().name('book').build()
        const sheet1 = new SheetBuilder().name('sheet1').build()
        const sheet2 = new SheetBuilder().name('sheet2').build()
        book.insertSubnode(sheet1)
        book.insertSubnode(sheet2)
        // tslint:disable-next-line: no-magic-numbers
        expect(book.sheets.length).toBe(2)
        removeChild(book, sheet1.uuid)
        expect(book.sheets.length).toBe(1)
        expect(book.sheets[0]).toBe(sheet2)
    })
})
