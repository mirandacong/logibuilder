import {
    BookBuilder,
    Column,
    ColumnBuilder,
    Row,
    RowBlockBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {suggestFbName} from './fb_name'

describe('suggest fb name', (): void => {
    let row1: Readonly<Row>
    let col1: Readonly<Column>
    beforeEach((): void => {
        row1 = new RowBuilder().name('row1').build()
        const row2 = new RowBuilder().name('row2').build()
        const rb = new RowBlockBuilder()
            .name('rowblock1')
            .tree([row1, row2])
            .build()
        col1 = new ColumnBuilder().name('col1').build()
        const col2 = new ColumnBuilder().name('col2').build()
        const table = new TableBuilder().name('table1').build()
        table.insertSubnode(rb)
        table.insertSubnode(col1)
        table.insertSubnode(col2)
        const sheet = new SheetBuilder().name('sheet').tree([table]).build()
        new BookBuilder().name('book').sheets([sheet]).build()
    })
    it('row', (): void => {
        const result = suggestFbName(row1, 'row')
        // tslint:disable-next-line: no-magic-numbers
        expect(result.length).toBe(2)
        expect(result[0].content).toBe('rowblock1')
        expect(result[1].content).toBe('row2')
    })
    it('col', (): void => {
        const result = suggestFbName(col1, 'col')
        expect(result.length).toBe(1)
        expect(result[0].content).toBe('col2')
    })
})
