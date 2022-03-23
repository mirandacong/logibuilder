import {Builder} from '@logi/base/ts/common/builder'
import {DefaultHeaderPayloadBuilder, Payload} from '@logi/src/lib/api/payloads'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    /**
     * When user cancel setting default header, this field should be undefined.
     */
    readonly defaultHeader: string | undefined
}

class ActionImpl implements Action {
    public defaultHeader: string | undefined
    public actionType = ActionType.SET_DEFAULT_HEADER
    public getPayloads(): readonly Payload[] {
        return [new DefaultHeaderPayloadBuilder()
            .defaultHeader(this.defaultHeader)
            .build()]
    }
}

export class ActionBuilder extends Builder<Action, ActionImpl> {
    public constructor(obj?: Readonly<Action>) {
        const impl = new ActionImpl()
        if (obj)
            ActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    // tslint:disable-next-line: no-optional-parameter
    public defaultHeader(defaultHeader: string | undefined): this {
        this.getImpl().defaultHeader = defaultHeader
        return this
    }
}

export function isAction(obj: unknown): obj is Action {
    return obj instanceof ActionImpl
}
