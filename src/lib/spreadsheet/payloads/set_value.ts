import {Builder, CellRange, RangePayload} from './range'

export interface SetValuePayload extends RangePayload {
    readonly range: CellRange
    readonly value: unknown
}

class SetValuePayloadImpl
    extends RangePayload implements SetValuePayload {
    public range!: CellRange
    public value!: unknown
}

export class SetValuePayloadBuilder
    extends Builder<SetValuePayload, SetValuePayloadImpl> {
    public constructor(obj?: Readonly<SetValuePayload>) {
        const impl = new SetValuePayloadImpl()
        if (obj)
            SetValuePayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public range(range: CellRange): this {
        this.getImpl().range = range
        return this
    }

    public value(value: unknown): this {
        this.getImpl().value = value
        return this
    }

    protected get daa(): readonly string[] {
        return SetValuePayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'range',
        'value',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isSetValuePayload(value: unknown): value is SetValuePayload {
    return value instanceof SetValuePayloadImpl
}
