import {ColumnBuilder, isColumn} from './column'
import {NodeType} from './node'
import {SliceExprBuilder} from './slice_expr'

describe('Row Test', (): void => {
    it('Basic properties test', (): void => {
        const expr1 = new SliceExprBuilder().name('hist').expression('').build()
        const expr2 = new SliceExprBuilder().name('proj').expression('').build()
        const col = new ColumnBuilder()
            .name('current_profit')
            .sliceExprs([expr1, expr2])
            .build()
        expect(isColumn(col)).toBe(true)
        expect(col.name).toBe('current_profit')
        expect(col.nodetype).toEqual(NodeType.COLUMN)
        // tslint:disable-next-line: no-magic-numbers
        expect(col.sliceExprs.length).toBe(2)
    })
})
