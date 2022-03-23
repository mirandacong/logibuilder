import {NodeType} from './node'
import {isRow, Row, RowBuilder} from './row'
import {SliceExprBuilder, Type} from './slice_expr'

describe('Row Test', (): void => {
    it('Basic properties test', (): void => {
        const expr1 = new SliceExprBuilder().name('hist').expression('').build()
        const expr2 = new SliceExprBuilder().name('proj').expression('').build()
        const row: Readonly<Row > = new RowBuilder()
            .name('current_profit')
            .sliceExprs([expr1, expr2])
            .build()
        expect(isRow(row)).toBe(true)
        expect(row.name).toBe('current_profit')
        expect(row.nodetype).toEqual(NodeType.ROW)
        expect(row.type).toBe(Type.FX)
        // tslint:disable-next-line: no-magic-numbers
        expect(row.sliceExprs.length).toBe(2)
        const row2: Readonly<Row > = new RowBuilder()
            .name('row2')
            .type(Type.FACT)
            .build()
        expect(row2.type).toBe(Type.FACT)
    })
    it('getPath test', () => {
        const row = new RowBuilder().name('row').alias('row alias').build()
        const path = row.getPath()
        expect(path.toString()).toBe('row@row alias')
    })
    it('invalid if is separator', (): void => {
        const row = new RowBuilder().name('r').separator(true).build()
        expect(row.valid).toBe(false)
    })
})
