import {
    ColumnBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {getChildIndex} from './lib'

describe('get child index test', (): void => {
    it('get child index', (): void => {
        const col1 = new ColumnBuilder().name('').build()
        const col2 = new ColumnBuilder().name('').build()
        const row1 = new RowBuilder().name('').build()
        const table = new TableBuilder()
            .name('')
            .subnodes([col1, row1, col2])
            .build()
        const sheet = new SheetBuilder().name('').tree([table]).build()

        expect(getChildIndex(sheet)).toBe(-1)
        expect(getChildIndex(table)).toBe(0)
        expect(getChildIndex(row1)).toBe(0)
        expect(getChildIndex(col1)).toBe(0)
        expect(getChildIndex(col2)).toBe(1)
    })
})
