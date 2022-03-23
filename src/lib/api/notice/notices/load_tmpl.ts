import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Message, MessageBuilder, Type} from '../message'
import {Notice} from '../notice'

export interface LoadTmplNotice extends Notice {
    readonly actionType: number
    readonly success: boolean
    getMessage(): Message
}

class LoadTmplNoticeImpl implements Impl<LoadTmplNotice> {
    public actionType!: number
    public success!: boolean
    public getMessage(): Message {
        const type = this.success ? Type.SUCCESS : Type.ERROR
        const main = this.success ? '导入模板成功' : '导入模板失败'
        return new MessageBuilder().main(main).type(type).build()
    }
}

export class LoadTmplNoticeBuilder extends
    Builder<LoadTmplNotice, LoadTmplNoticeImpl> {
    public constructor(obj?: Readonly<LoadTmplNotice>) {
        const impl = new LoadTmplNoticeImpl()
        if (obj)
            LoadTmplNoticeBuilder.shallowCopy(impl, obj)
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
        return LoadTmplNoticeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'success',
        'actionType',
    ]
}

export function isLoadTmplNotice(value: unknown): value is LoadTmplNotice {
    return value instanceof LoadTmplNoticeImpl
}

export function assertIsLoadTmplNotice(
    value: unknown,
): asserts value is LoadTmplNotice {
    if (!(value instanceof LoadTmplNoticeImpl))
        throw Error('Not a LoadTmplNotice!')
}
