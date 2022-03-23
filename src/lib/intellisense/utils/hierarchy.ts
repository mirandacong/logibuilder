import {
    isBook,
    isColumnBlock,
    isRowBlock,
    isSheet,
    isTable,
    isTitle,
    Node,
    NodeType,
    Part,
} from '@logi/src/lib/hierarchy/core'

/**
 * Get all of the refnames of a hierarchy graph.
 *
 * return: an array of nodes' refname sorted by their hierarchy.
 */
export function getRefnames(node: Readonly<Node>): readonly string[] {
    return getNodes(node).map((c: Readonly<Node>): string => c.name)
}

/**
 * Find the nodes pass the filter and stop walking down.
 */
export function findDecendants<T>(
    root: Readonly<Node>,
    filter: (curr: Node, arg: T) => boolean,
    arg: T,
): readonly Readonly<Node>[] {
    const result: Readonly<Node>[] = []
    const queue: Readonly<Node>[] = [root]
    // tslint:disable-next-line: no-loop-statement
    while (queue.length > 0) {
        // Save to use type assertion, we have checked in `while`.
        const curr = queue.shift() as Node
        if (filter(curr, arg)) {
            result.push(curr)
            continue
        }
        queue.push(...getChildren(curr))
    }

    return result
}

/**
 * Find the nearest ancestor who passes the filter.
 */
export function findParent<T>(
    node: Readonly<Node>,
    filter: (curr: Readonly<Node>, arg: T) => boolean,
    arg: T,
): Readonly<Node> {
    let result = node
    // tslint:disable-next-line: no-loop-statement
    while (result.parent !== null) {
        if (filter(result, arg))
            return result
        // Safe to use type assertion, we have checked in while.
        result = result.parent as Node
    }

    return result
}

/**
 * Walk down the node and return its children in hierarchical order.
 */
export function getNodes(node: Readonly<Node>): readonly Readonly<Node>[] {
    const result: Readonly<Node>[] = []
    const queue: Readonly<Node>[] = [node]
    // tslint:disable-next-line: no-loop-statement
    while (queue.length > 0) {
        const curr = queue.shift() as Node
        result.push(curr)
        queue.push(...getChildren(curr))
    }

    return result
}

/**
 * Get all the children of the node.
 */
export function getChildren(node: Readonly<Node>): readonly Readonly<Node>[] {
    if (isBook(node))
        return node.sheets
    if (isSheet(node))
        return node.tree
    if (isTitle(node))
        return node.tree
    if (isTable(node))
        return [...node.cols, ...node.rows]
    if (isColumnBlock(node))
        return node.tree
    if (isRowBlock(node))
        return node.tree
    return []
}

/**
 * Find the root of the given node.
 */
export function getRoot(node: Readonly<Node>): Readonly<Node> {
    let result = node
    // tslint:disable-next-line: no-loop-statement
    while (result.parent !== null)
        // Safe to use type assetrtion cause we have checked in while.
        result = result.parent as Node

    return result
}

/**
 * Get the distance between node1 and node2.
 *
 * Given the graph below,
 * distance(n1, n2) = 1
 * distance(n1, n4) = 2
 * distance(n5, n4) = 2
 * distance(n5, n6) = 4
 *
 *            hierarchy graph
 *                  n1
 *                 /  \
 *                n2   n3
 *               /  \    \
 *              n4  n5    n6
 */
export function getNodesDist(
    node1: Readonly<Node>,
    node2: Readonly<Node>,
): number {
    let i = 0
    let curr1 = node1
    // tslint:disable-next-line: no-loop-statement
    while (curr1.parent !== null) {
        i += 1
        // Safe to use type assertion as we check in while.
        curr1 = curr1.parent as Node
    }
    let j = 0
    let curr2 = node2
    // tslint:disable-next-line: no-loop-statement
    while (curr2.parent !== null) {
        j += 1
        // Safe to use type assertion as we check in while.
        curr2 = curr2.parent as Node
    }
    const steps = Math.abs(i - j)
    if (i > j) {
        curr1 = node1
        curr2 = node2
    } else {
        curr1 = node2
        curr2 = node1
    }
    // tslint:disable-next-line: no-loop-statement
    for (let k = 0; k < steps; k += 1)
        // Safe to use type assertion.
        curr1 = curr1.parent as Node
    let dist = 0
    // tslint:disable-next-line: no-loop-statement
    while (curr1 !== curr2) {
        // Safe to use type assertion as we have checked.
        curr1 = curr1.parent as Node
        curr2 = curr2.parent as Node
        dist += 1
    }

    // tslint:disable-next-line:no-magic-numbers
    return steps + dist * 2
}

type AliasPart = readonly [string, NodeType]

