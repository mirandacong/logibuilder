import {
    RowBlockBuilder,
    RowBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {canChangeLevel} from './can_change_level'

describe('', (): void => {
    it('can not with empty', (): void => {
        expect(canChangeLevel([], true)).toBe(false)
    })
    it('can not with table', (): void => {
        const table = new TableBuilder().name('').build()
        expect(canChangeLevel([table], false)).toBe(false)
    })
    it('can not up', (): void => {
        const row = new RowBuilder().name('').build()
        const table = new TableBuilder().name('').subnodes([row]).build()
        expect(table).toBeDefined()
        expect(canChangeLevel([row], true)).toBe(false)
        new RowBlockBuilder().name('').tree([row]).build()
        expect(canChangeLevel([row], true)).toBe(false)
    })
    it('can not with different parents', (): void => {
        const row = new RowBuilder().name('').build()
        const table = new TableBuilder().name('').subnodes([row]).build()
        const row2 = new RowBuilder().name('').build()
        const table2 = new TableBuilder().name('').subnodes([row2]).build()
        expect(table).toBeDefined()
        expect(table2).toBeDefined()
        expect(canChangeLevel([row, row2], false)).toBe(false)
    })
    it('can up', (): void => {
        const row = new RowBuilder().name('').build()
        const row2 = new RowBuilder().name('').build()
        const rb = new RowBlockBuilder().name('').tree([row2, row]).build()
        new TableBuilder().name('').subnodes([rb]).build()
        expect(canChangeLevel([row, row2], true)).toBe(true)
    })
    it('can down', (): void => {
        const row = new RowBuilder().name('').build()
        const row2 = new RowBuilder().name('').build()
        const row3 = new RowBuilder().name('').build()
        const rb = new RowBlockBuilder()
            .name('')
            .tree([row, row2, row3])
            .build()
        expect(rb).toBeDefined()
        expect(canChangeLevel([row, row3], false)).toBe(true)
    })
})
