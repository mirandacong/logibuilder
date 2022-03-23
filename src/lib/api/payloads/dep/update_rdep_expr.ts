import {PayloadType} from '../payload'

import {DepPayload, DepPayloadBuilder, DepPayloadImpl, DepRange} from './base'

/**
 * Update the rdep expression.
 */
export interface Payload extends DepPayload {
    readonly dep: string
    readonly ranges: readonly DepRange[]
}

class PayloadImpl extends DepPayloadImpl implements Payload {
    public dep!: string
    public ranges: readonly DepRange[] = []
    public payloadType = PayloadType.UPDATE_RDEP_EXPR
}

export class PayloadBuilder extends DepPayloadBuilder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public dep(dep: string): this {
        this.getImpl().dep = dep
        return this
    }

    public ranges(ranges: readonly DepRange[]): this {
        this.getImpl().ranges = ranges
        return this
    }

    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'dep',
        ...DepPayloadBuilder.__DAA_PROPS__,
    ]
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}

export function assertIsPayload(value: unknown): asserts value is Payload {
    if (!(value instanceof PayloadImpl))
        throw Error('Not a Payload!')
}
