import {Builder, CellRange, RangePayload} from './range'

export interface SetBackColorPayload extends RangePayload {
    readonly range: CellRange
    readonly color: string
}

class SetBackColorPayloadImpl
    extends RangePayload implements SetBackColorPayload {
    public range!: CellRange
    public color!: string
}

export class SetBackColorPayloadBuilder extends
    Builder<SetBackColorPayload, SetBackColorPayloadImpl> {
    public constructor(obj?: Readonly<SetBackColorPayload>) {
        const impl = new SetBackColorPayloadImpl()
        if (obj)
            SetBackColorPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public range(range: CellRange): this {
        this.getImpl().range = range
        return this
    }

    public color(color: string): this {
        this.getImpl().color = color
        return this
    }

    protected get daa(): readonly string[] {
        return SetBackColorPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'range',
        'color',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isSetBackColorPayload(
    value: unknown,
): value is SetBackColorPayload {
    return value instanceof SetBackColorPayloadImpl
}
