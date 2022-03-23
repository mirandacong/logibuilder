import {Builder} from '@logi/base/ts/common/builder'
import {Payload, RenderPayloadBuilder} from '@logi/src/lib/api/payloads'

import {Action as Base} from './action'
import {ActionType} from './type'

/**
 * Render action.
 */
// tslint:disable-next-line: no-empty-interface
export interface Action extends Base {}

// tslint:disable-next-line: no-empty-class
class ActionImpl implements Action {
    public actionType = ActionType.RENDER
    // tslint:disable-next-line: prefer-function-over-method
    public getPayloads(): readonly Payload[] {
        return [new RenderPayloadBuilder().logiOnly(true).build()]
    }
}

export class ActionBuilder extends Builder<Action, ActionImpl> {
    public constructor(obj?: Readonly<Action>) {
        const impl = new ActionImpl()
        if (obj)
            ActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}
