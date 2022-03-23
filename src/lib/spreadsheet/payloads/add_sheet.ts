import {Builder, SpreadsheetPayload} from './base'

export interface AddSheetPayload extends SpreadsheetPayload {
    readonly position: number
}

class AddSheetPayloadImpl
    extends SpreadsheetPayload implements AddSheetPayload {
    public position!: number
}

export class AddSheetPayloadBuilder
    extends Builder<AddSheetPayload, AddSheetPayloadImpl> {
    public constructor(obj?: Readonly<AddSheetPayload>) {
        const impl = new AddSheetPayloadImpl()
        if (obj)
            AddSheetPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public position(position: number): this {
        this.getImpl().position = position
        return this
    }

    protected get daa(): readonly string[] {
        return AddSheetPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'position',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isAddSheetPayload(value: unknown): value is AddSheetPayload {
    return value instanceof AddSheetPayloadImpl
}
