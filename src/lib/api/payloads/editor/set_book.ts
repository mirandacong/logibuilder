import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Book} from '@logi/src/lib/hierarchy/core'

import {Payload, PayloadType} from '../payload'

export interface SetBookPayload extends Payload {
    readonly book: Readonly<Book>
}

class SetBookPayloadImpl implements Impl<SetBookPayload> {
    public book!: Readonly<Book>
    public payloadType = PayloadType.SET_BOOK
}

export class SetBookPayloadBuilder extends
    Builder<SetBookPayload, SetBookPayloadImpl> {
    public constructor(obj?: Readonly<SetBookPayload>) {
        const impl = new SetBookPayloadImpl()
        if (obj)
            SetBookPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public book(book: Readonly<Book>): this {
        this.getImpl().book = book
        return this
    }

    protected get daa(): readonly string[] {
        return SetBookPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['book']
}

export function isSetBookPayload(value: unknown): value is SetBookPayload {
    return value instanceof SetBookPayloadImpl
}

export function assertIsSetBookPayload(
    value: unknown,
): asserts value is SetBookPayload {
    if (!(value instanceof SetBookPayloadImpl))
        throw Error('Not a SetBookPayload!')
}
