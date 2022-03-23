import {Writable} from '@logi/base/ts/common/mapped_types'
import {getSubnodes, Node} from '@logi/src/lib/hierarchy/core'

/**
 * Modify the parent.
 *
 * In a normal situation, we can not assign a node a parent.
 */
export function correctParent(root: Readonly<Node>): void {
    const stack: Readonly<Node>[] = [root]
    while (true) {
        const curr = stack.pop()
        if (curr === undefined)
            return
        const subs = getSubnodes(curr)
        subs.forEach((c: Readonly<Node>): void => {
            // tslint:disable-next-line: no-type-assertion
            const writable = c as Writable<Node>
            // @ts-ignore
            writable._parent = curr
        })
        stack.push(...subs)
    }
}
