import {isNode, isRow, isRowBlock, Node} from '@logi/src/lib/hierarchy/core'
export function canChangeLevel(
    nodes: readonly Readonly<Node>[],
    isUp: boolean,
): boolean {
    if (nodes.length < 1)
        return false
    for (const n of nodes)
        if (!isRow(n) && !isRowBlock(n))
            return false
    const parent = nodes[0].parent
    if (!isNode(parent))
        return false
    if (isUp && (!isRowBlock(parent) || parent.parent === null))
        return false
    return nodes.find((r: Readonly<Node>): boolean => r.parent !== parent) ==
        undefined
}
