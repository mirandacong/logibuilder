import {FormulaBearer, SliceExpr} from '@logi/src/lib/hierarchy/core'

import {PayloadType} from '../payload'

import {
    Payload as Base,
    PayloadBuilder as BaseBuilder,
    PayloadImpl as BaseImpl,
} from './payload'

/**
 * Indicating a insertion of a slice in the formula bearer.
 */
export interface Payload extends Base {
    readonly slice: Readonly<SliceExpr>
    readonly position?: number
}

class PayloadImpl extends BaseImpl implements Payload {
    public slice!: Readonly<SliceExpr>
    public position?: number
    public payloadType = PayloadType.ADD_SLICE
}

export class PayloadBuilder extends BaseBuilder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public position(position?: number): this {
        this.getImpl().position = position
        return this
    }

    public slice(slice: Readonly<SliceExpr>): this {
        this.getImpl().slice = slice
        return this
    }

    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        ...BaseBuilder.__DAA_PROPS__,
        'slice',
    ]
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}

/**
 * The handler of this payload.
 */
export function addSlice(
    node: Readonly<FormulaBearer>,
    slice: Readonly<SliceExpr>,
    position?: number,
): void {
    // tslint:disable-next-line: no-type-assertion
    const slices = node.sliceExprs as SliceExpr[]
    const idx = position ?? slices.length
    slices.splice(idx, 0, slice)
}
