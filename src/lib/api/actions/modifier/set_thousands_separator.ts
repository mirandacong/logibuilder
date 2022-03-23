import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {
    Payload,
    SetThousandsSeparatorPayloadBuilder,
} from '@logi/src/lib/api/payloads'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    readonly rows: readonly string[]
    readonly thousandsSeparator: boolean
}

class ActionImpl implements Impl<Action> {
    public rows!: readonly string[]
    public thousandsSeparator!: boolean
    public actionType = ActionType.SET_THOUSANDS_SEPARATOR
    public getPayloads(): readonly Payload[] {
        return this.rows.map(r => new SetThousandsSeparatorPayloadBuilder()
            .row(r)
            .thousandsSeparator(this.thousandsSeparator)
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

    public thousandsSeparator(thousandsSeparator: boolean): this {
        this.getImpl().thousandsSeparator = thousandsSeparator
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'rows',
        'thousandsSeparator',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
