import {Impl} from '@logi/base/ts/common/mapped_types'
import {FormulaBearer, SliceExpr} from '@logi/src/lib/hierarchy/core'

import {PayloadType} from '../payload'

import {
    Payload as Base,
    PayloadBuilder as BaseBuilder,
    PayloadImpl as BaseImpl,
} from './payload'

/**
 * Indicating a removing slice from a formula bearer.
 */
export interface Payload extends Base {
    readonly index: number
}

class PayloadImpl extends BaseImpl implements Impl<Payload> {
    public index!: number
    public payloadType = PayloadType.REMOVE_SLICE
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

    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'index',
        ...BaseBuilder.__DAA_PROPS__,
    ]
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}

/**
 * The handler of this payload. If the removing slice is not in the formula
 * bearer, do nothing.
 */
export function removeSlice(node: Readonly<FormulaBearer>, idx: number): void {
    // tslint:disable-next-line: no-type-assertion
    const slices = node.sliceExprs as SliceExpr[]
    if (slices[idx] === undefined)
        return
    slices.splice(idx, 1)
}
