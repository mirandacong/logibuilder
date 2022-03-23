import {
    Row,
    RowBuilder,
    SliceExpr,
    SliceExprBuilder,
} from '@logi/src/lib/hierarchy/core'

import {canMoveSlicesVertically} from './can_move_slices_vertically'

describe('test can move slice vertically', (): void => {
    let slice1: SliceExpr
    let slice2: SliceExpr
    let slice3: SliceExpr
    let row: Readonly<Row>
    beforeEach((): void => {
        slice1 = new SliceExprBuilder().name('').build()
        slice2 = new SliceExprBuilder().name('').build()
        slice3 = new SliceExprBuilder().name('').build()
        row = new RowBuilder()
            .name('')
            .sliceExprs([slice1, slice2, slice3])
            .build()
    })
    it('can up', (): void => {
        expect(canMoveSlicesVertically(row, [slice1, slice3], true)).toBe(true)
    })
    it('can not up', (): void => {
        expect(canMoveSlicesVertically(row, [slice2, slice1], true)).toBe(false)
    })
    it('can down', (): void => {
        expect(canMoveSlicesVertically(row, [slice3, slice1], false)).toBe(true)
    })
    it('can not down', (): void => {
        expect(canMoveSlicesVertically(row, [slice2, slice3], false))
            .toBe(false)
    })
})
