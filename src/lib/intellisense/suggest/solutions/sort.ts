import {Node} from '@logi/src/lib/hierarchy/core'
import {ViewPart} from '@logi/src/lib/intellisense/editor/display/panel/part'
import {
    getChildIndex,
    getNodesDist,
    isSibling,
} from '@logi/src/lib/intellisense/utils'

import {Candidate} from './candidate'

/**
 * Determines which candidate should be displayed first or last.
 */
export function sortCandidates(
    a: Readonly<Candidate>,
    b: Readonly<Candidate>,
    // tslint:disable-next-line: no-optional-parameter
    node?: Readonly<Node>,
): number {
    const subResult = compareSubstring(a, b)
    if (subResult !== 0)
        return subResult

    const resultMap = compareMap(a, b)
    if (resultMap !== 0)
        return resultMap
    if (node !== undefined
        && a.handle !== undefined
        && b.handle !== undefined) {
        if (a.handle.nodes[0] === b.handle.nodes[0])
            return 0
        if (a.handle.nodes[0] === node)
            return 1
        if (b.handle.nodes[0] === node)
            return -1

        const resultDist = compareDist(a, b, node)
        if (resultDist !== 0)
            return resultDist
    }
    const resultLength = compareLength(a, b)
    if (resultLength !== 0)
        return resultLength

    return 0
}

function compareMap(a: Readonly<Candidate>, b: Readonly<Candidate>): number {
    const mapAs = a.view.map((c: ViewPart): Map<number, number> => c.matchedMap)
    const mapBs = b.view.map((c: ViewPart): Map<number, number> => c.matchedMap)
    const len = Math.min(mapAs.length, mapBs.length)
    // tslint:disable-next-line: no-loop-statement
    for (let j = 0; j < len; j += 1) {
        const mapA = mapAs[j]
        const mapB = mapBs[j]
        // tslint:disable-next-line: no-loop-statement
        for (let i = 0; i < Math.min(mapA.size, mapB.size); i += 1) {
            const matchA = mapA.get(i)
            const matchB = mapB.get(i)
            if (matchA === undefined && matchB === undefined)
                continue
            if (matchA !== undefined && matchB !== undefined) {
                if (matchA > matchB)
                    return 1
                if (matchA < matchB)
                    return -1
            } else {
                if (matchA === undefined)
                    return 1

                return -1
            }
        }
    }

    return 0
}

function compareDist(
    a: Readonly<Candidate>,
    b: Readonly<Candidate>,
    base: Readonly<Node>,
): number {
    const infoA = a.handle
    const infoB = b.handle
    if (infoA === undefined || infoB === undefined)
        return 0
    if (infoA.nodes === undefined)
        return 0
    if (infoB.nodes === undefined)
        return 0
    const nodeA = infoA.nodes[0]
    const nodeB = infoB.nodes[0]
    return compareNodeDist(base, nodeA, nodeB)
}

function compareLength(a: Readonly<Candidate>, b: Readonly<Candidate>): number {
    const lenA = a.view.map((c: ViewPart): number => c.content.length)
    const lenB = b.view.map((c: ViewPart): number => c.content.length)
    return lenA.reduce((x: number, y: number): number => x + y) -
        lenB.reduce((x: number, y: number): number => x + y)
}

/**
 * Tell which node is closer to this node.
 *
 * If true, node1 is closer and if false, node2 is closer.
 *                    n1
 *                  / | \
 *                n2  n3 n4
 *                / \      \
 *              n5   n6     n7
 *             /  \   \       \
 *            n8   n9  n10     n11
 * Compare two nodes following these procedures:
 *  1.  Compare the steps from this node to the node1 and node2. The steps
 *      from n2 to n10 is 2 and n2 to n5 is 1, so n5 is closer than n10
 *      given n2. If equal, go through. If not, return.
 *  2.  If node1 and node2 are both sibling of base node, compare their
 *      steps to given node via siblings. If equal(like compare n2 and
 *      n4 with given n3), the older(n2) is closer.
 *  3.  Sibling noder is closer than others. Like compare n3 and n7 with
 *      the given node n4, n3 is closer.
 */
// tslint:disable-next-line: cyclomatic-complexity
function compareNodeDist(
    base: Readonly<Node>,
    n1: Readonly<Node>,
    n2: Readonly<Node>,
): number {
    const distA = getNodesDist(n1, base)
    const distB = getNodesDist(n2, base)
    if (distA > distB)
        return 1
    if (distA < distB)
        return -1
    if (isSibling(base, n1) && isSibling(base, n2)) {
        if (base === n1)
            return 1
        if (base === n2)
            return -1
        // Safe to use type assertion as we check in isSibling.
        const parent = base.parent as Readonly<Node>
        const indexA = getChildIndex(parent, n1)
        const indexB = getChildIndex(parent, n2)
        const indexNode = getChildIndex(parent, base)
        const siblingDist = Math.abs(indexA - indexNode) -
            Math.abs(indexB - indexNode)
        if (siblingDist !== 0)
            return siblingDist
        return indexA - indexB
    }
    if (isSibling(base, n1) || isSibling(base, n2))
        return isSibling(base, n1) ? -1 : 1
    return 0
}

function compareSubstring(
    a: Readonly<Candidate>,
    b: Readonly<Candidate>,
): number {
    const mapAs = a.view.map((c: ViewPart): Map<number, number> => c.matchedMap)
    const lenA = mapAs.map(getSubstringLenth)
    const mapBs = b.view.map((c: ViewPart): Map<number, number> => c.matchedMap)
    const lenB = mapBs.map(getSubstringLenth)
    return lenB.reduce((x: number, y: number): number => x + y, 0)
        - lenA.reduce((x: number, y: number): number => x + y, 0)
}

/**
 * Get the maximum oflength of the substring from the matched map.
 *
 * NOTE: export this function only for test.
 */
export function getSubstringLenth(map: Map<number, number>): number {
    const values = Array.from(map.values()).sort()
    let curr = values[0]
    let max = 0
    let count = 1
    // tslint:disable-next-line: no-loop-statement
    for (let i = 0; i < values.length; i += 1) {
        if (i === 0)
            continue
        if (values[i] === curr + 1) {
            count += 1
            max = count > max ? count : max
        } else
            count = 1
        curr = values[i]
    }
    return max
}
