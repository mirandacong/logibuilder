import {Impl} from '@logi/base/ts/common/mapped_types'
import {Currency} from '@logi/src/lib/modifier'

import {PayloadType} from '../payload'

import {Payload, PayloadBuilder, PayloadImpl} from './base'

export interface SetCurrencyPayload extends Payload {
    readonly currency: Currency
}

class SetCurrencyPayloadImpl extends PayloadImpl
    implements Impl<SetCurrencyPayload> {
    public currency!: Currency
    public payloadType = PayloadType.SET_CURRENCY
}

export class SetCurrencyPayloadBuilder extends
    PayloadBuilder<SetCurrencyPayload, SetCurrencyPayloadImpl> {
    public constructor(obj?: Readonly<SetCurrencyPayload>) {
        const impl = new SetCurrencyPayloadImpl()
        if (obj)
            SetCurrencyPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public currency(currency: Currency): this {
        this.getImpl().currency = currency
        return this
    }

    protected get daa(): readonly string[] {
        return SetCurrencyPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        ...PayloadBuilder.__DAA_PROPS__,
        'currency',
    ]
}

export function isSetCurrencyPayload(
    value: unknown,
): value is SetCurrencyPayload {
    return value instanceof SetCurrencyPayloadImpl
}

export function assertIsSetCurrencyPayload(
    value: unknown,
): asserts value is SetCurrencyPayload {
    if (!(value instanceof SetCurrencyPayloadImpl))
        throw Error('Not a SetCurrencyPayload!')
}
