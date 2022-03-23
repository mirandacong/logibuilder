// tslint:disable:no-magic-numbers
import {NodeType} from './node'
import {isRowBlock, RowBlockBuilder} from './row_block'

describe('Block Test', (): void => {
    it('Basic properties test', (): void => {
        const b1 = new RowBlockBuilder().name('b1').build()
        const b2 = new RowBlockBuilder().name('b2').build()
        const b3 = new RowBlockBuilder().name('b3').tree([b1, b2]).build()
        expect(isRowBlock(b1)).toBe(true)
        expect(b3.name).toBe('b3')
        expect(b3.nodetype).toEqual(NodeType.ROW_BLOCK)
        expect(b3.tree.length).toBe(2)
    })
})
