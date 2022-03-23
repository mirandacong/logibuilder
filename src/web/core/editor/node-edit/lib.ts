import {
    FormulaBearer,
    isBook,
    isColumn,
    isColumnBlock,
    isRow,
    isRowBlock,
    isSheet,
    isTable,
    isTitle,
    Node,
} from '@logi/src/lib/hierarchy/core'

export function hasSlice(node: Readonly<FormulaBearer>): boolean {
    return node.sliceExprs.length > 0
}

// tslint:disable-next-line: cyclomatic-complexity
export function getInsertPosition(selectedNode: Readonly<Node>): number {
    const parent = selectedNode.parent
    if (isRow(selectedNode) || isRowBlock(selectedNode)) {
        if (isRowBlock(parent))
            return parent.tree.indexOf(selectedNode) + 1
        if (isTable(parent))
            return parent.rows.indexOf(selectedNode) + 1
        return -1
    }
    if (isColumn(selectedNode) || isColumnBlock(selectedNode)) {
        if (isColumnBlock(parent))
            return parent.tree.indexOf(selectedNode) + 1
        if (isTable(parent))
            return parent.cols.indexOf(selectedNode) + 1
        return -1
    }
    if (isTable(selectedNode) || isTitle(selectedNode)) {
        if (isSheet(parent))
            return parent.tree.indexOf(selectedNode) + 1
        return -1
    }
    if (isSheet(selectedNode)) {
        if (isBook(parent))
            return parent.sheets.indexOf(selectedNode)
        return -1
    }
    return -1
}
