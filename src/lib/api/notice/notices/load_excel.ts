import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Message, MessageBuilder, Type} from '../message'
import {Notice} from '../notice'

export interface LoadExcelNotice extends Notice {
    readonly actionType: number
    readonly success: boolean
    readonly msg?: string
    getMessage(): Message
}

class LoadExcelNoticeImpl implements Impl<LoadExcelNotice> {
    public actionType!: number
    public success!: boolean
    public msg?: string
    public getMessage(): Message {
        const type = this.success ? Type.SUCCESS : Type.ERROR
        const main = this.success
            ? this.msg ?? '从excel更新成功'
            : this.msg ?? '从excel更新失败'
        return new MessageBuilder().main(main).type(type).build()
    }
}

export class LoadExcelNoticeBuilder extends
    Builder<LoadExcelNotice, LoadExcelNoticeImpl> {
    public constructor(obj?: Readonly<LoadExcelNotice>) {
        const impl = new LoadExcelNoticeImpl()
        if (obj)
            LoadExcelNoticeBuilder.shallowCopy(impl, obj)
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

    public msg(message: string): this {
        this.getImpl().msg = message
        return this
    }

    protected get daa(): readonly string[] {
        return LoadExcelNoticeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'actionType',
        'success',
    ]
}

export function isLoadExcelNotice(value: unknown): value is LoadExcelNotice {
    return value instanceof LoadExcelNoticeImpl
}

export function assertIsLoadExcelNotice(
    value: unknown,
): asserts value is LoadExcelNotice {
    if (!(value instanceof LoadExcelNoticeImpl))
        throw Error('Not a LoadExcelNotice!')
}
