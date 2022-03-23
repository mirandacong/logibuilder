import {Impl} from '@logi/base/ts/common/mapped_types'
import {FontFamily} from '@logi/src/lib/modifier'

import {PayloadType} from '../payload'

import {Payload, PayloadBuilder, PayloadImpl} from './base'

export interface SetFamilyPayload extends Payload {
    readonly family: FontFamily
}

class SetFamilyPayloadImpl extends PayloadImpl
    implements Impl<SetFamilyPayload> {
    public family!: FontFamily
    public payloadType = PayloadType.SET_FAMILY
}

export class SetFamilyPayloadBuilder extends
    PayloadBuilder<SetFamilyPayload, SetFamilyPayloadImpl> {
    public constructor(obj?: Readonly<SetFamilyPayload>) {
        const impl = new SetFamilyPayloadImpl()
        if (obj)
            SetFamilyPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public family(family: FontFamily): this {
        this.getImpl().family = family
        return this
    }

    protected get daa(): readonly string[] {
        return SetFamilyPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        ...PayloadBuilder.__DAA_PROPS__,
        'family',
    ]
}

export function isSetFamilyPayload(value: unknown): value is SetFamilyPayload {
    return value instanceof SetFamilyPayloadImpl
}

export function assertIsSetFamilyPayload(
    value: unknown,
): asserts value is SetFamilyPayload {
    if (!(value instanceof SetFamilyPayloadImpl))
        throw Error('Not a SetFamilyPayload!')
}
