import {Modifier} from '@logi/src/lib/modifier'

import {PayloadType} from '../payload'

import {Payload, PayloadBuilder, PayloadImpl} from './base'

export interface SetModifierPayload extends Payload {
    readonly modifier: Modifier
}

class SetModifierPayloadImpl extends PayloadImpl implements SetModifierPayload {
    public modifier!: Modifier
    public payloadType = PayloadType.SET_MODIFIER
}

export class SetModifierPayloadBuilder extends
    PayloadBuilder<SetModifierPayload, SetModifierPayloadImpl> {
    public constructor(obj?: Readonly<SetModifierPayload>) {
        const impl = new SetModifierPayloadImpl()
        if (obj)
            SetModifierPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public modifier(modifier: Modifier): this {
        this.getImpl().modifier = modifier
        return this
    }

    protected get daa(): readonly string[] {
        return SetModifierPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'modifier',
    ]
}

export function isSetModifierPayload(
    value: unknown,
): value is SetModifierPayload {
    return value instanceof SetModifierPayloadImpl
}
