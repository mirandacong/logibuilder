import {Builder, SpreadsheetPayload} from './base'

// tslint:disable-next-line: no-empty-interface
export interface RemoveSheetPayload extends SpreadsheetPayload {}

// tslint:disable-next-line: no-empty-class
class RemoveSheetPayloadImpl
    extends SpreadsheetPayload implements RemoveSheetPayload {}

export class RemoveSheetPayloadBuilder
    extends Builder<RemoveSheetPayload, RemoveSheetPayloadImpl> {
    public constructor(obj?: Readonly<RemoveSheetPayload>) {
        const impl = new RemoveSheetPayloadImpl()
        if (obj)
            RemoveSheetPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    protected get daa(): readonly string[] {
        return RemoveSheetPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        ...Builder.__DAA_PROPS__,
    ]
}

export function isRemoveSheetPayload(
    value: unknown,
): value is RemoveSheetPayload {
    return value instanceof RemoveSheetPayloadImpl
}
