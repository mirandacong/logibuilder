import {Builder} from '@logi/base/ts/common/builder'

import {EmptyStrategy, Seeker, Target, TargetBuilder} from '../../seeker'

import {buildTrie} from './build'
import {Node} from './node'


class TrieSeekerImpl implements Seeker {
    public root!: Readonly<Node>
    public emptyStrategy = EmptyStrategy.EMPTY
    public caseSensitive = false
    public seek(seg: string): readonly Target[] {
        if (seg === '' && this.emptyStrategy === EmptyStrategy.EMPTY)
            return []
        const node = getNodeByPath(this.root, seg)
        if (node === undefined)
            return []
        const contents = walkTrie(node, seg)
        const matchedMap = new Map<number, number>()
        // tslint:disable-next-line: no-loop-statement
        for (let i = 0; i < seg.length; i += 1)
            matchedMap.set(i, i)
        return contents.map((content: string): Target =>
            new TargetBuilder().content(content).matchedMap(matchedMap).build(),
        )
    }
}

export class TrieSeekerBuilder extends Builder<Seeker, TrieSeekerImpl> {
    public constructor(obj?: Readonly<Seeker>) {
        const impl = new TrieSeekerImpl()
        if (obj)
            TrieSeekerBuilder.shallowCopy(obj, impl)
        super(impl)
    }

    public data(data: readonly string[]): this {
        this.getImpl().root = buildTrie(data)
        return this
    }

    public emptyStrategy(value: EmptyStrategy): this {
        this.getImpl().emptyStrategy = value
        return this
    }

    public caseSensitive(value: boolean): this {
        this.getImpl().caseSensitive = value
        return this
    }

    protected static __DAA_PROPS__: readonly string[] = ['root']

    protected get daa(): readonly string[] {
        return TrieSeekerBuilder.__DAA_PROPS__
    }
}

/**
 * Navigates to the node using the path.
 */
function getNodeByPath(root: Node, path: string): Node | undefined {
    let curr = root
    // tslint:disable-next-line: no-loop-statement
    for (const char of path) {
        const childIndex = curr.index.indexOf(char)
        if (childIndex < 0)
            return
        curr = curr.children[childIndex]
    }

    return curr
}

/**
 * Walk down the trie from the `node`, and get the words whose prefix is `path`.
 */
function walkTrie(node: Node, path: string): readonly string[] {
    const nodeStack = [node]
    const pathStack = [path]
    const result: string[] = []
    // tslint:disable-next-line: no-loop-statement
    while (nodeStack.length > 0) {
        const curr = nodeStack.pop() as Node
        const nowPath = pathStack.pop() as string
        const children = curr.children
        if (children.length === 0) {
            result.push(nowPath)
            continue
        }
        // tslint:disable-next-line: no-loop-statement
        for (let i = children.length - 1; i >= 0; i -= 1) {
            const child = children[i]
            pathStack.push(nowPath + child.character)
            nodeStack.push(child)
        }
    }

    return result
}
