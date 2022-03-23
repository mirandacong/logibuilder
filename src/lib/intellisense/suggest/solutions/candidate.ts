import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Node} from '@logi/src/lib/hierarchy/core'
import {ViewPart} from '@logi/src/lib/intellisense/editor/display'

import {Filter} from './filter'

/**
 * A group of candidates who pass the filters.
 */
export interface CandidateGroup {
    readonly filters: readonly Readonly<Filter>[]
    readonly members: readonly Readonly<Candidate>[]
}

class CandidateGroupImpl implements Impl<CandidateGroup> {
    public filters!: readonly Readonly<Filter>[]
    public members: readonly Readonly<Candidate>[] = []
}

export class CandidateGroupBuilder extends
    Builder<CandidateGroup, CandidateGroupImpl> {
    public constructor(obj?: Readonly<CandidateGroup>) {
        const impl = new CandidateGroupImpl()
        if (obj)
            CandidateGroupBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public filters(filters: readonly Readonly<Filter>[]): this {
        this.getImpl().filters = filters
        return this
    }

    public members(members: readonly Readonly<Candidate>[]): this {
        this.getImpl().members = members
        return this
    }

    protected get daa(): readonly string[] {
        return CandidateGroupBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'filters',
        'members',
    ]
}

export function isCandidateGroup(obj: unknown): obj is CandidateGroup {
    return obj instanceof CandidateGroupImpl
}

/**
 * The auto-complete suggestions we provide to users.
 */
export interface Candidate {
    /**
     * The representation of this candidate in the auto-complete box.
     */
    readonly view: readonly ViewPart[]

    /**
     * Help to findout the cursor location after selecting this candidate.
     */
    readonly cursorOffset: number

    /**
     * Indicate where this candidate is from and help user select the right one.
     */
    readonly source: CandidateType

    /**
     * The prefix string before the updateText.
     */
    readonly prefix: string

    /**
     * Signify the whole string shows in the simple-editor.
     */
    readonly updateText: string

    /**
     * The suffix string before the updateText.
     */
    readonly suffix: string

    /**
     * The original text that causes this candidate.
     */
    readonly from: string

    /**
     * Other information for helping sort or group the candidates.
     * It is expected that using this field only in intellisense.
     */
    readonly handle?: CandidateHandle
}

/**
 * Indicate the source of the candidates to help user choose the one they want.
 */
export const enum CandidateType {
    /**
     * This candidate is from user defined refnames in current hierarchy book.
     */
    REFNAME,

    /**
     * This candidate is from dictionaries containing frequently-used words.
     */
    DICT,

    /**
     * This candidate is from function names like `average`.
     */
    FUNCTION_NAME,

    /**
     * This candidate is from a selection, which is likely a refname or label
     * of Column or ColumnBlock.
     */
    SELECTION,

    /**
     * Used in multi-stage suggestion.
     * Only used in intellisens.
     */
    PROCESS_PATH,

    /**
     * Used in multi-stage suggestion.
     * Only used in intellisens.
     */
    PROCESS_SELECTION,
    KEYWORD,
}

// tslint:disable-next-line: max-classes-per-file
export class CandidateBuilder extends Builder<Candidate, CandidateImpl> {
    public constructor(obj?: Readonly<Candidate>) {
        const impl = new CandidateImpl()
        if (obj)
            CandidateBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public view(view: readonly ViewPart[]): this {
        this.getImpl().view = view

        return this
    }

    public cursorOffest(cursorOffset: number): this {
        this.getImpl().cursorOffset = cursorOffset

        return this
    }

    public source(source: CandidateType): this {
        this.getImpl().source = source
        return this
    }

    public prefix(value: string): this {
        this.getImpl().prefix = value
        return this
    }

    public updateText(value: string): this {
        this.getImpl().updateText = value
        return this
    }

    public suffix(value: string): this {
        this.getImpl().suffix = value
        return this
    }

    public handle(value: CandidateHandle): this {
        this.getImpl().handle = value
        return this
    }

    public from(value: string): this {
        this.getImpl().from = value
        return this
    }

    protected get daa(): readonly string[] {
        return CandidateBuilder.__DAA_PROPS__
    }

    protected static readonly __DAA_PROPS__: readonly string[] = [
        'source',
        'view',
        'cursorOffset',
    ]
}

export function isCandidate(obj: unknown): obj is Candidate {
    return obj instanceof CandidateImpl
}

// tslint:disable-next-line: max-classes-per-file
class CandidateImpl implements Candidate {
    public view!: readonly ViewPart[]
    public cursorOffset = 0
    public prefix = ''
    public updateText = ''
    public suffix = ''
    public source!: CandidateType
    public handle?: CandidateHandle
    public from = ''
}

/**
 * The information helping us to handle the candidates like `sort` or `group`.
 */
export interface CandidateHandle {
    /**
     * The hierarchy node which this candidate stands for.
     *
     * We use it for sort the candidates according the distance between nodes.
     */
    readonly base?: Readonly<Node>
    readonly nodes: readonly Readonly<Node>[]

    /**
     * The key helps us to group the candidates.
     */
    readonly groupByKey: string
}

class CandidateHandleImpl implements Impl<CandidateHandle> {
    public base?: Readonly<Node>
    public nodes: readonly Readonly<Node>[] = []
    public groupByKey?: string
}

// tslint:disable-next-line: max-classes-per-file
export class CandidateHandleBuilder extends
    Builder<CandidateHandle, CandidateHandleImpl> {
    public constructor(obj?: Readonly<CandidateHandle>) {
        const impl = new CandidateHandleImpl()
        if (obj)
            CandidateHandleBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public nodes(nodes: readonly Readonly<Node>[]): this {
        this.getImpl().nodes = nodes
        return this
    }

    public groupByKey(groupByKey: string): this {
        this.getImpl().groupByKey = groupByKey
        return this
    }

    public base(base?: Readonly<Node>): this {
        this.getImpl().base = base
        return this
    }
}
