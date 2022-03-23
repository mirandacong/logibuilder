import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Payload, PayloadType} from '../payload'

import {HistoryType} from './type'

export interface RedoPayload extends Payload {
    readonly redoPlugin: HistoryType
}

class RedoPayloadImpl implements Impl<RedoPayload> {
    public redoPlugin!: HistoryType
    public payloadType = PayloadType.REDO
}

export class RedoPayloadBuilder extends Builder<RedoPayload, RedoPayloadImpl> {
    public constructor(obj?: Readonly<RedoPayload>) {
        const impl = new RedoPayloadImpl()
        if (obj)
            RedoPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public redoPlugin(redoPlugin: HistoryType): this {
        this.getImpl().redoPlugin = redoPlugin
        return this
    }

    protected get daa(): readonly string[] {
        return RedoPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['redoPlugin']
}

export function isRedoPayload(value: unknown): value is RedoPayload {
    return value instanceof RedoPayloadImpl
}

export function assertIsRedoPayload(
    value: unknown,
): asserts value is RedoPayload {
    if (!(value instanceof RedoPayloadImpl))
        throw Error('Not a RedoPayload!')
}
