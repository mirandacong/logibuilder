import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Payload as Base, PayloadType} from '../payload'

export interface Payload extends Base {
    readonly row: string
}

export abstract class PayloadImpl implements Payload {
    public row!: string
    public payloadType!: PayloadType
}

export class PayloadBuilder<T extends PayloadImpl, S extends Impl<T>>
    extends Builder<T, S> {
    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'payloadType',
    ]
}

export function isPayload(obj: unknown): obj is Payload {
    return obj instanceof PayloadImpl
}
