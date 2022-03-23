import {Impl, Writable} from '@logi/base/ts/common/mapped_types'
import {Table} from '@logi/src/lib/hierarchy/core'

import {PayloadType} from '../payload'

import {
    Payload as Base,
    PayloadBuilder as BaseBuilder,
    PayloadImpl as BaseImpl,
} from './payload'

/**
 * Indicating a update on the header stub.
 */
export interface Payload extends Base {
    readonly stub: string
}

class PayloadImpl extends BaseImpl implements Impl<Payload> {
    public stub!: string
    public payloadType = PayloadType.SET_HEADER_STUB
}

export class PayloadBuilder extends BaseBuilder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public stub(stub: string): this {
        this.getImpl().stub = stub
        return this
    }

    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'stub',
        ...BaseBuilder.__DAA_PROPS__,
    ]
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}

/**
 * The hander for this payload.
 */
export function setHeader(node: Readonly<Table>, stub: string): void {
    // tslint:disable-next-line: no-type-assertion
    const writable = node as Writable<Table>
    writable.headerStub = stub
}
