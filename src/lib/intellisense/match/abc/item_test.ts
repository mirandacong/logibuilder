import {
    ColumnBuilder,
    RowBlockBuilder,
    RowBuilder,
    Table,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {getDataItems, getTableItems} from './item'

describe('build match items', (): void => {
    it('data', (): void => {
        const data1 = [
            ['', 'Y2017', 'Y2018'],
            ['Sales', '1.0', '2.0'],
        ]
        const items = getDataItems(data1)
        // tslint:disable-next-line: no-magic-numbers
        expect(items.length).toBe(2)
        expect(items[0].row).toBe('Sales')
        expect(items[0].col).toBe('Y2017')
        expect(items[1].row).toBe('Sales')
        expect(items[1].col).toBe('Y2018')
    })
    it('table', (): void => {
        const table = buildTable()
        const items = getTableItems(table)
        // tslint:disable-next-line: no-magic-numbers
        expect(items.length).toBe(4)
        expect(items[0].rowBlock).toEqual(['rb'])
        expect(items[1].rowBlock).toEqual(['rb'])
        // tslint:disable-next-line: no-magic-numbers
        expect(items[2].rowBlock).toEqual(['rb'])
        // tslint:disable-next-line: no-magic-numbers
        expect(items[3].rowBlock).toEqual(['rb'])
    })
})

function buildTable(): Readonly<Table> {
    const row1 = new RowBuilder().name('row1').build()
    const row2 = new RowBuilder().name('row2').build()
    const rb = new RowBlockBuilder().name('rb').build()
    rb.insertSubnode(row1)
    rb.insertSubnode(row2)
    const col1 = new ColumnBuilder().name('col1').build()
    const col2 = new ColumnBuilder().name('col2').build()
    return new TableBuilder().name('table').subnodes([rb, col1, col2]).build()
}
