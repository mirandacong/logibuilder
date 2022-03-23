// tslint:disable: no-magic-numbers
import {RowBuilder, SliceExprBuilder, Type} from '@logi/src/lib/hierarchy/core'

import {addSlice} from './add_slice'

// tslint:disable-next-line: max-func-body-length
describe('add slice payload handler', (): void => {
    it('row', (): void => {
        const row1 = new RowBuilder()
            .name('row')
            .type(Type.ASSUMPTION)
            .expression('1')
            .build()
        const newSlice = new SliceExprBuilder().name('').build()
        addSlice(row1, newSlice, 0)
        expect(row1.sliceExprs.length).toBe(1)
    })
})
