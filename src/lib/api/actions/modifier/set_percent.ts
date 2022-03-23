import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {
    Payload,
    SetCurrencyPayloadBuilder,
    SetPercentPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {Currency} from '@logi/src/lib/modifier'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    readonly rows: readonly string[]
    readonly percent: boolean
}

class ActionImpl implements Impl<Action> {
    public rows!: readonly string[]
    public percent!: boolean
    public actionType = ActionType.SET_PERCENT
    public getPayloads(): readonly Payload[] {
        const payloads: Payload[] = []
        this.rows.forEach(r => {
            const percent = new SetPercentPayloadBuilder()
                .row(r)
                .percent(this.percent)
                .build()
            payloads.push(percent)
            if (!this.percent)
                return
            const currency = new SetCurrencyPayloadBuilder()
                .row(r)
                .currency(Currency.NONE)
                .build()
            payloads.push(currency)
        })
        return payloads
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

    public percent(percent: boolean): this {
        this.getImpl().percent = percent
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'rows',
        'percent',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