/**
 * Get a short alias path for a node path.
 *
 * Find out a short path which is also able to navigate to this node.
 * This function follows these rules:
 *  1. Short alias of a node only contains one label.
 *  `Ref[[a, b]]` is not allowed.
 *  2. Search the parent node who owns only one this refid.
 *
 * NOTE: When the `node` is a selection node, we should find out the alias of
 * its parent.
 */
export function getShortAlias(node: Readonly<Node>): readonly AliasPart[] {
    const result: AliasPart[] = []
    const pathNodes: Readonly<Node>[] = []
    let curr = node
    // tslint:disable-next-line: no-loop-statement
    while (curr.parent !== null) {
        // Safe to use type assertion as we check in while.
        curr = curr.parent as Readonly<Node>
        pathNodes.push(curr)
    }
    const defaultPart: AliasPart[] = [...pathNodes]
        .reverse()
        .map((c: Readonly<Node>): [string, NodeType] => [c.name, c.nodetype])
    defaultPart.push([node.name, node.nodetype])

    const targets = getRefIds(node)
    // tslint:disable-next-line: no-loop-statement
    while (pathNodes.length > 0) {
        // Safe to use type assertion as we check in while.
        const root = pathNodes.pop() as Readonly<Node>
        const counter = countRefIds(root, node, targets)
        const unique = hasUniqueRefId(counter)
        if (!unique)
            continue
        result.push([unique, node.nodetype])
        if (root.nodetype === NodeType.BOOK)
            return result
        return [...getShortAlias(root), ...result]
    }
    return defaultPart
}

function hasUniqueRefId(counter: Map<string, number>): false | string {
    // tslint:disable-next-line: no-loop-statement
    for (const key of Array.from(counter.keys()))
        if (counter.get(key) === 1)
            return key
    return false
}

/**
 * A refid means the combination of name and labels of a node, indicating
 * the identification of a node.
 */
function getRefIds(node: Readonly<Node>): readonly string[] {
    const result: string[] = [node.name]
    const tags = getTags(node)
    tags.forEach((tag: string): void => {
        if (tag !== node.name)
            result.push(`${node.name}[[${tag}]]`)
    })
    return result
}

function countRefIds(
    root: Readonly<Node>,
    base: Readonly<Node>,
    targets: readonly string[],
): Map<string, number> {
    const result = new Map<string, number>()
    const nodes = getNodes(root).filter((curr: Readonly<Node>): boolean =>
        (LEVEL_MAP.get(curr.nodetype) || 0) >=
            (LEVEL_MAP.get(base.nodetype) || 0))
    nodes.forEach((node: Readonly<Node>): void => {
        // NOTICE: Every row block owns a namesake row.
        if (node.nodetype === NodeType.ROW_BLOCK)
            return
        const refs = getRefIds(node)
        targets.forEach((target: string): void => {
            refs.forEach((ref: string): void => {
                if (ref === target) {
                    const value = result.get(target) || 0
                    result.set(target, value + 1)
                }
            })
        })
    })
    return result
}

/**
 * Gets the labels and refname of a node.
 */
export function getTags(node: Readonly<Node> | Part): readonly string[] {
    const result: string[] = []
    result.push(...node.labels)
    result.push(node.name)
    return result
}

/**
 * Tell these 2 nodes if they are siblings.
 */
export function isSibling(n1: Readonly<Node>, n2: Readonly<Node>): boolean {
    if (n1.parent !== null && n2.parent !== null)
        return n1.parent === n2.parent
    return false
}

/**
 * Return the index of the given node in this node's children.
 *
 * Return -1 when not be found.
 */
export function getChildIndex(
    parent: Readonly<Node>,
    child: Readonly<Node>,
): number {
    return getChildren(parent).indexOf(child as Node)
}

/**
 * Help to find out the hierarchical level of the hierarchy node.
 */
const LEVEL_MAP: Map<NodeType, number> = new Map([
    // tslint:disable-next-line:no-magic-numbers
    [NodeType.COLUMN, 10],
    // tslint:disable-next-line:no-magic-numbers
    [NodeType.COLUMN_BLOCK, 10],
    // tslint:disable-next-line:no-magic-numbers
    [NodeType.ROW, 10],
    // tslint:disable-next-line:no-magic-numbers
    [NodeType.ROW_BLOCK, 20],
    // tslint:disable-next-line:no-magic-numbers
    [NodeType.TITLE, 30],
    // tslint:disable-next-line:no-magic-numbers
    [NodeType.TABLE, 40],
    // tslint:disable-next-line:no-magic-numbers
    [NodeType.SHEET, 50],
    // tslint:disable-next-line:no-magic-numbers
    [NodeType.BOOK, 60],
])
