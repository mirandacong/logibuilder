import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Message, MessageBuilder, Type} from '../message'
import {Notice} from '../notice'

export interface RefreshDataNotice extends Notice {
    readonly actionType: number
    readonly success: boolean
    getMessage(): Message
}

class RefreshDataNoticeImpl implements Impl<RefreshDataNotice> {
    public actionType!: number
    public success!: boolean
    public getMessage(): Message {
        const type = this.success ? Type.SUCCESS : Type.ERROR
        const main = this.success ? '数据库数据已更新' : '数据库数据更新失败'
        return new MessageBuilder().main(main).type(type).build()
    }
}

export class RefreshDataNoticeBuilder extends
    Builder<RefreshDataNotice, RefreshDataNoticeImpl> {
    public constructor(obj?: Readonly<RefreshDataNotice>) {
        const impl = new RefreshDataNoticeImpl()
        if (obj)
            RefreshDataNoticeBuilder.shallowCopy(impl, obj)
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

    protected get daa(): readonly string[] {
        return RefreshDataNoticeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'success',
        'actionType',
    ]
}

export function isRefreshDataNotice(
    value: unknown,
): value is RefreshDataNotice {
    return value instanceof RefreshDataNoticeImpl
}

export function assertIsRefreshDataNotice(
    value: unknown,
): asserts value is RefreshDataNotice {
    if (!(value instanceof RefreshDataNoticeImpl))
        throw Error('Not a RefreshDataNotice!')
}
