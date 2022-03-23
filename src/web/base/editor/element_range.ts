import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export interface ElementRange {
    readonly start: number
    readonly end: number
}

class ElementRangeImpl implements Impl<ElementRange> {
    public start!: number
    public end!: number
}

export class ElementRangeBuilder
extends Builder<ElementRange, ElementRangeImpl> {
    public constructor(obj?: Readonly<ElementRange>) {
        const impl = new ElementRangeImpl()
        if (obj)
            ElementRangeBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public start(start: number): this {
        this.getImpl().start = start
        return this
    }

    public end(end: number): this {
        this.getImpl().end = end
        return this
    }

    protected get daa(): readonly string[] {
        return ElementRangeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] =
        ['start', 'end']
}

export function isElementRange(obj: object): obj is ElementRange {
    return obj instanceof ElementRangeImpl
}
