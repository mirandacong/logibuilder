import {Builder, CellRange, RangePayload} from './range'

export interface SetWordWrapPayload extends RangePayload {
    readonly range: CellRange
    readonly wordWrap: boolean
}

class SetWordWrapPayloadImpl
    extends RangePayload implements SetWordWrapPayload {
    public range!: CellRange
    public wordWrap!: boolean
}

export class SetWordWrapPayloadBuilder
    extends Builder<SetWordWrapPayload, SetWordWrapPayloadImpl> {
    public constructor(obj?: Readonly<SetWordWrapPayload>) {
        const impl = new SetWordWrapPayloadImpl()
        if (obj)
            SetWordWrapPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public range(range: CellRange): this {
        this.getImpl().range = range
        return this
    }

    public wordWrap(wordWrap: boolean): this {
        this.getImpl().wordWrap = wordWrap
        return this
    }

    protected get daa(): readonly string[] {
        return SetWordWrapPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'range',
        'wordWrap',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isSetWordWrapPayload(
    value: unknown,
): value is SetWordWrapPayload {
    return value instanceof SetWordWrapPayloadImpl
}
