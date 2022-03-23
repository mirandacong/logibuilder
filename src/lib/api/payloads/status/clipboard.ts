import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Node, SliceExpr} from '@logi/src/lib/hierarchy/core'

import {Payload as Base, PayloadType} from '../payload'

export interface Payload extends Base {
    readonly content: readonly Readonly<Node>[] | readonly SliceExpr[]
    readonly isCut: boolean
}

class PayloadImpl implements Impl<Payload> {
    public content!: readonly Readonly<Node>[] | readonly SliceExpr[]
    public isCut!: boolean
    public payloadType = PayloadType.CLIPBOARD
}

export class PayloadBuilder extends Builder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public content(
        content: readonly Readonly<Node>[] | readonly SliceExpr[],
    ): this {
        this.getImpl().content = content
        return this
    }

    public isCut(isCut: boolean): this {
        this.getImpl().isCut = isCut
        return this
    }

    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'content',
        'isCut',
    ]
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}

export function assertIsPayload(value: unknown): asserts value is Payload {
    if (!(value instanceof PayloadImpl))
        throw Error('Not a Payload!')
}
