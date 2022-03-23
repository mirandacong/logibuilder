import {FormulaBearer, isFormulaBearer} from './formula_bearer'
import {Node} from './node'
import {PartBuilder, Path, PathBuilder} from './path'
import {isTable, Table} from './table'
import {getSubnodes} from './visitor'

/**
 * Resolve a path(mostly simlified path). Find all the formula bearers.
 */
export function resolve(
    path: Path,
    node: Readonly<Node>,
): readonly Readonly<FormulaBearer>[] {
    const parts = path.parts
    if (parts.length === 0)
        return []
    let currRoot: Readonly<Node> | null = node.parent ?? node
    while (currRoot !== null) {
        let candidates = getSubnodes(currRoot)
        let currParts = [...parts]
        while (candidates.length !== 0 && currParts.length > 1) {
            const selected = candidates
                .filter(c => c.name === currParts[0].name)
            const nextCandis: Readonly<Node>[] = []
            selected.forEach((n: Readonly<Node>): void => {
                nextCandis.push(...getSubnodes(n))
            })
            candidates = nextCandis
            currParts = currParts.slice(1)
        }
        if (currParts.length !== 1) {
            currRoot = currRoot.parent
            continue
        }
        const result = candidates.filter((
            c: Readonly<Node>,
        ): c is Readonly<FormulaBearer> =>
            (c.name === currParts[0].name) && isFormulaBearer(c) &&
            c.alias === path.alias && c.valid)
        if (result.length !== 0)
            return result
        currRoot = currRoot.parent
    }
    return []
}

export function resolveTable(
    path: Path,
    node: Readonly<Node>,
): readonly Readonly<Table>[] {
    const parts = path.parts
    if (parts.length === 0)
        return []
    let currRoot: Readonly<Node> | null = node.parent ?? node
    while (currRoot !== null) {
        let candidates = getSubnodes(currRoot)
        let currParts = [...parts]
        while (candidates.length !== 0 && currParts.length > 1) {
            const selected = candidates
                .filter(c => c.name === currParts[0].name)
            const nextCandis: Readonly<Node>[] = []
            selected.forEach((n: Readonly<Node>): void => {
                nextCandis.push(...getSubnodes(n))
            })
            candidates = nextCandis
            currParts = currParts.slice(1)
        }
        if (currParts.length !== 1) {
            currRoot = currRoot.parent
            continue
        }
        const result = candidates.filter((
            c: Readonly<Node>,
        ): c is Readonly<Table> =>
            (c.name === currParts[0].name) && isTable(c))
        if (result.length !== 0)
            return result
        currRoot = currRoot.parent
    }
    return []
}

/**
 * Given a target formula bearer, and the current node,
 * return the shorted path that starts from the common parent.
 */
export function simplifyPath(
    target: Readonly<FormulaBearer>,
    curr: Readonly<Node>,
): Path {
    const targetAncestors = target.getAncestors()
    const expectSelf = targetAncestors.slice(0, targetAncestors.length - 1)
    const currAncestors = curr.getAncestors()
    let closestParent: Readonly<Node> | undefined
    for (let i = currAncestors.length - 1; i >= 0; i -= 1)
        if (expectSelf.includes(currAncestors[i])) {
            closestParent = currAncestors[i]
            break
        }
    const parentIdx = closestParent === undefined
        ? -1
        : targetAncestors.indexOf(closestParent)
    const shorted = targetAncestors.slice(parentIdx + 1)
    const parts = shorted.map(n =>
        new PartBuilder().name(n.name).labels(n.labels).build())
    return new PathBuilder().parts(parts).alias(target.alias).build()
}
