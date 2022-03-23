import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Payload, PayloadType} from '../payload'

import {HistoryType} from './type'

export interface UndoPayload extends Payload {
    readonly undoPlugin: HistoryType
}

class UndoPayloadImpl implements Impl<UndoPayload> {
    public undoPlugin!: HistoryType
    public payloadType = PayloadType.UNDO
}

export class UndoPayloadBuilder extends Builder<UndoPayload, UndoPayloadImpl> {
    public constructor(obj?: Readonly<UndoPayload>) {
        const impl = new UndoPayloadImpl()
        if (obj)
            UndoPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public undoPlugin(undoPlugin: HistoryType): this {
        this.getImpl().undoPlugin = undoPlugin
        return this
    }

    protected get daa(): readonly string[] {
        return UndoPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['undoPlugin']
}

export function isUndoPayload(value: unknown): value is UndoPayload {
    return value instanceof UndoPayloadImpl
}

export function assertIsUndoPayload(
    value: unknown,
): asserts value is UndoPayload {
    if (!(value instanceof UndoPayloadImpl))
        throw Error('Not a UndoPayload!')
}
