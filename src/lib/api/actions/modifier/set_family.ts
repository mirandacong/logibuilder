import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Payload, SetFamilyPayloadBuilder} from '@logi/src/lib/api/payloads'
import {FontFamily} from '@logi/src/lib/modifier'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    readonly rows: readonly string[]
    readonly family: FontFamily
}

class ActionImpl implements Impl<Action> {
    public rows!: readonly string[]
    public family!: FontFamily
    public actionType = ActionType.SET_FAMILY
    public getPayloads(): readonly Payload[] {
        return this.rows.map(r => new SetFamilyPayloadBuilder()
            .row(r)
            .family(this.family)
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

    public rows(row: readonly string[]): this {
        this.getImpl().rows = row
        return this
    }

    public family(family: FontFamily): this {
        this.getImpl().family = family
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'rows',
        'family',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
