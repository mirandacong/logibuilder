import {Impl} from '@logi/base/ts/common/mapped_types'

import {PayloadType} from '../payload'

import {Payload, PayloadBuilder, PayloadImpl} from './base'

export interface SetItalicPayload extends Payload {
    readonly italic: boolean
}

class SetItalicPayloadImpl extends PayloadImpl
    implements Impl<SetItalicPayload> {
    public italic!: boolean
    public payloadType = PayloadType.SET_ITALIC
}

export class SetItalicPayloadBuilder extends
    PayloadBuilder<SetItalicPayload, SetItalicPayloadImpl> {
    public constructor(obj?: Readonly<SetItalicPayload>) {
        const impl = new SetItalicPayloadImpl()
        if (obj)
            SetItalicPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public italic(italic: boolean): this {
        this.getImpl().italic = italic
        return this
    }

    protected get daa(): readonly string[] {
        return SetItalicPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        ...PayloadBuilder.__DAA_PROPS__,
        'italic',
    ]
}

export function isSetItalicPayload(value: unknown): value is SetItalicPayload {
    return value instanceof SetItalicPayloadImpl
}

export function assertIsSetItalicPayload(
    value: unknown,
): asserts value is SetItalicPayload {
    if (!(value instanceof SetItalicPayloadImpl))
        throw Error('Not a SetItalicPayload!')
}
