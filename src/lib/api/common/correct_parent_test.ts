import {Writable} from '@logi/base/ts/common/mapped_types'
import {
    BookBuilder,
    Row,
    RowBuilder,
    Sheet,
    SheetBuilder,
    TableBuilder,
    UnsafeNode,
} from '@logi/src/lib/hierarchy/core'

import {correctParent} from './correct_parent'

describe('correct parent', (): void => {
    it('sheet test', (): void => {
        const book = new BookBuilder().name('book').build()
        // tslint:disable-next-line: no-type-assertion
        const sheet = new SheetBuilder().name('sheet').build() as Sheet
        // tslint:disable-next-line: no-type-assertion
        const writableBook = book.asUnsafe() as Writable<UnsafeNode>
        writableBook.subnodes = [sheet]
        correctParent(book)
        expect(sheet.parent).toBe(book)
    })
    it('row test', (): void => {
        // tslint:disable-next-line: no-type-assertion
        const row1 = new RowBuilder().name('row1').build() as Row
        // tslint:disable-next-line: no-type-assertion
        const row2 = new RowBuilder().name('row2').build() as Row
        // tslint:disable-next-line: no-type-assertion
        const row3 = new RowBuilder().name('row3').build() as Row
        const table = new TableBuilder().name('table').build()
        // tslint:disable-next-line: no-type-assertion
        const writableTable = table.asUnsafe() as Writable<UnsafeNode>
        writableTable.subnodes = [row1, row2, row3]
        correctParent(table)
        expect(row1.parent).toBe(table)
        expect(row2.parent).toBe(table)
        expect(row3.parent).toBe(table)
    })
})
