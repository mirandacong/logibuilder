import {Builder, SpreadsheetPayload} from './base'

export interface SetColWidthPayload extends SpreadsheetPayload {
    readonly col: number
    readonly width: number
}

class SetColWidthPayloadImpl
    extends SpreadsheetPayload implements SetColWidthPayload {
    public col!: number
    public width!: number
}

export class SetColWidthPayloadBuilder
    extends Builder<SetColWidthPayload, SetColWidthPayloadImpl> {
    public constructor(obj?: Readonly<SetColWidthPayload>) {
        const impl = new SetColWidthPayloadImpl()
        if (obj)
            SetColWidthPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public col(col: number): this {
        this.getImpl().col = col
        return this
    }

    public width(width: number): this {
        this.getImpl().width = width
        return this
    }

    protected get daa(): readonly string[] {
        return SetColWidthPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'col',
        'width',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isSetColWidthPayload(
    value: unknown,
): value is SetColWidthPayload {
    return value instanceof SetColWidthPayloadImpl
}
