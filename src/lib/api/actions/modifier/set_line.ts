import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Payload, SetLinePayloadBuilder} from '@logi/src/lib/api/payloads'
import {Underline} from '@logi/src/lib/modifier'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    readonly rows: readonly string[]
    readonly line: Underline
}

class ActionImpl implements Impl<Action> {
    public rows!: readonly string[]
    public line!: Underline
    public actionType = ActionType.SET_LINE
    public getPayloads(): readonly Payload[] {
        return this.rows.map(r => new SetLinePayloadBuilder()
            .row(r)
            .line(this.line)
            .build())
    }
}

export class ActionBuilder extends Builder<Action, ActionImpl> {
    public constructor(obj?: Readonly<Action>) {
        const impl = new ActionImpl()
        if (obj)
            ActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public rows(rows: readonly string[]): this {
        this.getImpl().rows = rows
        return this
    }

    public line(line: Underline): this {
        this.getImpl().line = line
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'rows',
        'line',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
