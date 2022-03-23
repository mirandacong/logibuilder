import {Builder} from '@logi/base/ts/common/builder'

import {Payload as Base, PayloadType} from '../payload'

/**
 * Reset an hierarchy cell in the playground.
 */
export interface Payload extends Base {
    readonly row: string
    readonly col: string
}

class PayloadImpl implements Payload {
    public row!: string
    public col!: string
    public payloadType = PayloadType.RESET_CHANGE
}

export class PayloadBuilder extends Builder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public col(col: string): this {
        this.getImpl().col = col
        return this
    }

    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'col',
    ]
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}
