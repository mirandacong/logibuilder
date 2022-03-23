import {Builder, CellRange, RangePayload} from './range'

export interface MergePayload extends RangePayload {
    readonly range: CellRange
    readonly merge: boolean
}

class MergePayloadImpl
    extends RangePayload implements MergePayload {
    public range!: CellRange
    public merge!: boolean
}

export class MergePayloadBuilder
    extends Builder<MergePayload, MergePayloadImpl> {
    public constructor(obj?: Readonly<MergePayload>) {
        const impl = new MergePayloadImpl()
        if (obj)
            MergePayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public range(range: CellRange): this {
        this.getImpl().range = range
        return this
    }

    public merge(merge: boolean): this {
        this.getImpl().merge = merge
        return this
    }

    protected get daa(): readonly string[] {
        return MergePayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'range',
        'merge',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isMergePayload(value: unknown): value is MergePayload {
    return value instanceof MergePayloadImpl
}
