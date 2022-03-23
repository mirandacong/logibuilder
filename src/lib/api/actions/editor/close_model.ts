import {Builder} from '@logi/base/ts/common/builder'
import {
    InitPayloadBuilder,
    Payload,
    RenderPayloadBuilder,
    SetBookPayloadBuilder,
    SetSourceManagerPayloadBuilder,
    SetStdHeaderSetPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {BookBuilder, SheetBuilder} from '@logi/src/lib/hierarchy/core'
import {SourceManager} from '@logi/src/lib/source'
import {TemplateSetBuilder} from '@logi/src/lib/template'

import {Action as Base} from '../action'
import {ActionType} from '../type'

/**
 * Close the current model and build a new empty model.
 */
// tslint:disable-next-line: no-empty-interface
export interface Action extends Base {}

class ActionImpl implements Action {
    public actionType = ActionType.CLOSE_MODEL

    // @ts-ignore
    // tslint:disable-next-line: prefer-function-over-method no-unused
    public getPayloads(service: EditorService): readonly Payload[] {
        const sheet = new SheetBuilder().name('Sheet1').build()
        const newBook = new BookBuilder().name('Book').sheets([sheet]).build()
        const initBookPayload = new SetBookPayloadBuilder()
            .book(newBook)
            .build()
        const templateSet = new TemplateSetBuilder().build()
        const initTemplateSetPayload = new SetStdHeaderSetPayloadBuilder()
            .templateSet(templateSet)
            .build()
        const sourceManager = new SourceManager([])
        const initSourceMgrPayload = new SetSourceManagerPayloadBuilder()
            .sourceManager(sourceManager)
            .build()
        const initOtherPayload = new InitPayloadBuilder().build()
        const render = new RenderPayloadBuilder().build()
        return [
            initBookPayload,
            initSourceMgrPayload,
            initTemplateSetPayload,
            initOtherPayload,
            render,
        ]
    }
}

export class ActionBuilder extends Builder<Action, ActionImpl> {
    public constructor(obj?: Readonly<Action>) {
        const impl = new ActionImpl()
        if (obj)
            ActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
