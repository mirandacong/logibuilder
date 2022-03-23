import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Payload as Base, PayloadType} from '../payload'

export interface DepPayload extends Base {
    readonly uuid: string
    readonly slice?: string
}

export abstract class DepPayloadImpl implements DepPayload {
    public uuid!: string
    public slice?: string
    public payloadType!: PayloadType
}

export class DepPayloadBuilder<T extends DepPayloadImpl,
    S extends Impl<T>> extends Builder<T, S> {
    protected get daa(): readonly string[] {
        return DepPayloadBuilder.__DAA_PROPS__
    }

    public uuid(uuid: string): this {
        this.getImpl().uuid = uuid
        return this
    }

    public slice(uuid?: string): this {
        this.getImpl().slice = uuid
        return this
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'uuid',
        'payloadType',
    ]
}

export function isDepPayload(obj: unknown): obj is DepPayload {
    return obj instanceof DepPayloadImpl
}

export class DepRange {
    public constructor(
        public readonly start: number,
        public readonly end: number,
    ) {}
}
