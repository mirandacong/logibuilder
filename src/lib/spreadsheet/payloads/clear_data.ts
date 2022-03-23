import {Builder, CellRange, RangePayload} from './range'

export interface ClearDataPayload extends RangePayload {
    readonly range: CellRange
}

class ClearDataPayloadImpl
    extends RangePayload implements ClearDataPayload {
    public range!: CellRange
}

export class ClearDataPayloadBuilder extends
    Builder<ClearDataPayload, ClearDataPayloadImpl> {
    public constructor(obj?: Readonly<ClearDataPayload>) {
        const impl = new ClearDataPayloadImpl()
        if (obj)
            ClearDataPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public range(range: CellRange): this {
        this.getImpl().range = range
        return this
    }

    protected get daa(): readonly string[] {
        return ClearDataPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'range',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isClearDataPayload(value: unknown): value is ClearDataPayload {
    return value instanceof ClearDataPayloadImpl
}
