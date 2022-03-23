import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Payload as Base, PayloadType} from '../payload'

export interface Payload extends Base {
    readonly row: string
    readonly col: string
}

export abstract class PayloadImpl implements Payload {
    public row!: string
    public col!: string
    public payloadType!: PayloadType
}

export class PayloadBuilder<T extends PayloadImpl, S extends Impl<T>>
    extends Builder<T, S> {
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
        'payloadType',
    ]
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}

export function assertIsPayload(value: unknown): asserts value is Payload {
    if (!(value instanceof PayloadImpl))
        throw Error('Not a Payload!')
}
