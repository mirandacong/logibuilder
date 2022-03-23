import {
    Column,
    ColumnBlockBuilder,
    ColumnBuilder,
    Row,
    RowBuilder,
    SliceExprBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {suggestSliceNames} from './suggest_slice_names'

describe('suggest slice name', (): void => {
    let row: Readonly<Row>
    let col: Readonly<Column>
    beforeEach((): void => {
        row = new RowBuilder()
            .name('row1')
            .sliceExprs([
                new SliceExprBuilder().name('col1').build(),
                new SliceExprBuilder().name('l1').build(),
            ])
            .build()
        col = new ColumnBuilder().name('col1').labels(['l1', 'l2']).build()
        const cb = new ColumnBlockBuilder().name('cb').tree([col]).build()
        new TableBuilder().name('t').subnodes([row, cb]).build()
    })
    it('suggest row slice', (): void => {
        const res = suggestSliceNames(row, 'l1')
        expect(res).toEqual(['l1', 'l2', 'cb'])
    })
    it('suggest col slice', (): void => {
        const res = suggestSliceNames(col, '')
        expect(res).toEqual(['row1'])
    })
})
