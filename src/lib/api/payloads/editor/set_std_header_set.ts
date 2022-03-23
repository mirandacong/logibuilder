import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {TemplateSet} from '@logi/src/lib/template'

import {Payload, PayloadType} from '../payload'

export interface SetStdHeaderSetPayload extends Payload {
    readonly templateSet: Readonly<TemplateSet>
}

class SetStdHeaderSetPayloadImpl implements Impl<SetStdHeaderSetPayload> {
    public templateSet!: Readonly<TemplateSet>
    public payloadType = PayloadType.SET_STD_HEADER_SET
}

export class SetStdHeaderSetPayloadBuilder extends
    Builder<SetStdHeaderSetPayload, SetStdHeaderSetPayloadImpl> {
    public constructor(obj?: Readonly<SetStdHeaderSetPayload>) {
        const impl = new SetStdHeaderSetPayloadImpl()
        if (obj)
            SetStdHeaderSetPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public templateSet(templateSet: Readonly<TemplateSet>): this {
        this.getImpl().templateSet = templateSet
        return this
    }

    protected get daa(): readonly string[] {
        return SetStdHeaderSetPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'templateSet',
    ]
}

export function isSetStdHeaderSetPayload(
    value: unknown,
): value is SetStdHeaderSetPayload {
    return value instanceof SetStdHeaderSetPayloadImpl
}
