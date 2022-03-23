import {Builder} from '@logi/base/ts/common/builder'

import {PayloadType} from '../payload'

import {SheetPayload} from './payload'

export interface RemoveSheetPayload extends SheetPayload {
    readonly name: string
    readonly index: number
}

class RemoveSheetPayloadImpl
    extends SheetPayload implements RemoveSheetPayload {
    public name!: string
    public index!: number
    public payloadType = PayloadType.REMOVE_SHEET
}

export class RemoveSheetPayloadBuilder extends
    Builder<RemoveSheetPayload, RemoveSheetPayloadImpl> {
    public constructor(obj?: Readonly<RemoveSheetPayload>) {
        const impl = new RemoveSheetPayloadImpl()
        if (obj)
            RemoveSheetPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public index(index: number): this {
        this.getImpl().index = index
        return this
    }

    protected get daa(): readonly string[] {
        return RemoveSheetPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'name',
        'index',
    ]
}

export function isRemoveSheetPayload(
    value: unknown,
): value is RemoveSheetPayload {
    return value instanceof RemoveSheetPayloadImpl
}
