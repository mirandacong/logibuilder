import {Impl} from '@logi/base/ts/common/mapped_types'
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
    readonly position?: number
}

class PayloadImpl extends BaseImpl implements Impl<Payload> {
    public label!: Readonly<Label>
    public position?: number
    public payloadType = PayloadType.ADD_LABEL
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

    public position(position: number | undefined): this {
        this.getImpl().position = position
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
export function addLabel(
    node: Readonly<Node>,
    label: Label,
    position?: number,
): void {
    // tslint:disable-next-line: no-type-assertion
    const labels = node.labels as Label[]
    if (labels.indexOf(label) >= 0)
        return
    const idx = position ?? labels.length
    labels.splice(idx, 0, label)
}
