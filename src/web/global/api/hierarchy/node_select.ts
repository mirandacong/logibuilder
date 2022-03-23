import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {
    Column,
    ColumnBlock,
    getNodesVisitor,
    getSubnodes,
    isColumn,
    isColumnBlock,
    isNode,
    isRow,
    isRowBlock,
    isSheet,
    isTable,
    isTitle,
    Node,
    NodeType,
    Row,
    RowBlock,
    Table,
} from '@logi/src/lib/hierarchy/core'
import {getSca} from '@logi/src/lib/visualizer'

/**
 * Get previous node of current node. (In pre-order)
 */
// tslint:disable-next-line: max-func-body-length
export function getPrevNodeInPreOrder(
    node: Readonly<Node>,
): Readonly<Node> | undefined {
    if (isTableOrTitle(node)) {
        const sheet = node.parent
        if (!isSheet(sheet))
            return
        const subnodes: readonly Readonly<Node>[] = sheet.tree
        const index = subnodes.indexOf(node)
        if (index < 1)
            return
        const prevSibling = subnodes[index - 1]
        if (isTitle(prevSibling))
            return prevSibling
        if (isTable(prevSibling)) {
            const rows = prevSibling.getLeafRows()
            return rows[rows.length - 1]
        }
        return
    }

    if (isTableSubnode(node)) {
        const table = node.findParent(NodeType.TABLE)
        if (!isTable(table))
            return
        const flatNodes = getFlatSubnodes(table, node)
        const index = flatNodes.indexOf(node)
        if (index === 0)
            return table
        if (index === -1)
            return
        return flatNodes[index - 1]
    }
    return
}

/**
 * Get next node of current node. (In pre-order)
 */
export function getNextNodeInPreOreder(
    node: Readonly<Node>,
): Readonly<Node> | undefined {
    if (isTableOrTitle(node)) {
        const sheet = node.parent
        if (!isSheet(sheet))
            return
        const subnodes: readonly Readonly<Node>[] = sheet.tree
        const index = subnodes.indexOf(node)
        if (index === -1)
            return
        if (isTable(node)) {
            const flatNodes = preOrderWalk(
                node,
                getNodesVisitor,
                [NodeType.ROW, NodeType.ROW_BLOCK],
            )
            return flatNodes[0]
        }
        if (index === subnodes.length - 1)
            return
        return subnodes[index + 1]
    }

    if (isTableSubnode(node)) {
        const table = node.findParent(NodeType.TABLE)
        if (!isTable(table))
            return
        const flatNodes = getFlatSubnodes(table, node)
        const index = flatNodes.indexOf(node)
        if (index === -1)
            return
        if (index === flatNodes.length - 1) {
            const sheet = table.findParent(NodeType.SHEET)
            if (!isSheet(sheet))
                return
            const tableIndex = sheet.tree.indexOf(table)
            if (tableIndex === -1 || tableIndex === sheet.tree.length - 1)
                return
            return sheet.tree[tableIndex + 1]
        }
        return flatNodes[index + 1]
    }
    return
}

export function getPrevNode(node: Readonly<Node>): Readonly<Node> | undefined {
    const parent = node.parent
    if (!isNode(parent))
        return
    if (isRowBlock(parent) || isColumnBlock(parent))
        return getPrevNodeInNodes(parent, parent.tree, node)
    if (isTable(parent)) {
        if (isRow(node) || isRowBlock(node))
            return getPrevNodeInNodes(parent, parent.rows, node)
        if (isColumn(node) || isColumnBlock(node))
            return getPrevNodeInNodes(parent, parent.cols, node)
        return
    }
    const subnodes = getSubnodes(parent)
    return getPrevNodeInNodes(parent, subnodes, node)
}

function getPrevNodeInNodes(
    parent: Readonly<Node>,
    subnodes: readonly Readonly<Node>[],
    currentNode: Readonly<Node>,
): Readonly<Node> | undefined {
    const index = subnodes.indexOf(currentNode)
    if (index === -1)
        return
    return index === 0 ? parent : subnodes[index - 1]
}

