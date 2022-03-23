import {Builder} from '@logi/base/ts/common/builder'
import {
    isColumn,
    isFormulaBearer,
    isRow,
    Node,
    NodeType,
    Path,
} from '@logi/src/lib/hierarchy/core'
import {lcsLenMatch} from '@logi/src/lib/intellisense/algo'
import {
    getViewType,
    ViewPart,
    ViewPartBuilder,
} from '@logi/src/lib/intellisense/editor/display'
import {getChildren, getRoot, getTags} from '@logi/src/lib/intellisense/utils'

import {
    Candidate,
    CandidateBuilder,
    CandidateGroup,
    CandidateGroupBuilder,
    CandidateHandleBuilder,
    CandidateType,
} from '../candidate'
import {Provider} from '../provider'
import {sortCandidates} from '../sort'
import {Trigger} from '../trigger'

type MatchedNodeInfo = readonly [Readonly<Node>, readonly MatchedPart[]]
type MatchedPart = readonly [Readonly<Node>, Map<number, number>]
type SemiProduct = readonly [Readonly<CandidateBuilder>, RefInfo]

/**
 * This class helps provide the recommended paths.
 */
export class PathProvider implements Provider {
    // tslint:disable-next-line:prefer-function-over-method
    public suggest(
        trigger: Readonly<Trigger>,
    ): readonly Readonly<CandidateGroup>[] {
        const newText = trigger.text
        if (newText === '')
            return []
        const nodes:
            readonly (readonly[Readonly<Node>, readonly MatchedPart[]])[] =
            suggestPathNodes(trigger.node, trigger.text.split('!'))
        const candidates: Readonly<Candidate>[] = []
        nodes.forEach((node: MatchedNodeInfo): void => {
            const semis = getSemiCandidate(node)
            semis.forEach((semi: SemiProduct): void => {
                const candidate = getCandidate(semi, trigger)
                candidates.push(candidate)
            })
        })
        const members = candidates.sort(
            (a: Readonly<Candidate>, b: Readonly<Candidate>): number =>
            sortCandidates(a, b, trigger.node),
        )
        return [new CandidateGroupBuilder()
            .filters([])
            .members(members)
            .build()]
    }
}

function getCandidate(
    semi: Readonly<SemiProduct>,
    trigger: Trigger,
): Readonly<Candidate> {
    const prefix = trigger.prefix
    const suffix = trigger.suffix
    const path = semi[1].node.getPath() as Path
    const selection = semi[1].selection === '' ? '' : `[${semi[1].selection}]`
    const updateString = `{${path.toString()}}${selection}`
    const offset = `${prefix}${updateString}`.length
    const builder = semi[0]
    return builder
        .updateText(updateString)
        .prefix(prefix)
        .source(selection === '' ? CandidateType.PROCESS_PATH
            : CandidateType.PROCESS_SELECTION)
        .suffix(suffix)
        .cursorOffest(offset)
        .from(trigger.from)
        .build()
}

/**
 * Get the nodes whose path go throughs all the inputs.
 * Only row nodes should be returned.
 *
 * Traversal the hierarchy graph, when the current node matches one of
 * the `input`, generate a new `Info` with updated `remainedStr`.
 */
// tslint:disable-next-line:max-func-body-length
function suggestPathNodes(
    node: Readonly<Node>,
    inputs: readonly string[],
): readonly MatchedNodeInfo[] {
    const root = isColumn(node)
        ? node.getTable()
        : getRoot(node)
    if (root === undefined)
        return []
    const result: [Readonly<Node>, MatchedPart[]][] = []
    const queue: WalkInfo[] = [new WalkInfoBuilder()
        .node(root)
        .matchedParts([])
        .remainedStr(inputs)
        .build()]
    const targetType = isRow(node) ? NodeType.ROW : NodeType.COLUMN
    // tslint:disable-next-line: no-loop-statement
    while (queue.length > 0) {
        // Save to use type assertion, we have checked in `while`.
        const curr = queue.shift() as WalkInfo
        const remainedStr = curr.remainedStr
        let matchFlag = 0 // Signifying if this path match the input.
        for (const input of remainedStr) {
            const matched = visitor(curr.node, input)
            if (matched.length === 0)
                continue
            matchFlag = 1
            if (remainedStr.length === 1) {
                if (isFormulaBearer(curr.node) && curr.node.valid &&
                    curr.node.nodetype === targetType) {
                    const currNodes = result.map((c: MatchedNodeInfo):
                        Readonly<Node> => c[0])
                    if (!currNodes.includes(curr.node))
                        result.push(
                            [curr.node, [...curr.matchedParts, matched[0]]],
                        )
                    break
                }
                /**
                 * If the only remained str is matched but this node is not row
                 * or column, continue.
                 */
                queue.push(...getChildren(curr.node)
                    .map((c: Readonly<Node>): WalkInfo => new WalkInfoBuilder()
                        .node(c)
                        .matchedParts([...curr.matchedParts])
                        .remainedStr([...remainedStr])
                        .build()))
                continue
            }
            const idx = remainedStr.indexOf(input)
            const newInput = [...remainedStr.slice(0, idx),
                ...remainedStr.slice(idx + 1)]
            queue.push(...getChildren(curr.node)
                .map((c: Readonly<Node>): WalkInfo => new WalkInfoBuilder()
                    .node(c)
                    .matchedParts([...curr.matchedParts, matched[0]])
                    .remainedStr(newInput)
                    .build()))
        }
        // tslint:disable-next-line: early-exit
        if (matchFlag === 0)
            queue.push(...getChildren(curr.node)
                .map((value: Readonly<Node>): WalkInfo =>
                    new WalkInfoBuilder()
                        .node(value)
                        .remainedStr([...remainedStr])
                        .matchedParts([...curr.matchedParts])
                        .build()))
    }

    return result
}

