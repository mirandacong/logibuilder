// tslint:disable: no-magic-numbers
import {buildTestModel} from '@logi/src/lib/dsl/logi_test_data'

import {Node, NodeBuilder, NodeType} from './node'
import {Table} from './table'

describe('Node Test', (): void => {
    it('Basic properties test', (): void => {
        const node = new TestNodeBuilder()
            .name('name')
            .labels(['tag1', 'tag2'])
            .build()
        expect(node.name).toBe('name')
        expect(node.labels.length).toBe(2)
        expect(node.labels[0]).toBe('tag1')
        expect(node.labels[1]).toEqual('tag2')
        expect(node.getPath().toString()).toEqual('name')
        expect(node.uuid).not.toBe('')
    })
    it('Basic properties test', (): void => {
        const node = new TestNodeBuilder().name('name').uuid('id').build()
        expect(node.uuid).toBe('id')
    })
    it('Basic properties test', (): void => {
        const n1 = new TestNodeBuilder().name('name').build()
        const n2 = new TestNodeBuilder().name('name').build()
        expect(n1.uuid).not.toEqual(n2.uuid)
    })
    it('throw error test', (): void => {
        // tslint:disable-next-line: typedef
        expect(() => new TestNodeBuilder().build()).toThrow()
    })
})

describe('logi1 getPath test', (): void => {
    it('getPath test', (): void => {
        const book = buildTestModel().book
        expect(book.getPath().toString()).toBe('Test model')
        const sheet = book.sheets[0]
        expect(sheet.getPath().toString()).toBe('Control')
        const table = sheet.tree[1] as Table
        expect(table.getPath().toString()).toBe('Control!Revenue Breakup')
        const revenue = table.rows[0]
        expect(revenue.getPath().toString())
            .toBe('Control!Revenue Breakup!Revenue')
        const electronicProduct = table.rows[2]
        expect(electronicProduct.getPath().toString())
            .toBe('Control!Revenue Breakup!Electronic products')
        const iphone = table.getLeafRows()[3]
        expect(iphone.getPath().toString()).toBe('Control!Revenue Breakup!' +
            'Electronic products!iPhone')
        const q1 = table.getLeafCols()[0]
        expect(q1.getPath().toString()).toBe('Control!Revenue Breakup!2017!Q1')
    })
})

describe('getAncestor test', (): void => {
    it('getAncestor of f', (): void => {
        const book = buildTestModel().book
        const sheet = book.sheets[0]
        const table = sheet.tree[1] as Table
        const electronicProduct = table.rows[3]
        const iphone = table.getLeafRows()[3]
        expect(iphone.getAncestors())
            .toEqual([book, sheet, table, electronicProduct, iphone])
    })
})

export class TestNode extends Node {
    public nodetype = NodeType.BOOK

    public getSubnodes(): readonly Readonly<TestNode> [] {
        return this.subnodes as Readonly<TestNode>[]
    }
}

export class TestNodeBuilder extends NodeBuilder<TestNode, TestNode> {
    public constructor() {
        const impl = new TestNode()
        super(impl)
    }
    public type(type: NodeType): this {
        this.getImpl().nodetype = type

        return this
    }
}

/**
 *          a
 *         / \
 *        b   d
 *       /     \
 *      c       e
 *               \
 *                f
 */
export function buildTestGraph(): Readonly<TestNode> {
    const a = new TestNodeBuilder().name('a').type(NodeType.BOOK).build()
    const b = new TestNodeBuilder().name('b').type(NodeType.TABLE).build()
    const c = new TestNodeBuilder().name('c').type(NodeType.TABLE).build()
    const d = new TestNodeBuilder().name('d').type(NodeType.TABLE).build()
    const e = new TestNodeBuilder().name('e').type(NodeType.TABLE).build()
    const f = new TestNodeBuilder().name('f').type(NodeType.TABLE).build()
    a.insertSubnode(b)
    a.insertSubnode(d)
    b.insertSubnode(c)
    d.insertSubnode(e)
    e.insertSubnode(f)

    return a
}
