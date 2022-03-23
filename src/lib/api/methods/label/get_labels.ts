import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {
    Book,
    getNodesVisitor,
    isColumn,
    isRow,
    isTable,
    Label,
    Node,
    NodeType,
} from '@logi/src/lib/hierarchy/core'

/**
 * return a list of two element, first is row label info
 * second is col label info
 */
export function getBookLabels(
    book: Readonly<Book>,
): readonly Map<Label, readonly string[]>[] {
    const nodes = preOrderWalk(
        book,
        getNodesVisitor,
        [NodeType.ROW, NodeType.COLUMN],
    )
    const colsLabels = new Map<Label, string[]>()
    const rowsLabels = new Map<Label, string[]>()
    nodes.forEach((node: Readonly<Node>): void => {
        if (isColumn(node))
            insertToInfo(colsLabels, node)
        if (isRow(node))
            insertToInfo(rowsLabels, node)
    })

    return [rowsLabels, colsLabels]
}

export function getEditbleLabels(
    book: Readonly<Book>,
): readonly Map<Label, readonly string[]>[] {
    const nodes = preOrderWalk(
        book,
        getNodesVisitor,
        [NodeType.ROW, NodeType.COLUMN],
    )
    const colsLabels = new Map<Label, string[]>()
    const rowsLabels = new Map<Label, string[]>()
    nodes.forEach((node: Readonly<Node>): void => {
        if (isRow(node))
            insertToInfo(rowsLabels, node)
        if (!isColumn(node))
            return
        const table = node.getTable()
        if (!isTable(table))
            return
        if (table.referenceHeader === undefined)
            insertToInfo(colsLabels, node)
    })

    return [rowsLabels, colsLabels]
}

function insertToInfo(
    // tslint:disable-next-line: readonly-array
    infoMap: Map<Label, string[]>,
    node: Readonly<Node>,
): void {
    node.labels.forEach((label: Label): void => {
        if (infoMap.has(label))
            infoMap.get(label)?.push(node.uuid)
        else
            infoMap.set(label, [node.uuid])
    })
}

export function getNodesLabel(
    nodes: readonly Readonly<Node>[],
): readonly Label[] {
    const targets: Label[] = []
    nodes.forEach((node: Readonly<Node>): void => {
        node.labels.forEach((label: Label): void => {
            if (typeof label !== 'string')
                return
            if (targets.includes(label))
                return
            targets.push(label)
        })
    })
    return targets
// tslint:disable-next-line: max-file-line-count
}
