import {Impl} from '@logi/base/ts/common/mapped_types'

import {PayloadType} from '../payload'

import {Payload, PayloadBuilder, PayloadImpl} from './base'

export interface SetSizePayload extends Payload {
    readonly size: number
}

class SetSizePayloadImpl extends PayloadImpl
    implements Impl<SetSizePayload> {
    public size!: number
    public payloadType = PayloadType.SET_SIZE
}

export class SetSizePayloadBuilder extends
    PayloadBuilder<SetSizePayload, SetSizePayloadImpl> {
    public constructor(obj?: Readonly<SetSizePayload>) {
        const impl = new SetSizePayloadImpl()
        if (obj)
            SetSizePayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public size(size: number): this {
        this.getImpl().size = size
        return this
    }

    protected get daa(): readonly string[] {
        return SetSizePayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        ...PayloadBuilder.__DAA_PROPS__,
        'size',
    ]
}

export function isSetSizePayload(value: unknown): value is SetSizePayload {
    return value instanceof SetSizePayloadImpl
}

export function assertIsSetSizePayload(
    value: unknown,
): asserts value is SetSizePayload {
    if (!(value instanceof SetSizePayloadImpl))
        throw Error('Not a SetSizePayload!')
}
