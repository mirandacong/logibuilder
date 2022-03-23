import {Builder, SpreadsheetPayload} from './base'

export interface RenameSheetPayload extends SpreadsheetPayload {
    readonly newName: string
}

class RenameSheetPayloadImpl
    extends SpreadsheetPayload implements RenameSheetPayload {
    public newName!: string
}

export class RenameSheetPayloadBuilder
    extends Builder<RenameSheetPayload, RenameSheetPayloadImpl> {
    public constructor(obj?: Readonly<RenameSheetPayload>) {
        const impl = new RenameSheetPayloadImpl()
        if (obj)
            RenameSheetPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public newName(newName: string): this {
        this.getImpl().newName = newName
        return this
    }

    protected get daa(): readonly string[] {
        return RenameSheetPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'newName',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isRenameSheetPayload(
    value: unknown,
): value is RenameSheetPayload {
    return value instanceof RenameSheetPayloadImpl
}
