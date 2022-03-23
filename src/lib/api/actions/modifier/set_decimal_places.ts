import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {
    Payload,
    SetDecimalPlacesPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    readonly rows: readonly string[]
    readonly decimalPlacesDelta: number
}

class ActionImpl implements Impl<Action> {
    public rows!: readonly string[]
    public decimalPlacesDelta!: number
    public actionType = ActionType.SET_DECIMAL_PLACES
    public getPayloads(service: EditorService): readonly Payload[] {
        const payloads: Payload[] = []
        this.rows.forEach(r => {
            const m = service.modifierManager.getModifier(r)
            if (m === undefined)
                return
            let dp = m.format.decimalPlaces
            dp += this.decimalPlacesDelta
            if (dp < 0)
                dp = 0
            payloads.push(new SetDecimalPlacesPayloadBuilder()
                .row(r)
                .decimalPlaces(dp)
                .build())
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

    public rows(row: readonly string[]): this {
        this.getImpl().rows = row
        return this
    }

    public decimalPlacesDelta(decimalPlacesDelta: number): this {
        this.getImpl().decimalPlacesDelta = decimalPlacesDelta
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'rows',
        'decimalPlacesDelta',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
