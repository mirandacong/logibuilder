import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Message, MessageBuilder, Type} from '../message'
import {Notice} from '../notice'

export interface LinkDataNotice extends Notice {
    readonly actionType: number
    readonly success: boolean
    readonly timeout: boolean
    getMessage(): Message
}

class LinkDataNoticeImpl implements Impl<LinkDataNotice> {
    public actionType!: number
    public success!: boolean
    public timeout = false
    public getMessage(): Message {
        const type = this.success ? Type.SUCCESS : Type.ERROR
        const main = this.success ? '链接成功' : '链接失败'
        let secondary = ''
        if (!this.success)
            secondary = this.timeout ? '请检查网络后重新链接' : '请重新链接'
        return new MessageBuilder()
            .main(main)
            .secondary(secondary)
            .type(type)
            .build()
    }
}

export class LinkDataNoticeBuilder extends
    Builder<LinkDataNotice, LinkDataNoticeImpl> {
    public constructor(obj?: Readonly<LinkDataNotice>) {
        const impl = new LinkDataNoticeImpl()
        if (obj)
            LinkDataNoticeBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public actionType(actionType: number): this {
        this.getImpl().actionType = actionType
        return this
    }

    public success(success: boolean): this {
        this.getImpl().success = success
        return this
    }

    public timeout(timeout: boolean): this {
        this.getImpl().timeout = timeout
        return this
    }

    protected get daa(): readonly string[] {
        return LinkDataNoticeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'success',
        'actionType',
    ]
}

export function isLinkDataNotice(value: unknown): value is LinkDataNotice {
    return value instanceof LinkDataNoticeImpl
}

export function assertIsLinkDataNotice(
    value: unknown,
): asserts value is LinkDataNotice {
    if (!(value instanceof LinkDataNoticeImpl))
        throw Error('Not a LinkDataNotice!')
}
