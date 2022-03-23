import {Builder} from '@logi/base/ts/common/builder'
import {
    FocusHierarchyPayloadBuilder,
    HierarchyPayload,
    SetExpressionPayloadBuilder,
} from '@logi/src/lib/api/payloads'

import {ActionType} from '../type'

import {Action as Base} from './base'

/**
 * Set expression to target node.
 */
export interface Action extends Base {
    readonly target: string
    readonly expression: string
}

class ActionImpl implements Action {
    public target!: string
    public expression!: string
    public actionType = ActionType.SET_EXPRESSION
    public getPayloads(): readonly HierarchyPayload[] {
        const payloads: HierarchyPayload[] = []
        payloads.push(new SetExpressionPayloadBuilder()
            .uuid(this.target)
            .expression(this.expression)
            .build())
        const focus = new FocusHierarchyPayloadBuilder()
            .uuid(this.target)
            .build()
        payloads.push(focus)
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

    public target(target: string): this {
        this.getImpl().target = target
        return this
    }

    public expression(expression: string): this {
        this.getImpl().expression = expression
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'target',
        'expression',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
