import {Builder, SpreadsheetPayload} from './base'

export interface AddRowPayload extends SpreadsheetPayload {
    readonly row: number
    readonly count: number
}

class AddRowPayloadImpl extends SpreadsheetPayload implements AddRowPayload {
    public row!: number
    public count!: number
}

export class AddRowPayloadBuilder
    extends Builder<AddRowPayload, AddRowPayloadImpl> {
    public constructor(obj?: Readonly<AddRowPayload>) {
        const impl = new AddRowPayloadImpl()
        if (obj)
            AddRowPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: number): this {
        this.getImpl().row = row
        return this
    }

    public count(count: number): this {
        this.getImpl().count = count
        return this
    }

    protected get daa(): readonly string[] {
        return AddRowPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'count',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isAddRowPayload(value: unknown): value is AddRowPayload {
    return value instanceof AddRowPayloadImpl
}
