import {
    ColumnBlockBuilder,
    ColumnBuilder,
    RowBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {addChild} from './add_child'

describe('add child payload handler', (): void => {
    it('column block', (): void => {
        const node = new ColumnBlockBuilder().name('colBlock').build()
        const child = new ColumnBuilder().name('child').build()
        expect(node.tree.length).toBe(0)
        addChild(node, child)
        expect(node.tree.length).toBe(1)
        expect(node.tree[0].name).toBe('child')
        const child2 = new ColumnBlockBuilder().name('child2').build()
        addChild(node, child2, 0)
        // tslint:disable-next-line: no-magic-numbers
        expect(node.tree.length).toBe(2)
        expect(node.tree[0].name).toBe('child2')
    })
    it('add row to table', (): void => {
        const row = new RowBuilder().name('row').build()
        const col = new ColumnBuilder().name('col').build()
        const table = new TableBuilder()
            .name('table')
            .subnodes([col, row])
            .build()
        const row2 = new RowBuilder().name('row2').build()
        const table2 = new TableBuilder()
            .name('table2')
            .subnodes([row2])
            .build()
        addChild(table, row2, 0)
        expect(table.rows[0]).toBe(row2)
        // tslint:disable-next-line: no-magic-numbers
        expect(table.rows.length).toBe(2)
        expect(table2.rows[0]).toBe(row2)
        expect(table2.rows.length).toBe(1)
    })
})
