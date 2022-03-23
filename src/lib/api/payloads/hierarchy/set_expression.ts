import {Impl, Writable} from '@logi/base/ts/common/mapped_types'
import {FormulaBearer} from '@logi/src/lib/hierarchy/core'

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
    readonly expression: string
}

class PayloadImpl extends BaseImpl implements Impl<Payload> {
    public expression!: string
    public payloadType = PayloadType.SET_EXPRESSION
}

export class PayloadBuilder extends BaseBuilder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public expression(expression: string): this {
        this.getImpl().expression = expression
        return this
    }

    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'expression',
        ...BaseBuilder.__DAA_PROPS__,
    ]
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}

export function setExpression(
    node: Readonly<FormulaBearer>,
    expr: string,
): void {
    // tslint:disable-next-line: no-type-assertion
    const writable = node as Writable<FormulaBearer>
    writable.expression = expr
}
