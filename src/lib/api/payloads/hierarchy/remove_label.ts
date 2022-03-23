import {Impl, Writable} from '@logi/base/ts/common/mapped_types'
import {Label, Node} from '@logi/src/lib/hierarchy/core'

import {PayloadType} from '../payload'

import {
    Payload as Base,
    PayloadBuilder as BaseBuilder,
    PayloadImpl as BaseImpl,
} from './payload'

/**
 * Indicating an addition of label.
 */
export interface Payload extends Base {
    readonly label: Readonly<Label>
}

class PayloadImpl extends BaseImpl implements Impl<Payload> {
    public label!: Readonly<Label>
    public payloadType = PayloadType.REMOVE_LABEL
}

export class PayloadBuilder extends BaseBuilder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public label(label: Readonly<Label>): this {
        this.getImpl().label = label
        return this
    }

    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'label',
        ...BaseBuilder.__DAA_PROPS__,
    ]
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}

/**
 * The handler for this payload.
 */
export function removeLabel(node: Readonly<Node>, label: Label): void {
    const idx = node.labels.indexOf(label)
    if (idx < 0)
        return
    // tslint:disable-next-line: no-type-assertion
    const writable = node as Writable<Node>
    writable.labels = [
        ...node.labels.slice(0, idx),
        ...node.labels.slice(idx + 1),
    ]
}
