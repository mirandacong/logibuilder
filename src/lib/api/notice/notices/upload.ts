import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Message, MessageBuilder, Type} from '../message'
import {Notice} from '../notice'

export interface UploadNotice extends Notice {
    readonly actionType: number
    readonly success: boolean
    readonly status: number
    getMessage(): Message
}

class UploadNoticeImpl implements Impl<UploadNotice> {
    public actionType!: number
    public success!: boolean
    public status!: number
    public getMessage(): Message {
        const type = this.success ? Type.SUCCESS : Type.ERROR
        let main = this.success ? '更新模型成功' : '更新模型失败'
        const permissionDenied = 403
        main = this.status === permissionDenied ? '您没有权限更新模型，请生成副本编辑' : main
        return new MessageBuilder().main(main).type(type).build()
    }
}

export class UploadNoticeBuilder extends
    Builder<UploadNotice, UploadNoticeImpl> {
    public constructor(obj?: Readonly<UploadNotice>) {
        const impl = new UploadNoticeImpl()
        if (obj)
            UploadNoticeBuilder.shallowCopy(impl, obj)
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

    public status(status: number): this {
        this.getImpl().status = status
        return this
    }

    protected get daa(): readonly string[] {
        return UploadNoticeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'success',
        'actionType',
        'status',
    ]
}

export function isUploadNotice(value: unknown): value is UploadNotice {
    return value instanceof UploadNoticeImpl
}

export function assertIsUploadNotice(
    value: unknown,
): asserts value is UploadNotice {
    if (!(value instanceof UploadNoticeImpl))
        throw Error('Not a UploadNotice!')
}
