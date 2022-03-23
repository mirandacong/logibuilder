import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {NAME_ILLEGAL_CHAR} from '@logi/src/lib/dsl/lexer/v2'
import {
    isColumn,
    isFormulaBearer,
    isRow,
    Node,
    NodeType,
} from '@logi/src/lib/hierarchy/core'
import {
    BaseSeekerBuilder,
    Target,
    TargetBuilder,
} from '@logi/src/lib/intellisense/algo'
import {
    getViewType,
    ViewPartBuilder,
} from '@logi/src/lib/intellisense/editor/display'
import {getNodes, getRoot} from '@logi/src/lib/intellisense/utils'

import {
    Candidate,
    CandidateBuilder,
    CandidateGroup,
    CandidateGroupBuilder,
    CandidateHandleBuilder,
    CandidateType,
} from '../candidate'
import {Filter} from '../filter'
import {EmptyStrategy, Provider} from '../provider'
import {sortCandidates} from '../sort'
import {Trigger} from '../trigger'

import {filterWord} from './utils'

type Matcher = (
    input: string,
    beMatched: readonly string[],
    caseSensitive: boolean,
) => readonly (readonly [string, Map<number, number>])[]

class BaseProviderImpl implements Provider {
    public emptyStrategy = EmptyStrategy.EMPTY
    public fn!: Matcher

    public source!: CandidateType

    public _filters: readonly Readonly<Filter>[] = []

    public caseSentitive = false

    // tslint:disable-next-line: max-func-body-length
    public suggest(input: Trigger): readonly Readonly<CandidateGroup>[] {
        const text = input.text
        if (text === '')
            return []
        this._filters = input.filters
        const root = isColumn(input.node)
            ? input.node.getTable()
            : getRoot(input.node)
        if (root === undefined)
            return []
        const filteredType = [
            NodeType.BOOK,
            NodeType.SHEET,
            NodeType.TABLE,
            NodeType.TITLE,
            NodeType.COLUMN_BLOCK,
            NodeType.ROW_BLOCK, // Every row block has its namesake row.
        ]
        if (isRow(input.node))
            filteredType.push(NodeType.COLUMN)
        else
            filteredType.push(NodeType.ROW)
        const nodes = getNodes(root)
            .filter((node: Readonly<Node>): boolean =>
                !filteredType.includes(node.nodetype))
            .filter((node: Readonly<Node>): boolean =>
                !isFormulaBearer(node) || node.valid)
            .filter((node: Readonly<Node>): boolean =>
                filterWord(node.name, this._filters.map(
                    (c: Filter): string => c.value,
                )))
        const candidates = nodes
            .map((node: Readonly<Node>): readonly Readonly<Handle>[] =>
                this._wordSplitMatch(text, node))
            .reduce(
                (
                    a: readonly Readonly<Handle>[],
                    b: readonly Readonly<Handle>[],
                ): readonly Readonly<Handle>[] =>
                    [...a, ...b],
                [],
            )
            .map((c: Readonly<Handle>): Readonly<Candidate> =>
                this._getCandidates(c, input))
        const candMap = new Map<string, Candidate[]>()
        candidates.forEach((c: Candidate): void => {
            const v = c.view[0].content
            if (!candMap.has(v))
                candMap.set(v, [c])
            else
                candMap.get(v)?.push(c)
        })
        const members: Candidate[] = []
        const currTable = input.node.findParent(NodeType.TABLE)
        candMap.forEach((value: Candidate[]): void => {
            const ns = value.map((c: Candidate):
                Readonly<Node> | undefined => c.handle?.nodes[0])
            const handleNodes = ns.reduce(
                (
                    prev: Readonly<Node>[],
                    curr: Readonly<Node> | undefined,
                ): Readonly<Node>[] => {
                    if (curr !== undefined)
                        prev.push(curr)
                    return prev
                },
                [],
            )
            const sameTableNodes = handleNodes.filter((
                n: Readonly<Node>,
            ): boolean => n.findParent(NodeType.TABLE) === currTable)
            const othersNodes = handleNodes.filter((
                n: Readonly<Node>,
            ): boolean => n.findParent(NodeType.TABLE) !== currTable)
            members.push(new CandidateBuilder(value[0])
                .handle(new CandidateHandleBuilder(value[0].handle)
                    .base(input.node)
                    .nodes([...sameTableNodes, ...othersNodes])
                    .build())
                .build())
        })
        const sortedMembers = members.sort((
            a: Candidate,
            b: Candidate,
        ): number => sortCandidates(a, b, input.node))
        return [new CandidateGroupBuilder()
            .filters([])
            .members(sortedMembers)
            .build()]
    }

