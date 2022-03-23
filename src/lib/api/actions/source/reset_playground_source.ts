import {Builder} from '@logi/base/ts/common/builder'
import {Payload, ResetChangePayloadBuilder} from '@logi/src/lib/api/payloads'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    readonly row: string
    readonly col: string
}

class ActionImpl implements Action {
    public row!: string
    public col!: string
    public actionType = ActionType.RESET_PLAYGROUND_SOURCE
    public getPayloads(): readonly Payload[] {
        return [new ResetChangePayloadBuilder()
            .row(this.row)
            .col(this.col)
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

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public col(col: string): this {
        this.getImpl().col = col
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'col',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
