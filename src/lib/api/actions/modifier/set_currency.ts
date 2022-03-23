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
    readonly currency: Currency
}

class ActionImpl implements Impl<Action> {
    public rows!: readonly string[]
    public currency!: Currency
    public actionType = ActionType.SET_CURRENCY
    public getPayloads(): readonly Payload[] {
        const payloads: Payload[] = []
        this.rows.forEach(r => {
            payloads.push(new SetCurrencyPayloadBuilder()
                .row(r)
                .currency(this.currency)
                .build())
            if (this.currency === Currency.NONE)
                return
            const percent = new SetPercentPayloadBuilder()
                .row(r)
                .percent(false)
                .build()
            payloads.push(percent)
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

    public currency(currency: Currency): this {
        this.getImpl().currency = currency
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'rows',
        'currency',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
