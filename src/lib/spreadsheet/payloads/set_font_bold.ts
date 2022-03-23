import {Builder, CellRange, RangePayload} from './range'

export interface SetFontBoldPayload extends RangePayload {
    readonly range: CellRange
    readonly bold: boolean
}

class SetFontBoldPayloadImpl
    extends RangePayload implements SetFontBoldPayload {
    public range!: CellRange
    public bold!: boolean
}

export class SetFontBoldPayloadBuilder
    extends Builder<SetFontBoldPayload, SetFontBoldPayloadImpl> {
    public constructor(obj?: Readonly<SetFontBoldPayload>) {
        const impl = new SetFontBoldPayloadImpl()
        if (obj)
            SetFontBoldPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public range(range: CellRange): this {
        this.getImpl().range = range
        return this
    }

    public bold(bold: boolean): this {
        this.getImpl().bold = bold
        return this
    }

    protected get daa(): readonly string[] {
        return SetFontBoldPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'range',
        'bold',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isSetFontBoldPayload(
    value: unknown,
): value is SetFontBoldPayload {
    return value instanceof SetFontBoldPayloadImpl
}
