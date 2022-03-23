import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Payload as Base, PayloadType} from '../payload'

/**
 * An hierarchy payload indicating a change on a hierarchy node.
 */
export interface Payload extends Base {
    /**
     * The uuid of hierachy node that should be updated.
     */
    readonly uuid: string
}

export abstract class PayloadImpl implements Payload {
    public uuid!: string
    public payloadType!: PayloadType
}

export class PayloadBuilder<T extends PayloadImpl,
    S extends Impl<T>> extends Builder<T, S> {
    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }

    public uuid(uuid: string): this {
        this.getImpl().uuid = uuid
        return this
    }

    protected static readonly __DAA_PROPS__: readonly string[] = [
        'uuid',
        'payloadType',
    ]
}

export function isPayload(obj: unknown): obj is Payload {
    return obj instanceof PayloadImpl
}
