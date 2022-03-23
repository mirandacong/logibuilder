import {Builder, CellRange, RangePayload} from './range'

export interface SetFontFamilyPayload extends RangePayload {
    readonly range: CellRange
    readonly family: string
}

class SetFontFamilyPayloadImpl
    extends RangePayload implements SetFontFamilyPayload {
    public range!: CellRange
    public family!: string
}

export class SetFontFamilyPayloadBuilder
    extends Builder<SetFontFamilyPayload, SetFontFamilyPayloadImpl> {
    public constructor(obj?: Readonly<SetFontFamilyPayload>) {
        const impl = new SetFontFamilyPayloadImpl()
        if (obj)
            SetFontFamilyPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public range(range: CellRange): this {
        this.getImpl().range = range
        return this
    }

    public family(family: string): this {
        this.getImpl().family = family
        return this
    }

    protected get daa(): readonly string[] {
        return SetFontFamilyPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'range',
        'family',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isSetFontFamilyPayload(
    value: unknown,
): value is SetFontFamilyPayload {
    return value instanceof SetFontFamilyPayloadImpl
}
