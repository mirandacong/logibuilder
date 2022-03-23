import {Builder, SpreadsheetPayload} from './base'

export interface SetColCountPayload extends SpreadsheetPayload {
    readonly sheet: string
    readonly count: number
}

class SetColCountPayloadImpl
    extends SpreadsheetPayload implements SetColCountPayload {
    public sheet!: string
    public count!: number
}

export class SetColCountPayloadBuilder
    extends Builder<SetColCountPayload, SetColCountPayloadImpl> {
    public constructor(obj?: Readonly<SetColCountPayload>) {
        const impl = new SetColCountPayloadImpl()
        if (obj)
            SetColCountPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public sheet(sheet: string): this {
        this.getImpl().sheet = sheet
        return this
    }

    public count(count: number): this {
        this.getImpl().count = count
        return this
    }

    protected get daa(): readonly string[] {
        return SetColCountPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'sheet',
        'count',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isSetColCountPayload(
    value: unknown,
): value is SetColCountPayload {
    return value instanceof SetColCountPayloadImpl
}
