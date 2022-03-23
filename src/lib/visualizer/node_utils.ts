import {Node} from '@logi/src/lib/hierarchy/core'

/**
 * Get the SCA(Smallest Common Ancestor) of `node` and `otherNode`.
 */
export function getSca(
    node: Readonly<Node>,
    otherNode: Readonly<Node>,
): Readonly<Node> | undefined {
    const path = node.getAncestors()
    const result = path.filter((parent: Readonly<Node>): boolean =>
        otherNode
            .getAncestors()
            .filter((n: Readonly<Node>): boolean => n !== node)
            .includes(parent),)
    if (result.length === 0)
        return
    /**
     * Safe to use index and no need to return undefined for the two of nodes
     * at least have book common parent.
     */
    return result[result.length - 1]
}
