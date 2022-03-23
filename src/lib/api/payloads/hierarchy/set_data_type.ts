import {Impl, Writable} from '@logi/base/ts/common/mapped_types'
import {DataType, Row} from '@logi/src/lib/hierarchy/core'

import {PayloadType} from '../payload'

import {
    Payload as Base,
    PayloadBuilder as BaseBuilder,
    PayloadImpl as BaseImpl,
} from './payload'

/**
 * Indicating a setting of isDefScalar in the row.
 */
export interface Payload extends Base {
    readonly dataType: DataType
}

class PayloadImpl extends BaseImpl implements Impl<Payload> {
    public dataType!: DataType
    public payloadType = PayloadType.SET_DATA_TYPE
}

export class PayloadBuilder extends BaseBuilder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    public dataType(dataType: DataType): this {
        this.getImpl().dataType = dataType
        return this
    }

    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'dataType',
        ...BaseBuilder.__DAA_PROPS__,
    ]
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}

/**
 * The handler of this payload.
 */
export function setDataType(node: Readonly<Row>, type: DataType): void {
    // tslint:disable-next-line: no-type-assertion
    const writable = node as Writable<Row>
    switch (type) {
    case DataType.SCALAR:
        writable.labels = []
        writable.isDefScalar = true
        break
    case DataType.FLOW:
        writable.labels = ['流量']
        writable.isDefScalar = false
        break
    case DataType.STOCK:
        writable.labels = ['存量']
        writable.isDefScalar = false
        break
    default:
        writable.labels = []
        writable.isDefScalar = false
    }
}
