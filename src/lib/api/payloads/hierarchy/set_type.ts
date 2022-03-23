import {Writable} from '@logi/base/ts/common/mapped_types'
import {FormulaBearer, Type} from '@logi/src/lib/hierarchy/core'

import {PayloadType} from '../payload'

import {
    Payload as Base,
    PayloadBuilder as BaseBuilder,
    PayloadImpl as BaseImpl,
} from './payload'

/**
 * Indicating an update of formula bearer expression.
 */
export interface Payload extends Base {
    readonly type: Type
}

class PayloadImpl extends BaseImpl implements Payload {
    public type!: Type
    public payloadType = PayloadType.SET_TYPE
}

export class PayloadBuilder extends BaseBuilder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
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
        ...BaseBuilder.__DAA_PROPS__,
    ]
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}

export function setType(node: Readonly<FormulaBearer>, type: Type): void {
    // tslint:disable-next-line: no-type-assertion
    const writable = node as Writable<FormulaBearer>
    writable.type = type
}
