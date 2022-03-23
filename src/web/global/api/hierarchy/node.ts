import {Node} from '@logi/src/lib/hierarchy/core'

/**
 * Get the largest index number from the names.
 *
 * For example:
 *  names = ['a1', 'a2', 'a3', 'b5', 'b2']
 *  prefix = 'a' => 1
 *  prefix = 'b' => 5
 *  prefix = 'c' => 0 (No prefix startwith 'c', return 0)
 */
export function getLargestIndex(
    subnodes: readonly Readonly<Node>[],
    prefix: string,
): number {
    let num = 0
    const names = subnodes.map((n: Readonly<Node>): string => n.name)
    names.forEach((n: string): void => {
        if (!n.startsWith(prefix))
            return
        const numStr = n.substring(prefix.length)
        if (! numStr.match(/\d+$/))
            return
        const ten = 10
        const curr = Number.parseInt(numStr, ten)
        if (curr > num)
            num = curr
    })
    return num
}
