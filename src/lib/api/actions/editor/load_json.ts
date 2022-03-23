import {Builder} from '@logi/base/ts/common/builder'
import {isException} from '@logi/base/ts/common/exception'
import {CommonNoticeBuilder, MessageType} from '@logi/src/lib/api/notice'
import {
    Payload,
    RenderPayloadBuilder,
    SetActiveSheetPayloadBuilder,
    SetBookPayloadBuilder,
    SetSourceManagerPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {fromJson} from '@logi/src/lib/model'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    /**
     * A json object to be loaded.
     */
    readonly obj: Record<string, unknown>
}

class ActionImpl implements Action {
    public obj!: Record<string, unknown>
    public actionType = ActionType.LOAD_JSON

    // @ts-ignore
    // tslint:disable-next-line: no-unused
    public getPayloads(service: EditorService): readonly Payload[] {
        const result = fromJson(this.obj)
        if (isException(result)) {
            const notice = new CommonNoticeBuilder()
                .actionType(this.actionType)
                .message(' 打开文件失败，此文件或已经损坏')
                .type(MessageType.ERROR)
                .build()
            service.noticeEmitter$.next(notice)
            return []
        }
        // tslint:disable-next-line: no-type-assertion
        const book = result.book
        const sourceManager = result.sourceManager
        const bookPayload = new SetBookPayloadBuilder().book(book).build()
        const sourcePayload = new SetSourceManagerPayloadBuilder()
            .sourceManager(sourceManager)
            .build()
        const active = new SetActiveSheetPayloadBuilder()
            .sheet(book.sheets[0].name)
            .build()
        const render = new RenderPayloadBuilder().build()
        return [bookPayload, sourcePayload, active, render]
    }
}

export class ActionBuilder extends Builder<Action, ActionImpl> {
    public constructor(obj?: Readonly<Action>) {
        const impl = new ActionImpl()
        if (obj)
            ActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public obj(obj: Record<string, unknown>): this {
        this.getImpl().obj = obj
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['obj']
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
