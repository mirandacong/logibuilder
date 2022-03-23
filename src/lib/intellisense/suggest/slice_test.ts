import {
    Column,
    ColumnBuilder,
    Row,
    RowBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {Target} from '@logi/src/lib/intellisense/algo'

import {suggestSlice} from './slice'

describe('suggest slice name', (): void => {
    let row1: Readonly<Row>
    let row2: Readonly<Row>
    let col1: Readonly<Column>
    let col2: Readonly<Column>
    beforeEach((): void => {
        row1 = new RowBuilder().name('row1').labels(['l1', 'l2']).build()
        row2 = new RowBuilder().name('row2').labels(['l3']).build()
        col1 = new ColumnBuilder().name('col1').labels(['l4']).build()
        col2 = new ColumnBuilder().name('col2').labels(['l5', 'l6']).build()
        new TableBuilder()
            .name('table')
            .subnodes([row1, row2, col1, col2])
            .build()
    })
    it('row', (): void => {
        const candidates = suggestSlice(row1, 'l')
        const output = candidates.map((c: Target): string => c.content)
        expect(output).toEqual(['l4', 'l5', 'l6'])
    })
    it('col', (): void => {
        const candidates = suggestSlice(col1, 'l')
        const output = candidates.map((c: Target): string => c.content)
        expect(output).toEqual(['l1', 'l2', 'l3'])
    })
})
