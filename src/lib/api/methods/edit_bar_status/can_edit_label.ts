import {isColumn, Node} from '@logi/src/lib/hierarchy/core'

export function canEditLabel(nodes: readonly Readonly<Node>[]): boolean {
    if (nodes.length === 0)
        return false
    return nodes.find((n: Readonly<Node>): boolean => !isColumn(n))
        === undefined
}
