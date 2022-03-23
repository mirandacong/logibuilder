import {Builder, SpreadsheetPayload} from './base'

export interface SetRowCountPayload extends SpreadsheetPayload {
    readonly sheet: string
    readonly count: number
}

class SetRowCountPayloadImpl
    extends SpreadsheetPayload implements SetRowCountPayload {
    public sheet!: string
    public count!: number
}

export class SetRowCountPayloadBuilder
    extends Builder<SetRowCountPayload, SetRowCountPayloadImpl> {
    public constructor(obj?: Readonly<SetRowCountPayload>) {
        const impl = new SetRowCountPayloadImpl()
        if (obj)
            SetRowCountPayloadBuilder.shallowCopy(impl, obj)
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
        return SetRowCountPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'sheet',
        'count',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isSetRowCountPayload(
    value: unknown,
): value is SetRowCountPayload {
    return value instanceof SetRowCountPayloadImpl
}
