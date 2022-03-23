import {Builder} from '@logi/base/ts/common/builder'
import {ProducerVersion} from '@logi/base/ts/common/version'
import {
    DownloadPayloadBuilder,
    Payload,
    RenderPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {CoverData} from '@logi/src/lib/hsf'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    readonly version: ProducerVersion
    readonly data?: Readonly<CoverData>
}

class ActionImpl implements Action {
    public version!: ProducerVersion
    public data?: Readonly<CoverData>
    public actionType = ActionType.UPLOAD

    // @ts-ignore
    // tslint:disable-next-line: no-unused
    public getPayloads(service: EditorService): readonly Payload[] {
        const dlPayload = new DownloadPayloadBuilder()
            .logi(true)
            .excel(true)
            .data(this.data)
            .build()
        const render = new RenderPayloadBuilder().logiOnly(true).build()
        return [dlPayload, render]
    }
}

export class ActionBuilder extends Builder<Action, ActionImpl> {
    public constructor(obj?: Readonly<Action>) {
        const impl = new ActionImpl()
        if (obj)
            ActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public version(version: ProducerVersion): this {
        this.getImpl().version = version
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
        'version',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
