import {Impl, Writable} from '@logi/base/ts/common/mapped_types'
import {isRow, isRowBlock, isTable, Node} from '@logi/src/lib/hierarchy/core'

import {PayloadType} from '../payload'

import {
    Payload as Base,
    PayloadBuilder as BaseBuilder,
    PayloadImpl as BaseImpl,
} from './payload'

/**
 * AddPayload indicating an insertion of the subnode.
 */
export interface Payload extends Base {
    readonly child: Readonly<Node>
    readonly position?: number
}

class PayloadImpl extends BaseImpl implements Impl<Payload> {
    public child!: Readonly<Node>
    public position?: number
    public payloadType = PayloadType.ADD_CHILD
}

export class PayloadBuilder extends BaseBuilder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public child(child: Readonly<Node>): this {
        this.getImpl().child = child
        return this
    }

    public position(position?: number): this {
        this.getImpl().position = position
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
        throw Error('Not a AddPayload!')
}

/**
 * The handler for the AddPaylaod.
 *
 * Using a function rather than a method in the Payload is to prevent the
 * frontend seeing or using this.
 */
export function addChild(
    node: Readonly<Node>,
    child: Readonly<Node>,
    // tslint:disable-next-line: no-optional-parameter
    idx?: number,
): void {
    /**
     * Use node.insertSubnode() will remove child from the orignal parent's
     * subnodes. This will cause error when apply undo.
     */
    // tslint:disable-next-line: no-type-assertion
    const writable = node as Writable<Node>
    // @ts-ignore
    // tslint:disable-next-line: no-type-assertion
    const subNodes = writable.subnodes as Readonly<Node>[]
    let position = idx ?? subNodes.length
    if (idx !== undefined && isTable(node)) {
        const targetNode = isRow(child) || isRowBlock(child)
            ? node.rows[idx]
            : node.cols[idx]
        position = targetNode === undefined
            ? subNodes.length
            : subNodes.indexOf(targetNode)
    }
    subNodes.splice(position, 0, child)
}
