import {ColumnBuilder, RowBuilder} from '@logi/src/lib/hierarchy/core'

import {canEditLabel} from './can_edit_label'

describe('can edit label', (): void => {
    it('empty', (): void => {
        expect(canEditLabel([])).toBe(false)
    })
    it('can', (): void => {
        const col = new ColumnBuilder().name('').build()
        const col2 = new ColumnBuilder().name('').build()
        expect(canEditLabel([col, col2])).toBe(true)
    })
    it('can not', (): void => {
        const row = new RowBuilder().name('').build()
        const col = new ColumnBuilder().name('').build()
        expect(canEditLabel([row, col])).toBe(false)
    })
})
