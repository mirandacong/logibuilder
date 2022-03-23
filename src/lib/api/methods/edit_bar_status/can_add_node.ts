import {
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

export function canAddRow(node: Readonly<Node>): boolean {
    return isTable(node) || isRow(node) || isRowBlock(node)
}

export function canAddCol(node: Readonly<Node>): boolean {
    if (!(isTable(node) || isColumn(node) || isColumnBlock(node)))
        return false
    const t = node.findParent(NodeType.TABLE)
    return isTable(t) && t.referenceHeader === undefined
}

export function canAddRowBlock(node: Readonly<Node>): boolean {
    return isTable(node) || isRow(node) || isRowBlock(node)
}

export function canAddColBlock(node: Readonly<Node>): boolean {
    if (!(isTable(node) || isColumn(node) || isColumnBlock(node)))
        return false
    const t = node.findParent(NodeType.TABLE)
    return isTable(t) && t.referenceHeader === undefined
}

export function canAddTable(node: Readonly<Node>): boolean {
    if (node.findParent(NodeType.BOOK) === undefined)
        return false
    return isTable(node) || isTitle(node) || isSheet(node) ||
        isFormulaBearer(node) || isColumnBlock(node) || isRowBlock(node)
}

export function canAddTitle(node: Readonly<Node>): boolean {
    if (node.findParent(NodeType.BOOK) === undefined)
        return false
    return isTable(node) || isTitle(node) || isSheet(node)
}
