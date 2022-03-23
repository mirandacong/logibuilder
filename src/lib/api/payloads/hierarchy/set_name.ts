import {Impl, Writable} from '@logi/base/ts/common/mapped_types'
import {Node} from '@logi/src/lib/hierarchy/core'

import {PayloadType} from '../payload'

import {
    Payload as Base,
    PayloadBuilder as BaseBuilder,
    PayloadImpl as BaseImpl,
} from './payload'

/**
 * Indicating a payload to rename a node.
 */
export interface Payload extends Base {
    readonly name: string
}

class PayloadImpl extends BaseImpl implements Impl<Payload> {
    public name!: string
    public payloadType = PayloadType.SET_NAME
}

export class PayloadBuilder extends BaseBuilder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'name',
        ...BaseBuilder.__DAA_PROPS__,
    ]
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}

/**
 * The handler for this payload.
 */
export function setName(node: Readonly<Node>, name: string): void {
    // tslint:disable-next-line: no-type-assertion
    const writable = node as Writable<Node>
    writable.name = name
}
