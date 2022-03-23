import {
    postOrderWalk,
    postOrderWalk2,
    preOrderWalk,
    preOrderWalk2,
} from './impl'

// tslint:disable-next-line: max-func-body-length
describe('Walk Test', () => {
    it('Pre order walk test', () => {
        const graph = buildTestGraph()
        const order1 = preOrderWalk<TestNode, string>(graph, preOrderVisitor)
        expect(order1).toEqual(['1', '2', '4', '3', '5', '6', '7'])
        const order2 = preOrderWalk2<TestNode, string>(graph, preOrderVisitor)
        expect(order2).toEqual(['1', '3', '5', '7', '6', '2', '4'])
    })
    it('Post order walk test', () => {
        const graph = buildTestGraph()
        const order1 = postOrderWalk<TestNode, string>(
            graph, postOrderVisitor, getSubNodes)
        expect(order1).toEqual(['4', '2', '6', '7', '5', '3', '1'])
        const order2 = postOrderWalk2<TestNode, string>(
            graph, postOrderVisitor, getSubNodes)
        expect(order2).toEqual(['7', '6', '5', '3', '4', '2', '1'])
    })
})

function preOrderVisitor(
    node: TestNode,
): readonly [readonly string[], readonly TestNode[]] {
    return [[node.name], node.children]
}

function getSubNodes(node: TestNode): readonly TestNode[] {
    return node.children
}

function postOrderVisitor(node: TestNode): readonly string[] {
    return [node.name]
}

class TestNode {
    public constructor(
        public readonly name: string,
        public readonly children: readonly TestNode[] = []) {}
}

/**
 * Build a test graph like following
 *           1
 *          / \
 *         2   3
 *        /     \
 *       4       5
 *              / \
 *             6   7
 */
function buildTestGraph(): TestNode {
    const n6 = new TestNode('6')
    const n7 = new TestNode('7')
    const n4 = new TestNode('4')
    const n2 = new TestNode('2', [n4])
    const n5 = new TestNode('5', [n6, n7])
    const n3 = new TestNode('3', [n5])

    return new TestNode('1', [n2, n3])
}
