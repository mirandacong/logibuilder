import {Source} from '@logi/src/lib/source'

import {PayloadType} from '../payload'

import {
    Payload as Base,
    PayloadBuilder as BaseBuilder,
    PayloadImpl as BaseImpl,
} from './payload'

export interface Payload extends Base {
    readonly source: Source
}

class PayloadImpl extends BaseImpl implements Payload {
    public source!: Source
    public payloadType = PayloadType.SET_IN_PLAYGROUND
}

export class PayloadBuilder extends BaseBuilder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public source(source: Source): this {
        this.getImpl().source = source
        return this
    }

    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'source',
    ]
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}
