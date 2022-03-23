import {Builder} from '@logi/base/ts/common/builder'
import {
    FocusHierarchyPayloadBuilder,
    HierarchyPayload,
    SetSliceTypePayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {isFormulaBearer, SliceExpr, Type} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../../type'
import {Action as Base} from '../base'

/**
 * Set type to slice of target node.
 */
export interface Action extends Base {
    readonly target: string
    readonly slice: Readonly<SliceExpr>
    readonly type: Type
}

class ActionImpl implements Action {
    public target!: string
    public slice!: Readonly<SliceExpr>
    public type!: Type
    public actionType = ActionType.SET_TYPE_SLICE
    public getPayloads(
        service: Readonly<EditorService>,
    ): readonly HierarchyPayload[] {
        const fb = service.bookMap.get(this.target)
        if (!isFormulaBearer(fb))
            return []
        const index = fb.sliceExprs.indexOf(this.slice)
        if (index < 0)
            return []
        const payloads: HierarchyPayload[] = []
        payloads.push(new SetSliceTypePayloadBuilder()
            .uuid(this.target)
            .index(index)
            .type(this.type)
            .build())
        const focus = new FocusHierarchyPayloadBuilder()
            .uuid(this.target)
            .slice(this.slice)
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

    public slice(slice: Readonly<SliceExpr>): this {
        this.getImpl().slice = slice
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
        'slice',
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