    private _getCandidates(
        info: Readonly<Handle>,
        trigger: Trigger,
    ): Readonly<Candidate> {
        const prefix = trigger.prefix
        const suffix = trigger.suffix
        const node = info.node
        const target = info.target
        const view = [new ViewPartBuilder()
            .content(node.name)
            .matchedMap(target.matchedMap)
            .type(getViewType(node.nodetype))
            .build()]
        const updateStr = `{${getResolvedName(node.name)}}`
        const offset = `${prefix}${updateStr}`.length
        return new CandidateBuilder()
            .view(view)
            .source(this.source)
            .prefix(prefix)
            .updateText(updateStr)
            .suffix(suffix)
            .from(trigger.from)
            .cursorOffest(offset)
            .handle(new CandidateHandleBuilder()
                .nodes([node])
                .groupByKey(info.key)
                .build())
            .build()
    }

    /**
     * If a word contains spaces like `share holders`, we are supposed to match
     * `share` and `holders` first. This can make the match finish in a single
     * word rather than match `hr` like share holders.
     *                                   A         A
     */
    private _wordSplitMatch(
        input: string,
        node: Readonly<Node>,
    ): readonly Readonly<Handle>[] {
        const phrase = node.name
        const words = phrase.split(' ')
        const idxBase = words.map((word: string, idx: number): number => {
            if (idx === 0 && word)
                return 0
            return words.slice(0, idx).join(' ').length + 1
        })
        const filters = this._filters.map((c: Filter): string => c.value)
        if (words.length > 1 && filters.length === 0) {
            // If splitting by spaces successes, push the word itself to it.
            words.push(phrase)
            idxBase.push(0)
        }
        let singleMatch = false
        const result: Readonly<Handle>[] = []
        // tslint:disable-next-line: no-loop-statement
        for (let i = 0; i < words.length; i += 1) {
            // Do not match the word which is already in filters.
            if (filters.includes(words[i]))
                continue
            if (singleMatch && i === words.length - 1)
                continue
            const matched = this._seek(input, [words[i]])
            if (matched.length === 0)
                continue
            singleMatch = true
            const info = matched[0]
            const base = idxBase[i]
            const t = new TargetBuilder(info)
                .matchedMap(updateMatchMap(info.matchedMap, base))
                .build()
            result.push(new HandleBuilder()
                .key(words[i])
                .target(t)
                .node(node)
                .build())
        }
        return result
    }

    private _seek(seg: string, data: readonly string[]): readonly Target[] {
        const seeker = new BaseSeekerBuilder()
            .data(data)
            .executor(this.fn)
            .caseSensitive(this.caseSentitive)
            .build()
        return seeker.seek(seg)
    }
}

export class BaseProviderBuilder extends Builder<Provider, BaseProviderImpl> {
    public constructor(obj?: Readonly<Provider>) {
        const impl = new BaseProviderImpl()
        if (obj)
            BaseProviderBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    public fn(func: Matcher): this {
        this.getImpl().fn = func

        return this
    }

    public source(source: CandidateType): this {
        this.getImpl().source = source

        return this
    }

    public filters(value: readonly Readonly<Filter>[]): this {
        this.getImpl()._filters = value
        return this
    }

    public caseSensitive(value: boolean): this {
        this.getImpl().caseSentitive = value
        return this
    }

    protected get daa(): readonly string[] {
        return BaseProviderBuilder.__DAA_PROPS__
    }

    protected static readonly __DAA_PROPS__: readonly string[] = [
        'fn',
        'source',
    ]
}

/**
 * Update the match map.
 * {1: 2, 3: 4} => base = 2 => {1: 2 + 2, 3: 4 + 2}
 *
 * Export this function only for test.
 * (TODO yiliang): Create a interface for the matchMap and then we do not need
 * this function any more.
 */
export function updateMatchMap(
    m: Map<number, number>,
    base: number,
): Map<number, number> {
    const data: (readonly [number, number])[] = []
    m.forEach((value: number, key: number): void => {
        data.push([key, value + base])
    })
    const result = new Map<number, number>()
    data.forEach((c: readonly [number, number]): void => {
        result.set(c[0], c[1])
    })
    return result
}

interface Handle {
    /**
     * When the input string is 'hr', and we match 'share holder'.
     * 'share holder' is the target and 'share' is the key(which matched 'hr').
     */
    readonly key: string
    readonly node: Readonly<Node>
    readonly target: Readonly<Target>
}

class HandleImpl implements Impl<Handle> {
    public key!: string
    public node!: Readonly<Node>
    public target!: Readonly<Target>
}

class HandleBuilder extends Builder<Handle, HandleImpl> {
    public constructor(obj?: Readonly<Handle>) {
        const impl = new HandleImpl()
        if (obj)
            HandleBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public key(key: string): this {
        this.getImpl().key = key
        return this
    }

    public node(node: Readonly<Node>): this {
        this.getImpl().node = node
        return this
    }

    public target(targets: Readonly<Target>): this {
        this.getImpl().target = targets
        return this
    }
}

function getResolvedName(name: string): string {
    if (NAME_ILLEGAL_CHAR.every(c => !name.includes(c)))
        return name
    let result = name
    NAME_ILLEGAL_CHAR.forEach((c: string): void => {
        result = result.replace(`${c}`, `\\${c}`)
    })
    return result
}

// function getUniqueLabel(nodes: readonly Readonly<Node>[]):
