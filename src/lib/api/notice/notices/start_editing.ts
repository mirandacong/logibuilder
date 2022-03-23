import {Builder} from '@logi/base/ts/common/builder'

import {Message, MessageBuilder, Type} from '../message'
import {Notice} from '../notice'

export interface StartEditingNotice extends Notice {
    readonly actionType: number
    readonly success: boolean
    readonly versionId: number
    readonly newVersion: boolean
    getMessage(): Message
}

class StartEditingNoticeImpl implements StartEditingNotice {
    public actionType!: number
    public success!: boolean
    public versionId = 0
    public newVersion = true
    public getMessage(): Message {
        const type = this.success ? Type.INFO : Type.ERROR
        const main = this.success ? '进入编辑状态' : '无法编辑'
        return new MessageBuilder().main(main).type(type).build()
    }
}

export class StartEditingNoticeBuilder extends
    Builder<StartEditingNotice, StartEditingNoticeImpl> {
    public constructor(obj?: Readonly<StartEditingNotice>) {
        const impl = new StartEditingNoticeImpl()
        if (obj)
            StartEditingNoticeBuilder.shallowCopy(impl, obj)
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

    public versionId(versionId: number): this {
        this.getImpl().versionId = versionId
        return this
    }

    public newVersion(newVersion: boolean): this {
        this.getImpl().newVersion = newVersion
        return this
    }

    protected get daa(): readonly string[] {
        return StartEditingNoticeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'actionType',
        'success',
        'versionId',
        'newVersion',
    ]
}

export function isStartEditingNotice(
    value: unknown,
): value is StartEditingNotice {
    return value instanceof StartEditingNoticeImpl
}
