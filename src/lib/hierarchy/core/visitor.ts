import {isBook} from './book'
import {isColumnBlock} from './column_block'
import {Node, NodeType} from './node'
import {isRowBlock} from './row_block'
import {isSheet} from './sheet'
import {isTable} from './table'
import {isTitle} from './title'

/**
 * Get row, column and selection from the given node
 */
// tslint:disable-next-line:max-func-body-length
export function getNodesVisitor(
    node: Readonly<Node>,
    expectTypes: readonly number[],
): readonly [readonly Readonly<Node>[], readonly Readonly<Node>[]] {
    const expectNodes: Readonly<Node>[] = []
    if (expectTypes.includes(node.nodetype))
        expectNodes.push(node)
    const subs: Readonly<Node>[] = []
    if (isBook(node))
        subs.push(...node.sheets)
    else if (isSheet(node))
        subs.push(...node.tree)
    else if (isTitle(node))
        subs.push(...node.tree)
    else if (isTable(node))
        subs.push(...node.rows, ...node.cols)
    else if (isRowBlock(node))
        subs.push(...node.tree)
    else if (isColumnBlock(node))
        subs.push(...node.tree)
    else
        return [expectNodes, []]
    const next = expectTypes.some((type: number): boolean =>
        compareLevel(type, node.nodetype))
    if (next)
        return [expectNodes, subs]
    return [expectNodes, []]
}

export function getSubnodes(node: Readonly<Node>): readonly Readonly<Node>[] {
    const children: Readonly<Node>[] = []
    if (isBook(node))
        children.push(...node.sheets)
    else if (isSheet(node) || isTitle(node) || isRowBlock(node)
        || isColumnBlock(node))
        children.push(...node.tree)
    else if (isTable(node))
        children.push(...node.rows, ...node.cols)
    return children
}

export const ALL_TYPES = [
    NodeType.BOOK,
    NodeType.SHEET,
    NodeType.TITLE,
    NodeType.TABLE,
    NodeType.ROW_BLOCK,
    NodeType.COLUMN_BLOCK,
    NodeType.ROW,
    NodeType.COLUMN,
] as const
// tslint:disable:no-magic-numbers
export const LEVEL: readonly (readonly [NodeType, number])[] = [
    [NodeType.BOOK, 0],
    [NodeType.SHEET, 1],
    [NodeType.TITLE, 2],
    [NodeType.TABLE, 3],
    [NodeType.ROW_BLOCK, 5],
    [NodeType.COLUMN_BLOCK, 5],
    [NodeType.ROW, 6],
    [NodeType.COLUMN, 6],
]
// tslint:enable:no-magic-numbers

/**
 * Compare level between type1 and type2.
 *
 * If t1 greater than t2, return true, otherwise return false.
 */
function compareLevel(t1: NodeType, t2: NodeType): boolean {
    const map = new Map<NodeType, number>()
    LEVEL.forEach((tuple: readonly [NodeType, number]): void => {
        map.set(tuple[0], tuple[1])
    })
    /**
     * Safe to use type assertion below, because the map `LEVEL` has defined
     * all types of hierarchy node, it will not be undefined.
     */
    // tslint:disable-next-line: no-type-assertion
    const level1 = map.get(t1) as NodeType
    // tslint:disable-next-line: no-type-assertion
    const level2 = map.get(t2) as NodeType
    return level1 >= level2
}
