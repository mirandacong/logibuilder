import {Impl, Writable} from '@logi/base/ts/common/mapped_types'
import {FormulaBearer} from '@logi/src/lib/hierarchy/core'

import {PayloadType} from '../payload'

import {
    Payload as Base,
    PayloadBuilder as BaseBuilder,
    PayloadImpl as BaseImpl,
} from './payload'

/**
 * Indicating an update of formula bearer alias.
 */
export interface Payload extends Base {
    readonly alias: string
}

class PayloadImpl extends BaseImpl implements Impl<Payload> {
    public alias!: string
    public payloadType = PayloadType.SET_ALIAS
}

export class PayloadBuilder extends BaseBuilder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public alias(alias: string): this {
        this.getImpl().alias = alias
        return this
    }

    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'alias',
        ...BaseBuilder.__DAA_PROPS__,
    ]
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}

export function setAlias(node: Readonly<FormulaBearer>, alias: string): void {
    // tslint:disable-next-line: no-type-assertion
    const writable = node as Writable<FormulaBearer>
    writable.alias = alias
}
