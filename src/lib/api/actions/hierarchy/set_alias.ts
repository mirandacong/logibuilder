import {Builder} from '@logi/base/ts/common/builder'
import {
    FocusHierarchyPayloadBuilder,
    HierarchyPayload,
    SetAliasPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {isFormulaBearer} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../type'

import {Action as Base} from './base'
import {updateRdepAlias} from './lib'

/**
 * Set alias to target node.
 */
export interface Action extends Base {
    readonly target: string
    readonly alias: string
}

class ActionImpl implements Action {
    public target!: string
    public alias!: string
    public actionType = ActionType.SET_ALIAS
    public getPayloads(service: EditorService): readonly HierarchyPayload[] {
        const payloads: HierarchyPayload[] = []
        const fb = service.bookMap.get(this.target)
        if (!isFormulaBearer(fb) || fb.alias === this.alias)
            return payloads
        payloads.push(new SetAliasPayloadBuilder()
            .uuid(this.target)
            .alias(this.alias)
            .build())
        payloads.push(...updateRdepAlias(fb, this.alias, service))
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

    public alias(alias: string): this {
        this.getImpl().alias = alias
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'target',
        'alias',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
