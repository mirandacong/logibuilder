import {RowBuilder, SliceExprBuilder} from '@logi/src/lib/hierarchy/core'

import {setSliceName} from './set_slice_name'

describe('set slice name handler test', (): void => {
    it('row', (): void => {
        const slice = new SliceExprBuilder()
            .name('hist')
            .expression('expression')
            .build()
        const row = new RowBuilder().name('row').sliceExprs([slice]).build()
        setSliceName(row, 0, 'proj')
        expect(row.sliceExprs.length).toBe(1)
        expect(row.sliceExprs[0].name).toBe('proj')
    })
})
