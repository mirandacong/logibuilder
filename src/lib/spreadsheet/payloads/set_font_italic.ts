import {Builder, CellRange, RangePayload} from './range'

export interface SetFontItalicPayload extends RangePayload {
    readonly range: CellRange
    readonly italic: boolean
}

class SetFontItalicPayloadImpl
    extends RangePayload implements SetFontItalicPayload {
    public range!: CellRange
    public italic!: boolean
}

export class SetFontItalicPayloadBuilder
    extends Builder<SetFontItalicPayload, SetFontItalicPayloadImpl> {
    public constructor(obj?: Readonly<SetFontItalicPayload>) {
        const impl = new SetFontItalicPayloadImpl()
        if (obj)
            SetFontItalicPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public range(range: CellRange): this {
        this.getImpl().range = range
        return this
    }

    public italic(italic: boolean): this {
        this.getImpl().italic = italic
        return this
    }

    protected get daa(): readonly string[] {
        return SetFontItalicPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'range',
        'italic',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isSetFontItalicPayload(
    value: unknown,
): value is SetFontItalicPayload {
    return value instanceof SetFontItalicPayloadImpl
}
