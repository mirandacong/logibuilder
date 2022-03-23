import {
    isBook,
    isColumn,
    isColumnBlock,
    isFormulaBearer,
    isRow,
    isRowBlock,
    isSheet,
    isTable,
    isTitle,
    Node,
    NodeType,
} from '@logi/src/lib/hierarchy/core'

export function canPaste(
    base: Readonly<Node>,
    nodes: readonly Readonly<Node>[],
    slices: readonly string[],
): boolean {
    if (slices.length > 0 && isFormulaBearer(base))
        return true
    if (nodes.length === 0)
        return false
    const allowTypes = getAllowTypes(base)
    if (allowTypes.length === 0)
        return false
    return nodes.find((n: Readonly<Node>): boolean =>
        allowTypes.includes(n.nodetype)) !== undefined
}

function getAllowTypes(node: Readonly<Node>): readonly NodeType[] {
    if (isBook(node))
        return [NodeType.SHEET]
    if (isSheet(node) && node.parent !== null)
        return [NodeType.TABLE, NodeType.TITLE]
    if (isTitle(node))
        return [NodeType.TABLE, NodeType.TITLE]
    if (isTable(node)) {
        if (node.findParent(NodeType.BOOK) === undefined)
            return [NodeType.COLUMN, NodeType.COLUMN_BLOCK, NodeType.ROW,
                NodeType.ROW_BLOCK]
        return [NodeType.TABLE, NodeType.TITLE, NodeType.COLUMN,
            NodeType.COLUMN_BLOCK, NodeType.ROW, NodeType.ROW_BLOCK]
    }
    if (isRow(node) || isRowBlock(node)) {
        if (node.findParent(NodeType.BOOK) === undefined)
            return [NodeType.ROW, NodeType.ROW_BLOCK]
        return [NodeType.TABLE, NodeType.TITLE, NodeType.ROW,
            NodeType.ROW_BLOCK]
    }
    if (isColumn(node) || isColumnBlock(node)) {
        if (node.findParent(NodeType.BOOK) === undefined)
            return [NodeType.COLUMN, NodeType.COLUMN_BLOCK]
        return [NodeType.TABLE, NodeType.TITLE, NodeType.COLUMN,
            NodeType.COLUMN_BLOCK]
    }
    return []
}
