import {Builder} from '@logi/base/ts/common/builder'
import {Payload, ResetChangePayloadBuilder} from '@logi/src/lib/api/payloads'
import {ProjectService} from '@logi/src/lib/api/services'

import {Action as Base} from '../action'
import {ActionType} from '../type'

// tslint:disable-next-line: no-empty-interface
export interface Action extends Base {}

class ActionImpl implements Action {
    public actionType = ActionType.CLEAR_PLAYGROUND
    // tslint:disable-next-line: prefer-function-over-method
    public getPayloads(service: ProjectService): readonly Payload[] {
        if (!service.playground.isInPlayground())
            return []
        const result: Payload[] = []
        service.playground.getHistory().forEach(h => {
            result.push(new ResetChangePayloadBuilder()
                .row(h.row)
                .col(h.col)
                .build())
        })
        return result
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
