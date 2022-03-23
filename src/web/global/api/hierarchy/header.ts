import {isTable, Node, NodeType} from '@logi/src/lib/hierarchy/core'

export function haveStandarHeader(node: Readonly<Node>): boolean {
    if (isTable(node))
        return node.referenceHeader !== undefined
    const table = node.findParent(NodeType.TABLE)
    if (isTable(table))
        return table.referenceHeader !== undefined
    return false
}
