import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Message, MessageBuilder, Type} from '../message'
import {Notice} from '../notice'

export interface SaveAsTmplNotice extends Notice {
    readonly actionType: number
    readonly success: boolean
    getMessage(): Message
}

class SaveAsTmplNoticeImpl implements Impl<SaveAsTmplNotice> {
    public actionType!: number
    public success!: boolean
    public getMessage(): Message {
        const type = this.success ? Type.SUCCESS : Type.ERROR
        const main = this.success ? '保存模板成功' : '保存模板失败'
        return new MessageBuilder().main(main).type(type).build()
    }
}

export class SaveAsTmplNoticeBuilder extends
    Builder<SaveAsTmplNotice, SaveAsTmplNoticeImpl> {
    public constructor(obj?: Readonly<SaveAsTmplNotice>) {
        const impl = new SaveAsTmplNoticeImpl()
        if (obj)
            SaveAsTmplNoticeBuilder.shallowCopy(impl, obj)
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
        return SaveAsTmplNoticeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'success',
        'actionType',
    ]
}

export function isSaveAsTmplNotice(value: unknown): value is SaveAsTmplNotice {
    return value instanceof SaveAsTmplNoticeImpl
}

export function assertIsSaveAsTmplNotice(
    value: unknown,
): asserts value is SaveAsTmplNotice {
    if (!(value instanceof SaveAsTmplNoticeImpl))
        throw Error('Not a SaveAsTmplNotice!')
}
