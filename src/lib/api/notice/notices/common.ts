import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Message, MessageBuilder, Type} from '../message'
import {Notice} from '../notice'

export interface CommonNotice extends Notice {
    readonly actionType: number
    readonly message: string
    readonly type: Type
    getMessage(): Message
}

class CommonNoticeImpl implements Impl<CommonNotice> {
    public actionType!: number
    public message!: string
    public type!: Type

    // tslint:disable-next-line: no-unnecessary-method-declaration
    public getMessage(): Message {
        return new MessageBuilder().main(this.message).type(this.type).build()
    }
}

export class CommonNoticeBuilder extends
    Builder<CommonNotice, CommonNoticeImpl> {
    public constructor(obj?: Readonly<CommonNotice>) {
        const impl = new CommonNoticeImpl()
        if (obj)
            CommonNoticeBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public actionType(actionType: number): this {
        this.getImpl().actionType = actionType
        return this
    }

    public message(message: string): this {
        this.getImpl().message = message
        return this
    }

    public type(type: Type): this {
        this.getImpl().type = type
        return this
    }

    protected get daa(): readonly string[] {
        return CommonNoticeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'actionType',
        'message',
        'type',
    ]
}

export function isCommonNotice(value: unknown): value is CommonNotice {
    return value instanceof CommonNoticeImpl
}

export function assertIsCommonNotice(
    value: unknown,
): asserts value is CommonNotice {
    if (!(value instanceof CommonNoticeImpl))
        throw Error('Not a CommonNotice!')
}
