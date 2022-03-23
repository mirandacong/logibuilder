import {Impl} from '@logi/base/ts/common/mapped_types'

import {PayloadType} from '../payload'

import {Payload, PayloadBuilder, PayloadImpl} from './base'

export interface SetBoldPayload extends Payload {
    readonly bold: boolean
}

class SetBoldPayloadImpl extends PayloadImpl
    implements Impl<SetBoldPayload> {
    public bold!: boolean
    public payloadType = PayloadType.SET_BOLD
}

export class SetBoldPayloadBuilder extends
    PayloadBuilder<SetBoldPayload, SetBoldPayloadImpl> {
    public constructor(obj?: Readonly<SetBoldPayload>) {
        const impl = new SetBoldPayloadImpl()
        if (obj)
            SetBoldPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public bold(bold: boolean): this {
        this.getImpl().bold = bold
        return this
    }

    protected get daa(): readonly string[] {
        return SetBoldPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        ...PayloadBuilder.__DAA_PROPS__,
        'bold',
    ]
}

export function isSetBoldPayload(value: unknown): value is SetBoldPayload {
    return value instanceof SetBoldPayloadImpl
}

export function assertIsSetBoldPayload(
    value: unknown,
): asserts value is SetBoldPayload {
    if (!(value instanceof SetBoldPayloadImpl))
        throw Error('Not a SetBoldPayload!')
}
