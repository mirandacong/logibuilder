import {Impl} from '@logi/base/ts/common/mapped_types'

import {PayloadType} from '../payload'

import {DepPayload, DepPayloadBuilder, DepPayloadImpl, DepRange} from './base'

/**
 * Update the dep expression.
 */
export interface Payload extends DepPayload {
    /**
     * Fb uuid => range[start, end]
     */
    readonly depMap: readonly (readonly [string, DepRange])[]
}

class PayloadImpl extends DepPayloadImpl implements Impl<Payload> {
    public depMap: readonly (readonly [string, DepRange])[] = []
    public payloadType = PayloadType.UPDATE_DEP_EXPR
}

export class PayloadBuilder extends DepPayloadBuilder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public depMap(depMap: readonly (readonly [string, DepRange])[]): this {
        this.getImpl().depMap = depMap
        return this
    }

    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
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
