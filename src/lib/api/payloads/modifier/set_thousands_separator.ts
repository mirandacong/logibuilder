import {Impl} from '@logi/base/ts/common/mapped_types'

import {PayloadType} from '../payload'

import {Payload, PayloadBuilder, PayloadImpl} from './base'

export interface SetThousandsSeparatorPayload extends Payload {
    readonly thousandsSeparator: boolean
}

class SetThousandsSeparatorPayloadImpl extends PayloadImpl
    implements Impl<SetThousandsSeparatorPayload> {
    public thousandsSeparator!: boolean
    public payloadType = PayloadType.SET_THOUSANDS_SEPARATOR
}

export class SetThousandsSeparatorPayloadBuilder extends PayloadBuilder<
    SetThousandsSeparatorPayload, SetThousandsSeparatorPayloadImpl> {
    public constructor(obj?: Readonly<SetThousandsSeparatorPayload>) {
        const impl = new SetThousandsSeparatorPayloadImpl()
        if (obj)
            SetThousandsSeparatorPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public thousandsSeparator(thousandsSeparator: boolean): this {
        this.getImpl().thousandsSeparator = thousandsSeparator
        return this
    }

    protected get daa(): readonly string[] {
        return SetThousandsSeparatorPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        ...PayloadBuilder.__DAA_PROPS__,
        'thousandsSeparator',
    ]
}

export function isSetThousandsSeparatorPayload(
    value: unknown,
): value is SetThousandsSeparatorPayload {
    return value instanceof SetThousandsSeparatorPayloadImpl
}

export function assertIsSetThousandsSeparatorPayload(
    value: unknown,
): asserts value is SetThousandsSeparatorPayload {
    if (!(value instanceof SetThousandsSeparatorPayloadImpl))
        throw Error('Not a SetThousandsSeparatorPayload!')
}
