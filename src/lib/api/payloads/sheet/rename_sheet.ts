import {Builder} from '@logi/base/ts/common/builder'

import {PayloadType} from '../payload'

import {SheetPayload} from './payload'

export interface RenameSheetPayload extends SheetPayload {
    readonly name: string
    readonly oldName: string
}

class RenameSheetPayloadImpl
    extends SheetPayload implements RenameSheetPayload {
    public name!: string
    public oldName!: string
    public payloadType = PayloadType.RENAME_SHEET
}

export class RenameSheetPayloadBuilder extends
    Builder<RenameSheetPayload, RenameSheetPayloadImpl> {
    public constructor(obj?: Readonly<RenameSheetPayload>) {
        const impl = new RenameSheetPayloadImpl()
        if (obj)
            RenameSheetPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public oldName(oldName: string): this {
        this.getImpl().oldName = oldName
        return this
    }

    protected get daa(): readonly string[] {
        return RenameSheetPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'name',
        'oldName',
    ]
}

export function isRenameSheetPayload(
    value: unknown,
): value is RenameSheetPayload {
    return value instanceof RenameSheetPayloadImpl
}
