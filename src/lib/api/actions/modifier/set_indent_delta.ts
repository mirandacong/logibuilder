import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Payload, SetIndentPayloadBuilder} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    readonly rows: readonly string[]
    readonly delta: number
}

class ActionImpl implements Impl<Action> {
    public rows!: readonly string[]
    public delta!: number
    public actionType = ActionType.SET_INDENT_DELTA
    public getPayloads(service: EditorService): readonly Payload[] {
        const payloads: Payload[] = []
        this.rows.forEach(r => {
            const m = service.modifierManager.getModifier(r)
            if (m === undefined)
                return
            let indent = m.font.indent
                + this.delta
            if (indent < 0)
                indent = 0
            payloads.push(new SetIndentPayloadBuilder()
                .row(r)
                .indent(indent)
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

    public delta(delta: number): this {
        this.getImpl().delta = delta
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'rows',
        'delta',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