export function getNextNode(node: Readonly<Node>): Readonly<Node> | undefined {
    const parent = node.parent
    if (!isNode(parent))
        return
    if (isRowBlock(parent) || isColumnBlock(parent))
        return getNextNodeInNodes(parent, parent.tree, node)
    if (isTable(parent)) {
        if (isRow(node) || isRowBlock(node))
            return getNextNodeInNodes(parent, parent.rows, node)
        if (isColumn(node) || isColumnBlock(node))
            return getNextNodeInNodes(parent, parent.cols, node)
        return
    }
    const subnodes = getSubnodes(parent)
    return getNextNodeInNodes(parent, subnodes, node)
}

function getNextNodeInNodes(
    parent: Readonly<Node>,
    subnodes: readonly Readonly<Node>[],
    currentNode: Readonly<Node>,
): Readonly<Node> | undefined {
    const index = subnodes.indexOf(currentNode)
    if (index === -1)
        return
    return index === subnodes.length - 1 ? parent : subnodes[index + 1]
}

/**
 * Get all rows/cols between current node and target node.
 *
 * sca -- A -- A1
 *          -- A2
 *     -- B
 *     -- C
 *          -- C1
 *          -- C2
 *
 * current: C1  target: A2  return [A,B,C]
 * current: C1  target: B  return [B,C]
 * current: C2  target: C  return [C]
 */
// tslint:disable-next-line: cyclomatic-complexity
export function getAllNodesBetween(
    current: Readonly<Node>,
    target: Readonly<Node>,
): readonly Readonly<Node>[] {
    if (
        isTableOrTitle(current) &&
        isTableOrTitle(target) &&
        current.parent === target.parent
    ) {
        const parent = current.parent
        if (!isSheet(parent))
            return []
        return getNodeRange(parent.tree, current, target)
    }

    if (isTableSubnode(current) && isTableSubnode(target)) {
        const currentTable = current.findParent(NodeType.TABLE)
        const targeTable = target.findParent(NodeType.TABLE)
        /**
         * Do not support continious select row/col between different table.
         */
        if (currentTable !== targeTable)
            return []
        const sca = getSca(current, target)
        if (isColumnNode(current) && isColumnNode(target)) {
            if (isTable(sca))
                return getNodeRange(sca.cols, current, target)
            if (isColumnBlock(sca))
                return getNodeRange(sca.tree, current, target)
            return []
        }
        if (isRowNode(current) && isRowNode(target)) {
            if (isTable(sca))
                return getNodeRange(sca.rows, current, target)
            if (isRowBlock(sca))
                return getNodeRange(sca.tree, current, target)
            return []
        }
        return []
    }
    return []
}

function getNodeRange(
    nodes: readonly Readonly<Node>[],
    start: Readonly<Node>,
    end: Readonly<Node>,
): readonly Readonly<Node>[] {
    let startIndex = -1
    let endIndex = -1
    nodes.forEach((node: Readonly<Node>, index: number): void => {
        if (start.getAncestors().includes(node))
            startIndex = index
        if (end.getAncestors().includes(node))
            endIndex = index
    })

    if (startIndex === -1 || endIndex === -1)
        return []
    const indexRange = [startIndex, endIndex]
        .sort((a: number, b: number): number => a - b)
    return nodes.slice(indexRange[0], indexRange[1] + 1)
}

type TableSubnodeType = Readonly<Row> | Readonly<RowBlock> | Readonly<Column> |
    Readonly<ColumnBlock>

export function isColumnNode(node: Readonly<Node>): boolean {
    return isColumn(node) || isColumnBlock(node)
}

export function isRowNode(node: Readonly<Node>): boolean {
    return isRow(node) || isRowBlock(node)
}

// tslint:disable-next-line: unknown-paramenter-for-type-predicate
export function isTableSubnode(node: Readonly<Node>): node is TableSubnodeType {
    return isColumnNode(node) || isRowNode(node)
}

export function isTableOrTitle(node: Readonly<Node>): boolean {
    return isTable(node) || isTitle(node)
}

function getFlatSubnodes(
    table: Readonly<Table>,
    curr: TableSubnodeType,
): readonly Readonly<Node>[] {
    const types: NodeType[] = isColumnNode(curr) ?
        [NodeType.COLUMN, NodeType.COLUMN_BLOCK] :
        [NodeType.ROW, NodeType.ROW_BLOCK]
    return preOrderWalk(table, getNodesVisitor, types)
}
