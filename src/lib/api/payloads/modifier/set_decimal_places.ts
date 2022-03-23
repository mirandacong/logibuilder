import {Impl} from '@logi/base/ts/common/mapped_types'

import {PayloadType} from '../payload'

import {Payload, PayloadBuilder, PayloadImpl} from './base'

export interface SetDecimalPlacesPayload extends Payload {
    readonly decimalPlaces: number
}

class SetDecimalPlacesPayloadImpl extends PayloadImpl
    implements Impl<SetDecimalPlacesPayload> {
    public decimalPlaces!: number
    public payloadType = PayloadType.SET_DECIMAL_PLACES
}

export class SetDecimalPlacesPayloadBuilder extends
    PayloadBuilder<SetDecimalPlacesPayload, SetDecimalPlacesPayloadImpl> {
    public constructor(obj?: Readonly<SetDecimalPlacesPayload>) {
        const impl = new SetDecimalPlacesPayloadImpl()
        if (obj)
            SetDecimalPlacesPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public decimalPlaces(decimalPlaces: number): this {
        this.getImpl().decimalPlaces = decimalPlaces
        return this
    }

    protected get daa(): readonly string[] {
        return SetDecimalPlacesPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        ...PayloadBuilder.__DAA_PROPS__,
        'decimalPlaces',
    ]
}

export function isSetDecimalPlacesPayload(
    value: unknown,
): value is SetDecimalPlacesPayload {
    return value instanceof SetDecimalPlacesPayloadImpl
}

export function assertIsSetDecimalPlacesPayload(
    value: unknown,
): asserts value is SetDecimalPlacesPayload {
    if (!(value instanceof SetDecimalPlacesPayloadImpl))
        throw Error('Not a SetDecimalPlacesPayload!')
}
