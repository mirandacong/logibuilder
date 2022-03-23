import {Builder} from '@logi/base/ts/common/builder'
import {
    InitPlaygroundPayloadBuilder,
    Payload,
    SetSourcePayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {ProjectService} from '@logi/src/lib/api/services'
import {ManualSourceBuilder} from '@logi/src/lib/source'

import {Action as Base} from '../action'
import {ActionType} from '../type'

// tslint:disable-next-line: no-empty-interface
export interface Action extends Base {}

class ActionImpl implements Action {
    public actionType = ActionType.CONFIRM_PLAYGROUND
    // tslint:disable-next-line: prefer-function-over-method
    public getPayloads(service: ProjectService): readonly Payload[] {
        const result: Payload[] = []
        service.playground.getModification().forEach(h => {
            const row = h.row
            const col = h.col
            // tslint:disable-next-line: no-magic-numbers
            const value = h.value ?? ''
            result.push(new SetSourcePayloadBuilder()
                .row(row)
                .col(col)
                .source(new ManualSourceBuilder().value(value ?? '').build())
                .build())
        })
        result.push(new InitPlaygroundPayloadBuilder().build())
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
