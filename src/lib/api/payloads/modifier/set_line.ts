import {Underline} from '@logi/base/ts/common/excel'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {PayloadType} from '../payload'

import {Payload, PayloadBuilder, PayloadImpl} from './base'

export interface SetLinePayload extends Payload {
    readonly line: Underline
}

class SetLinePayloadImpl extends PayloadImpl
    implements Impl<SetLinePayload> {
    public line!: Underline
    public payloadType = PayloadType.SET_LINE
}

export class SetLinePayloadBuilder extends
    PayloadBuilder<SetLinePayload, SetLinePayloadImpl> {
    public constructor(obj?: Readonly<SetLinePayload>) {
        const impl = new SetLinePayloadImpl()
        if (obj)
            SetLinePayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public line(line: Underline): this {
        this.getImpl().line = line
        return this
    }

    protected get daa(): readonly string[] {
        return SetLinePayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        ...PayloadBuilder.__DAA_PROPS__,
        'line',
    ]
}

export function isSetLinePayload(value: unknown): value is SetLinePayload {
    return value instanceof SetLinePayloadImpl
}

export function assertIsSetLinePayload(
    value: unknown,
): asserts value is SetLinePayload {
    if (!(value instanceof SetLinePayloadImpl))
        throw Error('Not a SetLinePayload!')
}
