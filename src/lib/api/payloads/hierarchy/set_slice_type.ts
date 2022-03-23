import {Impl} from '@logi/base/ts/common/mapped_types'
import {
    FormulaBearer,
    SliceExpr,
    SliceExprBuilder,
    Type,
} from '@logi/src/lib/hierarchy/core'

import {PayloadType} from '../payload'

import {
    Payload as Base,
    PayloadBuilder as BaseBuilder,
    PayloadImpl as BaseImpl,
} from './payload'

/**
 * Indicating a update on the expression of the slice.
 */
export interface Payload extends Base {
    readonly index: number
    readonly type: Type
}

class PayloadImpl extends BaseImpl implements Impl<Payload> {
    public index!: number
    public type!: Type
    public payloadType = PayloadType.SET_SLICE_TYPE
}

export class PayloadBuilder extends BaseBuilder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public index(index: number): this {
        this.getImpl().index = index
        return this
    }

    public type(type: Type): this {
        this.getImpl().type = type
        return this
    }

    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'type',
        'index',
        ...BaseBuilder.__DAA_PROPS__,
    ]
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}

/**
 * The handler for this payload.
 */
export function setSliceType(
    node: Readonly<FormulaBearer>,
    idx: number,
    type: Type,
): void {
    // tslint:disable-next-line: no-type-assertion
    const slices = node.sliceExprs as SliceExpr[]
    const slice = slices[idx]
    if (slice === undefined)
        return
    const newSlice = new SliceExprBuilder(slice).type(type).build()
    slices.splice(idx, 1, newSlice)
}
