import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

/**
 * TODO(minglong): merge range.ts and element_range.ts
 */
export interface Selection {
    readonly node: Node
    readonly offset: number
}

class SelectionImpl implements Impl<Selection> {
    public node!: Node
    public offset!: number
}

export class SelectionBuilder extends Builder<Selection, SelectionImpl> {
    public constructor(obj?: Readonly<Selection>) {
        const impl = new SelectionImpl()
        if (obj)
            SelectionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public node(node: Node): this {
        this.getImpl().node = node
        return this
    }

    public offset(offset: number): this {
        this.getImpl().offset = offset
        return this
    }

    protected get daa(): readonly string[] {
        return SelectionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'node',
        'offset',
    ]
}

export function isSelection(value: unknown): value is Selection {
    return value instanceof SelectionImpl
}

export function assertIsSelection(value: unknown): asserts value is Selection {
    if (!(value instanceof SelectionImpl))
        throw Error('Not a Selection!')
}

export interface ElementRange {
    readonly start: Selection
    readonly end: Selection
}

class ElementRangeImpl implements Impl<ElementRange> {
    public start!: Selection
    public end!: Selection
}

export class ElementRangeBuilder extends Builder<ElementRange, ElementRangeImpl> {
    public constructor(obj?: Readonly<ElementRange>) {
        const impl = new ElementRangeImpl()
        if (obj)
            ElementRangeBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public start(start: Selection): this {
        this.getImpl().start = start
        return this
    }

    public end(end: Selection): this {
        this.getImpl().end = end
        return this
    }

    protected get daa(): readonly string[] {
        return ElementRangeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'start',
        'end',
    ]
}

export function isElementRange(value: unknown): value is ElementRange {
    return value instanceof ElementRangeImpl
}

export function assertIsElementRange(
    value: unknown,
): asserts value is ElementRange {
    if (!(value instanceof ElementRangeImpl))
        throw Error('Not a ElementRange!')
}
