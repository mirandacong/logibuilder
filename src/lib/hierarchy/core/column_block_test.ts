import {ColumnBlockBuilder, isColumnBlock} from './column_block'
import {NodeType} from './node'

describe('Block Test', (): void => {
    it('Basic properties test', (): void => {
        const b1 = new ColumnBlockBuilder().name('b1').build()
        const b2 = new ColumnBlockBuilder().name('b2').build()
        const b3 = new ColumnBlockBuilder().name('b3').tree([b1, b2]).build()
        expect(isColumnBlock(b1)).toBe(true)
        expect(b3.name).toBe('b3')
        expect(b3.nodetype).toEqual(NodeType.COLUMN_BLOCK)
        // tslint:disable-next-line:no-magic-numbers
        expect(b3.tree.length).toBe(2)
    })
})
