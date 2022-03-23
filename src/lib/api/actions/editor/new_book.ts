import {Builder} from '@logi/base/ts/common/builder'
import {
    Payload,
    RenderPayloadBuilder,
    SetBookPayloadBuilder,
    SetSourceManagerPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {BookBuilder, SheetBuilder} from '@logi/src/lib/hierarchy/core'
import {SourceManager} from '@logi/src/lib/source'

import {Action as Base} from '../action'
import {ActionType} from '../type'

/**
 * new book action.
 */
export interface Action extends Base {
    readonly name: string
}

class ActionImpl implements Action {
    public name!: string
    public actionType = ActionType.NEW_BOOK

    // @ts-ignore
    // tslint:disable-next-line: no-unused
    public getPayloads(service: EditorService): readonly Payload[] {
        const sheet = new SheetBuilder().name('Sheet').build()
        const book = new BookBuilder().name(this.name).sheets([sheet]).build()
        const sourceMgr = new SourceManager([])
        const bookPayload = new SetBookPayloadBuilder().book(book).build()
        const sourceMgrPayload = new SetSourceManagerPayloadBuilder()
            .sourceManager(sourceMgr)
            .build()
        const render = new RenderPayloadBuilder().build()
        return [bookPayload, sourceMgrPayload, render]
    }
}

export class ActionBuilder extends Builder<Action, ActionImpl> {
    public constructor(obj?: Readonly<Action>) {
        const impl = new ActionImpl()
        if (obj)
            ActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    public name(name: string): this {
        this.getImpl().name = name
        return this
    }
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}
