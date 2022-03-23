import {Builder, CellRange, RangePayload} from './range'

export interface SetFontPayload extends RangePayload {
    readonly range: CellRange
    readonly bold: boolean
    readonly italic: boolean
    readonly size: number
    readonly family: string
}

class SetFontPayloadImpl extends RangePayload implements SetFontPayload {
    public range!: CellRange
    public bold = false
    public italic = false
    public size!: number
    public family!: string
}

export class SetFontPayloadBuilder
    extends Builder<SetFontPayload, SetFontPayloadImpl> {
    public constructor(obj?: Readonly<SetFontPayload>) {
        const impl = new SetFontPayloadImpl()
        if (obj)
            SetFontPayloadBuilder.shallowCopy(impl, obj)
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

    public italic(italic: boolean): this {
        this.getImpl().italic = italic
        return this
    }

    public size(size: number): this {
        this.getImpl().size = size
        return this
    }

    public family(family: string): this {
        this.getImpl().family = family
        return this
    }

    protected get daa(): readonly string[] {
        return SetFontPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'range',
        'bold',
        'italic',
        'size',
        'family',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isSetFontPayload(value: unknown): value is SetFontPayload {
    return value instanceof SetFontPayloadImpl
}
