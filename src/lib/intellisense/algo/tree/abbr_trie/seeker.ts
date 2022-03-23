import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {EmptyStrategy, Seeker, Target, TargetBuilder} from '../../seeker'

import {buildTrie} from './build'
import {Node} from './node'

class AbbrSeekerImpl implements Seeker {
    public emptyStrategy = EmptyStrategy.EMPTY
    public root!: Readonly<Node>

    public caseSensitive = false
    public seek(seg: string): readonly Readonly<Target>[] {
        const text = seg.split(' ').join('') // Remove the spaces.
        if (text === '' && this.emptyStrategy === EmptyStrategy.EMPTY)
            return []
        const nodeInfoArray = text !== '' ?
            getNodesInfoByPath(this.root, text, this.caseSensitive) :
            [new NodeInfoBuilder().currNode(this.root).build()]
        const result: Readonly<Target>[] = []
        nodeInfoArray.forEach((info: Readonly<NodeInfo>): void => {
            result.push(...walkTrie(info))
        })
        return result
    }
}

export class AbbrSeekerBuilder extends Builder<Seeker, AbbrSeekerImpl> {
    public constructor(obj?: Readonly<Seeker>) {
        const impl = new AbbrSeekerImpl()
        if (obj)
            AbbrSeekerBuilder.shallowCopy(obj, impl)
        super(impl)
    }

    public data(value: readonly string[]): this {
        this.getImpl().root = buildTrie(value)
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
        return AbbrSeekerBuilder.__DAA_PROPS__
    }
}

// tslint:disable-next-line:max-func-body-length
function getNodesInfoByPath(
    root: Node,
    path: string,
    caseSensitive: boolean,
): readonly NodeInfo[] {
/**
 * Start: {node=root, currPath='', remainStr=user_input, *matchedIndex=[]}
 * If node.remainStr === '', it means this node is what we need and
 *      from which we start to walk can get the recommended words.
 * If node.children.length === 0, it means we arrive at the leaf-node
 *      but we still have some characters of user input mismatched.
 * Now we choose the children to move to.
 *      For each child:
 *          We find the `mismatchIndex` of the word in the child, where the
 *              left string and the word start to mismatch.
 *          If the index === 0 (mismatch from the first letter)
 *          && currPath.length > 1 (which means this
 *          node is not the FirstNode)
 *              This node should not be reached.
 *          Calculate the node information as below
 *          and push it into stack.
 *               Calculate the current address.
 *               Calculate the new matched index.
 *               Calculate the remained string.
 *               Record this node.
 */
    const result: NodeInfo[] = []
    const stack: NodeInfo[] = [
        new NodeInfoBuilder().currNode(root).remainedStr(path).build(),
    ]
    // tslint:disable-next-line: no-loop-statement
    while (stack.length > 0) {
        const currInfo = stack.pop() as NodeInfo
        const leftStr = currInfo.remainedStr
        if (leftStr === '') {
            result.push(currInfo)
            continue
        }
        const children = currInfo.currNode.children
        if (children.length === 0)
            continue
        const currPath = currInfo.currPath
        children.forEach((child: Node): void => {
            const idx = getMismatchIndex(child.word, leftStr, caseSensitive)
            if (idx === 0 && currPath.length > 1)
                return
            const nowIndex = [...currInfo.matchedIndex]
            const newIdx = getNewIndex(nowIndex, idx, currPath.length)
            const newInfo = new NodeInfoBuilder()
                .currNode(child)
                .remainedStr(leftStr.substr(idx))
                .matchedIndex(newIdx)
                .currPath(getNewPath(currPath, child.word))
                .build()
            stack.push(newInfo)
        })
    }

    return result
}

/**
 * Given a `NodeInfo`, walk the trie and get the recommended words.
 */
// tslint:disable-next-line:max-func-body-length
function walkTrie(nodeInfo: NodeInfo): readonly Readonly<Target>[] {
    const nodeInfoStack = [nodeInfo]
    const result: Target[] = []
    // tslint:disable-next-line: no-loop-statement
    while (nodeInfoStack.length > 0) {
        const currInfo = nodeInfoStack.pop() as NodeInfo
        const curr = currInfo.currNode
        const nowPath = currInfo.currPath
        const children = curr.children
        if (children.length === 0) {
            const matchedMap = new Map<number, number>()
            nodeInfo.matchedIndex
                .forEach((value: number, idx: number): void => {
                    matchedMap.set(idx, value)
                })
            const target = new TargetBuilder()
                .content(nowPath)
                .matchedMap(matchedMap)
                .build()
            result.push(target)
            continue
        }
        // tslint:disable-next-line: no-loop-statement
        for (let i = children.length - 1; i >= 0; i -= 1) {
            const child = children[i]
            nodeInfoStack.push(new NodeInfoBuilder()
                .currNode(child)
                .currPath(getNewPath(nowPath, child.word))
                .build())
        }
    }

    return result
}

/**
 * Returns the index where s1 and s2 start to mismatch.
 */
function getMismatchIndex(
    s1: string,
    s2: string,
    caseSensitive: boolean,
): number {
    const len: number = Math.min(s1.length, s2.length)
    // tslint:disable-next-line: no-loop-statement
    for (let i = 0; i < len; i += 1) {
        if (!caseSensitive && s1[i].toLowerCase() !== s2[i].toLowerCase())
            return i
        if (caseSensitive && s1[i] !== s2[i])
            return i
    }
    return len
}

/**
 * Gets the new path when searching.
 */
function getNewPath(currPath: string, word: string): string {
    if (currPath.length > 1 && word.length > 0)
        return `${currPath} ${word}`

    return `${currPath}${word}`
}

/**
 * Gets the new matched indices when searching.
 */
function getNewIndex(
    // tslint:disable-next-line: readonly-array
    currIndex: number[],
    matchedCnts: number,
    base: number,
): readonly number[] {
    const result = currIndex
    const flag = base > 1 ? 1 : 0 // If this is the FirstNode.
    // tslint:disable-next-line: no-loop-statement
    for (let i = 0; i < matchedCnts; i += 1)
        result.push(base + i + flag)

    return result
}

interface NodeInfo {
    /**
     * Current node the search stops.
     */
    readonly currNode: Node
    /**
     * The left string waiting to be matched.
     */
    readonly remainedStr: string
    /**
     * Currently, the indices of matched character.
     */
    readonly matchedIndex: readonly number[]
    readonly currPath: string
}

class NodeInfoImpl implements Impl<NodeInfo> {
    public currNode!: Node
    public remainedStr = ''
    public matchedIndex: readonly number[] = []
    public currPath = ''
}

class NodeInfoBuilder extends Builder<NodeInfo, NodeInfoImpl> {
    public constructor(obj?: Readonly<NodeInfo>) {
        const impl = new NodeInfoImpl()
        if (obj)
            NodeInfoBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public currNode(node: Node): NodeInfoBuilder {
        this.getImpl().currNode = node

        return this
    }

    public remainedStr(s: string): NodeInfoBuilder {
        this.getImpl().remainedStr = s

        return this
    }

    public matchedIndex(index: readonly number[]): NodeInfoBuilder {
        this.getImpl().matchedIndex = index

        return this
    }

    public currPath(s: string): NodeInfoBuilder {
        this.getImpl().currPath = s

        return this
    }

    protected static readonly __DAA_PROPS__: readonly string[] = ['currNode']

    protected get daa(): readonly string[] {
        return NodeInfoBuilder.__DAA_PROPS__
    }
}
