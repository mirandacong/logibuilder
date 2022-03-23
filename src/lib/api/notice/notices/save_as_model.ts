import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Message, MessageBuilder, Type} from '../message'
import {Notice} from '../notice'

export interface SaveAsModelNotice extends Notice {
    readonly actionType: number
    readonly success: boolean
    readonly modelId?: number
    getMessage(): Message
}

class SaveAsModelNoticeImpl implements Impl<SaveAsModelNotice> {
    public actionType!: number
    public success!: boolean
    public modelId?: number
    public getMessage(): Message {
        const type = this.success ? Type.SUCCESS : Type.ERROR
        const main = this.success ? '另存成功' : '另存失败'
        return new MessageBuilder().main(main).type(type).build()
    }
}

export class SaveAsModelNoticeBuilder extends
    Builder<SaveAsModelNotice, SaveAsModelNoticeImpl> {
    public constructor(obj?: Readonly<SaveAsModelNotice>) {
        const impl = new SaveAsModelNoticeImpl()
        if (obj)
            SaveAsModelNoticeBuilder.shallowCopy(impl, obj)
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

    public modelId(modelId: number): this {
        this.getImpl().modelId = modelId
        return this
    }

    protected get daa(): readonly string[] {
        return SaveAsModelNoticeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'success',
        'actionType',
    ]
}

export function isSaveAsModelNotice(
    value: unknown,
): value is SaveAsModelNotice {
    return value instanceof SaveAsModelNoticeImpl
}

export function assertIsSaveAsModelNotice(
    value: unknown,
): asserts value is SaveAsModelNotice {
    if (!(value instanceof SaveAsModelNoticeImpl))
        throw Error('Not a SaveAsModelNotice!')
}
