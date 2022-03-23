import {Builder, CellRange, RangePayload} from './range'

export interface SetFontColorPayload extends RangePayload {
    readonly range: CellRange
    readonly color: string
}

class SetFontColorPayloadImpl
    extends RangePayload implements SetFontColorPayload {
    public range!: CellRange
    public color!: string
}

export class SetFontColorPayloadBuilder
    extends Builder<SetFontColorPayload, SetFontColorPayloadImpl> {
    public constructor(obj?: Readonly<SetFontColorPayload>) {
        const impl = new SetFontColorPayloadImpl()
        if (obj)
            SetFontColorPayloadBuilder.shallowCopy(impl, obj)
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
        return SetFontColorPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'range',
        'color',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isSetFontColorPayload(
    value: unknown,
): value is SetFontColorPayload {
    return value instanceof SetFontColorPayloadImpl
}
