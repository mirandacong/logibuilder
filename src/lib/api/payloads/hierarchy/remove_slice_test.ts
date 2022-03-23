import {RowBuilder, SliceExprBuilder, Type} from '@logi/src/lib/hierarchy/core'

import {removeSlice} from './remove_slice'

describe('remove slice payload handler', (): void => {
    it('row', (): void => {
        const slice = new SliceExprBuilder()
            .name('hist')
            .expression('expr1')
            .type(Type.ASSUMPTION)
            .build()
        const row = new RowBuilder().name('row').sliceExprs([slice]).build()
        removeSlice(row, 0)
        expect(row.sliceExprs.length).toBe(0)
    })
})
