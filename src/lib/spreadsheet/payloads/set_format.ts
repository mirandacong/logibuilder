import {Builder, CellRange, RangePayload} from './range'

export interface SetFormatPayload extends RangePayload {
    readonly range: CellRange
    readonly format: string
}

class SetFormatPayloadImpl
    extends RangePayload implements SetFormatPayload {
    public range!: CellRange
    public format!: string
}

export class SetFormatPayloadBuilder
    extends Builder<SetFormatPayload, SetFormatPayloadImpl> {
    public constructor(obj?: Readonly<SetFormatPayload>) {
        const impl = new SetFormatPayloadImpl()
        if (obj)
            SetFormatPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public range(range: CellRange): this {
        this.getImpl().range = range
        return this
    }

    public format(format: string): this {
        this.getImpl().format = format
        return this
    }

    protected get daa(): readonly string[] {
        return SetFormatPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'range',
        'format',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isSetFormatPayload(value: unknown): value is SetFormatPayload {
    return value instanceof SetFormatPayloadImpl
}
