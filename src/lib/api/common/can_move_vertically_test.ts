import {RowBuilder, TableBuilder} from '@logi/src/lib/hierarchy/core'

import {canMoveVertically} from './can_move_vertically'

describe('can move up down', (): void => {
    it('can not with different parent', (): void => {
        const row = new RowBuilder().name('').build()
        const row2 = new RowBuilder().name('').build()
        const table = new TableBuilder().name('').subnodes([row]).build()
        const table2 = new TableBuilder().name('').subnodes([row2]).build()
        expect(table).toBeDefined()
        expect(table2).toBeDefined()
        expect(canMoveVertically([row, row2], true)).toBe(false)
    })
    it('can not up down', (): void => {
        const row = new RowBuilder().name('').build()
        const row2 = new RowBuilder().name('').build()
        const row3 = new RowBuilder().name('').build()
        const table = new TableBuilder()
            .name('')
            .subnodes([row, row2, row3])
            .build()
        expect(table).toBeDefined()
        expect(canMoveVertically([row, row2], true)).toBe(false)
        expect(canMoveVertically([row3, row2], false)).toBe(false)
    })
    it('can not up', (): void => {
        const row = new RowBuilder().name('').build()
        const row2 = new RowBuilder().name('').build()
        const row3 = new RowBuilder().name('').build()
        const table = new TableBuilder()
            .name('')
            .subnodes([row, row2, row3])
            .build()
        expect(table).toBeDefined()
        expect(canMoveVertically([row2], true)).toBe(true)
        expect(canMoveVertically([row2], false)).toBe(true)
    })
})
