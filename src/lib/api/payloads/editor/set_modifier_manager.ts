import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {ModifierManager} from '@logi/src/lib/modifier'

import {Payload, PayloadType} from '../payload'

export interface SetModifierManagerPayload extends Payload {
    readonly modifierManager: ModifierManager
}

class SetModifierManagerPayloadImpl implements Impl<SetModifierManagerPayload> {
    public modifierManager!: ModifierManager
    public payloadType = PayloadType.SET_MODIFIER_MANAGER
}

export class SetModifierManagerPayloadBuilder extends
    Builder<SetModifierManagerPayload, SetModifierManagerPayloadImpl> {
    public constructor(obj?: Readonly<SetModifierManagerPayload>) {
        const impl = new SetModifierManagerPayloadImpl()
        if (obj)
            SetModifierManagerPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public modifierManager(modifierManager: ModifierManager): this {
        this.getImpl().modifierManager = modifierManager
        return this
    }

    protected get daa(): readonly string[] {
        return SetModifierManagerPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'modifierManager',
    ]
}

export function isSetModifierManagerPayload(
    value: unknown,
): value is SetModifierManagerPayload {
    return value instanceof SetModifierManagerPayloadImpl
}

export function assertIsSetModifierManagerPayload(
    value: unknown,
): asserts value is SetModifierManagerPayload {
    if (!(value instanceof SetModifierManagerPayloadImpl))
        throw Error('Not a SetModifierManagerPayload!')
}