/**
 * According to the input, generate specific candidates to user.
 */
// tslint:disable-next-line:max-func-body-length
function getSemiCandidate(node: MatchedNodeInfo): readonly SemiProduct[] {
    return [[
        new CandidateBuilder()
            .view(createViewParts(node[0], node[1]))
            .source(CandidateType.PROCESS_PATH)
            .handle(new CandidateHandleBuilder().nodes([node[0]]).build()),
        new RefInfoBuilder().node(node[0]).build(),
    ]]
}

function createViewParts(
    n: Readonly<Node>,
    matchedParts: readonly MatchedPart[],
): readonly ViewPart[] {
    let curr = n
    const result: ViewPart[] = []
    while (true) {
        let matched = false
        for (const part of matchedParts) {
            if (part[0] !== curr)
                continue
            result.push(new ViewPartBuilder()
                .type(getViewType(part[0].nodetype))
                .matchedMap(part[1])
                .content(part[0].name)
                .build())
            matched = true
            break
        }
        if (!matched)
            result.push(new ViewPartBuilder()
                .type(getViewType(curr.nodetype))
                .matchedMap(new Map<number, number>())
                .content(curr.name)
                .build())
        if (curr.parent !== null && curr.parent.nodetype !== NodeType.BOOK)
            curr = curr.parent as Readonly<Node>
        else
            break
    }
    return result
}

/**
 * We use this interface to deliver information in `suggestPathNodes()`.
 */
interface WalkInfo {
    readonly node: Readonly<Node>
    readonly remainedStr: readonly string[]
    readonly matchedParts: readonly MatchedPart[]
}

class WalkInfoImpl implements WalkInfo {
    public node!: Readonly<Node>
    public remainedStr!: readonly string[]
    public matchedParts: readonly MatchedPart[] = []
}

class WalkInfoBuilder extends Builder<WalkInfo, WalkInfoImpl> {
    public constructor(obj?: Readonly<WalkInfo>) {
        const impl = new WalkInfoImpl()
        if (obj)
            WalkInfoBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public node(value: Readonly<Node>): this {
        this.getImpl().node = value
        return this
    }

    public remainedStr(value: readonly string[]): this {
        this.getImpl().remainedStr = value
        return this
    }

    public matchedParts(value: readonly MatchedPart[]): this {
        this.getImpl().matchedParts = value
        return this
    }
}

/**
 * If any component in the path match the input, return them.
 *
 * Notice that this function requires traversaling the tree hierarchally
 * or pre-orderly.
 */
function visitor(curr: Readonly<Node>, input: string): readonly MatchedPart[] {
    const tags = getTags(curr)
    return lcsLenMatch(input, tags, false)
        .map((c: readonly [string, Map<number, number>]):
            MatchedPart => [curr, c[1]])
}

interface RefInfo {
    readonly node: Readonly<Node>
    readonly selection: string
}

class RefInfoImpl implements RefInfo {
    public node!: Readonly<Node>

    public selection = ''
}

class RefInfoBuilder extends Builder<RefInfo, RefInfoImpl> {
    public constructor(obj?: Readonly<RefInfo>) {
        const impl = new RefInfoImpl()
        if (obj)
            RefInfoBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public node(node: Readonly<Node>): this {
        this.getImpl().node = node
        return this
    }

    public selection(selection: string): this {
        this.getImpl().selection = selection
        return this
    }

    protected static readonly __DAA_PROPS__: readonly string[] = ['node']

    protected get daa(): readonly string[] {
        return RefInfoBuilder.__DAA_PROPS__
    }
// tslint:disable-next-line: max-file-line-count
}
