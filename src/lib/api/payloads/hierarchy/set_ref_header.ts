import {Impl, Writable} from '@logi/base/ts/common/mapped_types'
import {Table} from '@logi/src/lib/hierarchy/core'

import {PayloadType} from '../payload'

import {
    Payload as Base,
    PayloadBuilder as BaseBuilder,
    PayloadImpl as BaseImpl,
} from './payload'

/**
 * Indicating a updating on the reference header
 */
export interface Payload extends Base {
    readonly referenceHeader: string | undefined
}

class PayloadImpl extends BaseImpl implements Impl<Payload> {
    public referenceHeader!: string | undefined
    public payloadType = PayloadType.SET_REF_HEADER
}

export class PayloadBuilder extends BaseBuilder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    // tslint:disable-next-line: no-optional-parameter
    public referenceHeader(referenceHeader?: string): this {
        this.getImpl().referenceHeader = referenceHeader
        return this
    }

    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'referenceHeader',
        ...BaseBuilder.__DAA_PROPS__,
    ]
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}

/**
 * The handler for this paylaod.
 */
export function setRefHeader(
    node: Readonly<Table>,
    referenceHeader?: string,
): void {
    // tslint:disable-next-line: no-type-assertion
    const writable = node as Writable<Table>
    writable.referenceHeader = referenceHeader
}
