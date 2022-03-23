import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Message, MessageBuilder, Type} from '../message'
import {Notice} from '../notice'

export interface SetEndDateNotice extends Notice {
    readonly actionType: number
    readonly success: boolean
    getMessage(): Message
}

class SetEndDateNoticeImpl implements Impl<SetEndDateNotice> {
    public actionType!: number
    public success!: boolean
    public getMessage(): Message {
        const type = this.success ? Type.SUCCESS : Type.ERROR
        const main = this.success ? '成功更新财报数据' : '更新财报数据失败'
        return new MessageBuilder().main(main).type(type).build()
    }
}

export class SetEndDateNoticeBuilder extends
    Builder<SetEndDateNotice, SetEndDateNoticeImpl> {
    public constructor(obj?: Readonly<SetEndDateNotice>) {
        const impl = new SetEndDateNoticeImpl()
        if (obj)
            SetEndDateNoticeBuilder.shallowCopy(impl, obj)
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
        return SetEndDateNoticeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'actionType',
        'success',
    ]
}

export function isSetEndDateNotice(value: unknown): value is SetEndDateNotice {
    return value instanceof SetEndDateNoticeImpl
}

export function assertIsSetEndDateNotice(
    value: unknown,
): asserts value is SetEndDateNotice {
    if (!(value instanceof SetEndDateNoticeImpl))
        throw Error('Not a SetEndDateNotice!')
}
