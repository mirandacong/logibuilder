import {Impl} from '@logi/base/ts/common/mapped_types'

import {PayloadType} from '../payload'

import {Payload, PayloadBuilder, PayloadImpl} from './base'

export interface SetPercentPayload extends Payload {
    readonly percent: boolean
}

class SetPercentPayloadImpl extends PayloadImpl
    implements Impl<SetPercentPayload> {
    public percent!: boolean
    public payloadType = PayloadType.SET_PERCENT
}

export class SetPercentPayloadBuilder extends
    PayloadBuilder<SetPercentPayload, SetPercentPayloadImpl> {
    public constructor(obj?: Readonly<SetPercentPayload>) {
        const impl = new SetPercentPayloadImpl()
        if (obj)
            SetPercentPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public percent(percent: boolean): this {
        this.getImpl().percent = percent
        return this
    }

    protected get daa(): readonly string[] {
        return SetPercentPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        ...PayloadBuilder.__DAA_PROPS__,
        'percent',
    ]
}

export function isSetPercentPayload(
    value: unknown,
): value is SetPercentPayload {
    return value instanceof SetPercentPayloadImpl
}

export function assertIsSetPercentPayload(
    value: unknown,
): asserts value is SetPercentPayload {
    if (!(value instanceof SetPercentPayloadImpl))
        throw Error('Not a SetPercentPayload!')
}
