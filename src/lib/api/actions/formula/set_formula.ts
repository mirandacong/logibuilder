import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Payload, SetFormulaPayloadBuilder} from '@logi/src/lib/api/payloads'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    readonly row: string
    readonly col: string
    readonly formula: string
}

class ActionImpl implements Impl<Action> {
    public row!: string
    public col!: string
    public formula!: string
    public actionType = ActionType.SET_FORMULA
    public getPayloads(): readonly Payload[] {
        const payloads: Payload[] = []
        payloads.push(new SetFormulaPayloadBuilder()
            .row(this.row)
            .col(this.col)
            .formula(this.formula)
            .build())
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

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public col(col: string): this {
        this.getImpl().col = col
        return this
    }

    public formula(formula: string): this {
        this.getImpl().formula = formula
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'col',
        'formula',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
