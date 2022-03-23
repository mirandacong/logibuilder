import {
    getSubnodes,
    isNode,
    isRow,
    isRowBlock,
    isTable,
    Node,
} from '@logi/src/lib/hierarchy/core'

export function canMoveVertically(
    nodes: readonly Readonly<Node>[],
    isUp: boolean,
): boolean {
    if (nodes.length < 1)
        return false
    const parent = nodes[0].parent
    if (nodes.find((r: Readonly<Node>): boolean => r.parent !== parent) !==
        undefined)
        return false
    if (!isNode(parent))
        return false
    let subNodes: readonly Readonly<Node>[] = []
    if (!isTable(parent))
        subNodes = getSubnodes(parent)
    else
        subNodes = isRow(nodes[0]) || isRowBlock(nodes[0])
            ? parent.rows
            : parent.cols
    const compare = isUp
        ? subNodes.slice(0, nodes.length)
        : subNodes.slice(subNodes.length - nodes.length)
    return !compare.every((n: Readonly<Node>): boolean => nodes.includes(n))
}
