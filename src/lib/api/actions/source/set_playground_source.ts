import {Builder} from '@logi/base/ts/common/builder'
import {
    Payload,
    SetSourceInPlayGroundPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {ManualSourceBuilder} from '@logi/src/lib/source'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    readonly row: string
    readonly col: string
    readonly value: number
}

class ActionImpl implements Action {
    public row!: string
    public col!: string
    public value!: number
    public actionType = ActionType.SET_PLAYGROUND_SOURCE
    public getPayloads(): readonly Payload[] {
        return [new SetSourceInPlayGroundPayloadBuilder()
            .row(this.row)
            .col(this.col)
            .source(new ManualSourceBuilder().value(this.value).build())
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

    public value(value: number): this {
        this.getImpl().value = value
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'col',
        'value',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}
