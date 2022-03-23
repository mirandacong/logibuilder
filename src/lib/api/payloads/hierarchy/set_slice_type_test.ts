import {RowBuilder, SliceExprBuilder, Type} from '@logi/src/lib/hierarchy/core'

import {setSliceType} from './set_slice_type'

describe('set slice expr handler', (): void => {
    it('test', (): void => {
        const slice1 = new SliceExprBuilder()
            .name('slice1')
            .expression('expression1')
            .type(Type.ASSUMPTION)
            .build()
        const slice2 = new SliceExprBuilder()
            .name('slice2')
            .expression('expression2')
            .type(Type.FACT)
            .build()
        const node = new RowBuilder()
            .name('row')
            .sliceExprs([slice1, slice2])
            .build()
        setSliceType(node, 1, Type.CONSTRAINT)
        expect(node.sliceExprs[1].name).toBe('slice2')
        expect(node.sliceExprs[0].type).toBe(Type.ASSUMPTION)
        expect(node.sliceExprs[1].type).toBe(Type.CONSTRAINT)
    })
})
