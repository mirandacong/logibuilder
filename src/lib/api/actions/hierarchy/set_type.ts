import {Builder} from '@logi/base/ts/common/builder'
import {
    FocusHierarchyPayloadBuilder,
    HierarchyPayload,
    SetTypePayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {Type} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../type'

import {Action as Base} from './base'

/**
 * Set type to target node.
 */
export interface Action extends Base {
    readonly target: string
    readonly type: Type
}

class ActionImpl implements Action {
    public target!: string
    public type!: Type
    public actionType = ActionType.SET_TYPE
    public getPayloads(): readonly HierarchyPayload[] {
        const payloads: HierarchyPayload[] = []
        payloads.push(new SetTypePayloadBuilder()
            .uuid(this.target)
            .type(this.type)
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

    public type(type: Type): this {
        this.getImpl().type = type
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'target',
        'type',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
