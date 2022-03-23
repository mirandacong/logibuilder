import {RowBuilder, SliceExprBuilder} from '@logi/src/lib/hierarchy/core'

import {setSliceExpr} from './set_slice_expr'

describe('set slice expr handler', (): void => {
    it('test', (): void => {
        const slice1 = new SliceExprBuilder()
            .name('slice1')
            .expression('expression1')
            .build()
        const slice2 = new SliceExprBuilder()
            .name('slice2')
            .expression('expression2')
            .build()
        const node = new RowBuilder()
            .name('row')
            .sliceExprs([slice1, slice2])
            .build()
        setSliceExpr(node, 1, 'new expr')
        expect(node.sliceExprs[1].name).toBe('slice2')
        expect(node.sliceExprs[1].expression).toBe('new expr')
    })
})
