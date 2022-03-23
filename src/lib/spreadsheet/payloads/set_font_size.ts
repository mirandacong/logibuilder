import {Builder, CellRange, RangePayload} from './range'

export interface SetFontSizePayload extends RangePayload {
    readonly range: CellRange
    readonly size: number
}

class SetFontSizePayloadImpl
    extends RangePayload implements SetFontSizePayload {
    public range!: CellRange
    public size!: number
}

export class SetFontSizePayloadBuilder
    extends Builder<SetFontSizePayload, SetFontSizePayloadImpl> {
    public constructor(obj?: Readonly<SetFontSizePayload>) {
        const impl = new SetFontSizePayloadImpl()
        if (obj)
            SetFontSizePayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public range(range: CellRange): this {
        this.getImpl().range = range
        return this
    }

    public size(size: number): this {
        this.getImpl().size = size
        return this
    }

    protected get daa(): readonly string[] {
        return SetFontSizePayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'range',
        'size',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isSetFontSizePayload(
    value: unknown,
): value is SetFontSizePayload {
    return value instanceof SetFontSizePayloadImpl
}
