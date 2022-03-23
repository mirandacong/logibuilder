import {Op, OP_REGISTRY} from '@logi/src/lib/compute/op'
import {Type} from '@logi/src/lib/hierarchy/core'

import {CastFromBuilder, CellExprBuilder} from './cell_expr'

describe('Build cell Test', (): void => {
    it('Build cell test', (): void => {
        // tslint:disable-next-line: ter-max-len
        // tslint:disable-next-line: no-type-assertion no-backbone-get-set-outside-model
        const op = OP_REGISTRY.get('add') as Op
        const priority = 10
        const castFrom = new CastFromBuilder()
            .formulaBearer('fbid')
            .sliceName('slice')
            .build()
        const cellExpr = new CellExprBuilder()
            .op(op)
            .priority(priority)
            .castFrom(castFrom)
            .type(Type.ASSUMPTION)
            .inNodes([['row_id', 'col_id']])
            .build()
        expect(cellExpr.castFrom).toEqual(castFrom)
        expect(cellExpr.inNodes.length).toBe(1)
        expect(cellExpr.type).toBe(Type.ASSUMPTION)
    })
})
