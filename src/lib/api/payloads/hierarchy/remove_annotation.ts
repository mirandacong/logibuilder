import {Impl} from '@logi/base/ts/common/mapped_types'
import {AnnotationKey, Node} from '@logi/src/lib/hierarchy/core'

import {PayloadType} from '../payload'

import {
    Payload as Base,
    PayloadBuilder as BaseBuilder,
    PayloadImpl as BaseImpl,
} from './payload'

/**
 * Set annotation of a node.
 */
export interface Payload extends Base {
    readonly key: AnnotationKey
}

class PayloadImpl extends BaseImpl implements Impl<Payload> {
    public key!: AnnotationKey
    public payloadType = PayloadType.REMOVE_ANNOTATION
}

export class PayloadBuilder extends BaseBuilder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public key(key: AnnotationKey): this {
        this.getImpl().key = key
        return this
    }

    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'key',
        ...BaseBuilder.__DAA_PROPS__,
    ]
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}

export function assertIsPayload(value: unknown): asserts value is Payload {
    if (!(value instanceof PayloadImpl))
        throw Error('Not a SetAnnotationPayload!')
}

/**
 * The handler for the SetAnnotation.
 */
export function removeAnnotation(
    node: Readonly<Node>,
    key: AnnotationKey,
): void {
    // tslint:disable-next-line: no-type-assertion
    const map = node.annotations as Map<AnnotationKey, string>
    map.delete(key)
}
