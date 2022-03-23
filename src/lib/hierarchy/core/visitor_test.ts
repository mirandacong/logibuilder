import {preOrderWalk} from '@logi/base/ts/common/walk_utils'

import {Book, BookBuilder} from './book'
import {ColumnBuilder} from './column'
import {Node, NodeType} from './node'
import {RowBuilder} from './row'
import {SheetBuilder} from './sheet'
import {TableBuilder} from './table'
import {getNodesVisitor} from './visitor'

// tslint:disable-next-line: max-func-body-length
describe('visitor test', (): void => {
    it('get formulabearers from book', (): void => {
        const expetedTypes: NodeType[] = [
            NodeType.COLUMN,
            NodeType.ROW,
        ]
        const book = mockBook()
        const nodes = preOrderWalk(book, getNodesVisitor, expetedTypes)
        // tslint:disable-next-line: no-magic-numbers
        expect(nodes.length).toEqual(2)
        nodes.forEach((node: Readonly<Node>): void => {
            expect(expetedTypes.includes(node.nodetype)).toBe(true)
        })
    })
    it('get tables from book', (): void => {
        const expetedTypes: number[] = [
            NodeType.TABLE,
        ]
        const book = mockBook()
        const nodes = preOrderWalk(book, getNodesVisitor, expetedTypes)
        // tslint:disable-next-line: no-magic-numbers
        expect(nodes.length).toEqual(3)
        nodes.forEach((n: Readonly<Node>): void => {
            expect(n.nodetype).toBe(NodeType.TABLE)
        })
    })
})

function mockBook(): Readonly<Book> {
    const col = new ColumnBuilder().name('col').build()
    const row = new RowBuilder().name('row').build()
    const table = new TableBuilder().name('table').subnodes([row, col]).build()
    const table1 = new TableBuilder().name('table1').build()
    const table2 = new TableBuilder().name('table2').build()
    const sheet = new SheetBuilder().name('sheet').tree([table, table1]).build()
    const sheet1 = new SheetBuilder().name('sheet1').tree([table2]).build()
    return new BookBuilder().name('book').sheets([sheet, sheet1]).build()
}
