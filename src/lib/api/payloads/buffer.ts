import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {ProducerVersion} from '@logi/base/ts/common/version'

import {Payload, PayloadType} from './payload'

/**
 * Ask the BufferPlugin to encode the model and emits it.
 * Used in the connection among multi-windows.
 */
export interface BufferPayload extends Payload {
    readonly version: ProducerVersion
}

class BufferPayloadImpl implements Impl<BufferPayload> {
    public version!: ProducerVersion
    public payloadType = PayloadType.BUFFER
}

export class BufferPayloadBuilder extends
    Builder<BufferPayload, BufferPayloadImpl> {
    public constructor(obj?: Readonly<BufferPayload>) {
        const impl = new BufferPayloadImpl()
        if (obj)
            BufferPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public version(version: ProducerVersion): this {
        this.getImpl().version = version
        return this
    }

    protected get daa(): readonly string[] {
        return BufferPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['version']
}

export function isBufferPayload(value: unknown): value is BufferPayload {
    return value instanceof BufferPayloadImpl
}

export function assertIsBufferPayload(
    value: unknown,
): asserts value is BufferPayload {
    if (!(value instanceof BufferPayloadImpl))
        throw Error('Not a BufferPayload!')
}
