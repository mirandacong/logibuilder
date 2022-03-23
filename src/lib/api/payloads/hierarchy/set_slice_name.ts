import {Exception} from '@logi/base/ts/common/exception'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {
    FormulaBearer,
    SliceExpr,
    SliceExprBuilder,
} from '@logi/src/lib/hierarchy/core'

import {PayloadType} from '../payload'

import {
    Payload as Base,
    PayloadBuilder as BaseBuilder,
    PayloadImpl as BaseImpl,
} from './payload'

/**
 * Update the name of a slice.
 */
export interface Payload extends Base {
    readonly index: number
    readonly name: string
}

class PayloadImpl extends BaseImpl implements Impl<Payload> {
    public index!: number
    public name!: string
    public payloadType = PayloadType.SET_SLICE_NAME
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

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'index',
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
export function setSliceName(
    node: Readonly<FormulaBearer>,
    idx: number,
    name: string,
): void | Exception {
    // tslint:disable-next-line: no-type-assertion
    const slices = node.sliceExprs as SliceExpr[]
    const slice = slices[idx]
    if (slice === undefined)
        return
    const newSlice = new SliceExprBuilder(slice).name(name).build()
    slices.splice(idx, 1, newSlice)
}
