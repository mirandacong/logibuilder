import {Impl} from '@logi/base/ts/common/mapped_types'

import {PayloadType} from '../payload'

import {Payload, PayloadBuilder, PayloadImpl} from './base'

export interface SetIndentPayload extends Payload {
    readonly indent: number
}

class SetIndentPayloadImpl extends PayloadImpl
    implements Impl<SetIndentPayload> {
    public indent!: number
    public payloadType = PayloadType.SET_INDENT
}

export class SetIndentPayloadBuilder extends
    PayloadBuilder<SetIndentPayload, SetIndentPayloadImpl> {
    public constructor(obj?: Readonly<SetIndentPayload>) {
        const impl = new SetIndentPayloadImpl()
        if (obj)
            SetIndentPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public indent(indent: number): this {
        this.getImpl().indent = indent
        return this
    }

    protected get daa(): readonly string[] {
        return SetIndentPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        ...PayloadBuilder.__DAA_PROPS__,
        'indent',
    ]
}

export function isSetIndentPayload(value: unknown): value is SetIndentPayload {
    return value instanceof SetIndentPayloadImpl
}

export function assertIsSetIndentPayload(
    value: unknown,
): asserts value is SetIndentPayload {
    if (!(value instanceof SetIndentPayloadImpl))
        throw Error('Not a SetIndentPayload!')
}
