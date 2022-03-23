import {Builder} from '@logi/base/ts/common/builder'
import {Payload} from '@logi/src/lib/api/payloads'

import {ActionType} from '../type'

import {Action as Base} from './base'

export interface Action extends Base {
    readonly payloads: readonly Payload[]
}

class ActionImpl implements Action {
    public payloads: readonly Payload[] = []
    public actionType = ActionType.CUSTOM
    public getPayloads(): readonly Payload[] {
        return this.payloads
    }
}

export class ActionBuilder extends Builder<Action, ActionImpl> {
    public constructor(obj?: Readonly<Action>) {
        const impl = new ActionImpl()
        if (obj)
            ActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public payloads(payloads: readonly Payload[]): this {
        this.getImpl().payloads = payloads
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
