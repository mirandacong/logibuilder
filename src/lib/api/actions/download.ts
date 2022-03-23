import {Builder} from '@logi/base/ts/common/builder'
import {FileType} from '@logi/base/ts/common/file_type'
import {
    DownloadPayloadBuilder,
    Payload,
    RenderPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {CoverData} from '@logi/src/lib/hsf'

import {Action as Base} from './action'
import {ActionType} from './type'

export interface Action extends Base {
    readonly type: FileType
    readonly data?: Readonly<CoverData>
}

class ActionImpl implements Action {
    public type!: FileType
    public data?: Readonly<CoverData>
    public actionType = ActionType.DOWNLOAD

    // @ts-ignore
    // tslint:disable-next-line: no-unused
    public getPayloads(service: EditorService): readonly Payload[] {
        const payloads: Payload[] = []
        const dlPayloadbuilder = new DownloadPayloadBuilder().data(this.data)
        switch (this.type) {
        case FileType.LOGI:
            dlPayloadbuilder.logi(true)
            break
        case FileType.TXT:
            dlPayloadbuilder.txt(true)
            break
        case FileType.XLSX:
            dlPayloadbuilder.excel(true)
            break
        case FileType.ZIP:
            dlPayloadbuilder.zip(true)
            break
        default:
        }
        payloads.push(dlPayloadbuilder.build())
        const renderType = [FileType.XLSX, FileType.ZIP]
        if (!renderType.includes(this.type))
            return payloads
        const renderPayload = new RenderPayloadBuilder().logiOnly(true).build()
        payloads.push(renderPayload)
        return payloads
    }
}

export class ActionBuilder extends Builder<Action, ActionImpl> {
    public constructor(obj?: Readonly<Action>) {
        const impl = new ActionImpl()
        if (obj)
            ActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public type(type: FileType): this {
        this.getImpl().type = type
        return this
    }

    public data(data?: Readonly<CoverData>): this {
        this.getImpl().data = data
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'type',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
