import {Builder, SpreadsheetPayload} from './base'
export interface SetCellOverflowPayload extends SpreadsheetPayload {
    readonly allow: boolean
}

class SetCellOverflowPayloadImpl
    extends SpreadsheetPayload implements SetCellOverflowPayload {
    public allow!: boolean
}

export class SetCellOverflowPayloadBuilder
    extends Builder<SetCellOverflowPayload, SetCellOverflowPayloadImpl> {
    public constructor(obj?: Readonly<SetCellOverflowPayload>) {
        const impl = new SetCellOverflowPayloadImpl()
        if (obj)
            SetCellOverflowPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public allow(allow: boolean): this {
        this.getImpl().allow = allow
        return this
    }

    protected get daa(): readonly string[] {
        return SetCellOverflowPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'allow',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isSetCellOverflowPayload(
    value: unknown,
): value is SetCellOverflowPayload {
    return value instanceof SetCellOverflowPayloadImpl
}
