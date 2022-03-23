import {Impl} from '@logi/base/ts/common/mapped_types'
import {
    AnnotationKey,
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
 * Set annotation of a node.
 */
export interface Payload extends Base {
    readonly key: AnnotationKey
    readonly value: string
    readonly index: number
}

class PayloadImpl extends BaseImpl implements Impl<Payload> {
    public key!: AnnotationKey
    public value!: string
    public index!: number
    public payloadType = PayloadType.SET_SLICE_ANNOTATION
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

    public value(value: string): this {
        this.getImpl().value = value
        return this
    }

    public index(index: number): this {
        this.getImpl().index = index
        return this
    }

    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'key',
        'value',
        'index',
        ...BaseBuilder.__DAA_PROPS__,
    ]
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}

export function assertIsPayload(value: unknown): asserts value is Payload {
    if (!(value instanceof PayloadImpl))
        throw Error('Not a SetSliceAnnotationPayload!')
}

/**
 * The handler for the SetSliceAnnotation.
 */
export function setSliceAnnotation(
    // tslint:disable-next-line: max-params
    node: Readonly<FormulaBearer>,
    idx: number,
    key: AnnotationKey,
    value: string,
): void {
    // tslint:disable-next-line: no-type-assertion
    const slices = node.sliceExprs as SliceExpr[]
    const slice = slices[idx]
    if (slice === undefined)
        return
    const annotations = new Map(slice.annotations)
    annotations.set(key, value)
    const newSlice = new SliceExprBuilder(slice)
        .annotations(annotations)
        .build()
    slices.splice(idx, 1, newSlice)
}
