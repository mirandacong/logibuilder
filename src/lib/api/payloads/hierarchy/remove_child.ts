import {Impl} from '@logi/base/ts/common/mapped_types'
import {getSubnodes, Node} from '@logi/src/lib/hierarchy/core'

import {PayloadType} from '../payload'

import {
    Payload as Base,
    PayloadBuilder as BaseBuilder,
    PayloadImpl as BaseImpl,
} from './payload'

/**
 * DeletePayload indicating a deletion of a subnode.
 */
export interface Payload extends Base {
    readonly child: string
}

class PayloadImpl extends BaseImpl implements Impl<Payload> {
    public child!: string
    public payloadType = PayloadType.REMOVE_CHILD
}

export class PayloadBuilder extends
    BaseBuilder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public child(child: string): this {
        this.getImpl().child = child
        return this
    }

    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'child',
        ...BaseBuilder.__DAA_PROPS__,
    ]
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}

export function assertIsPayload(value: unknown): asserts value is Payload {
    if (!(value instanceof PayloadImpl))
        throw Error('Not a DeletePayload!')
}

/**
 * The handler for the payload.
 *
 * Using a function rather than a method in the Payload is to prevent the
 * frontend seeing or using this.
 */
export function removeChild(node: Readonly<Node>, child: string): void {
    const childNode =
        getSubnodes(node).find((n: Readonly<Node>): boolean => n.uuid === child)
    if (childNode === undefined)
        return
    node.deleteSubnode(childNode)
}
