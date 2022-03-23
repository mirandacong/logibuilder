import {Builder} from '@logi/base/ts/common/builder'
import {
    FocusHierarchyPayloadBuilder,
    HierarchyPayload,
    SetSliceNamePayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {isFormulaBearer, SliceExpr} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../../type'
import {Action as Base} from '../base'

/**
 * Set name to slice of target node.
 */
export interface Action extends Base {
    readonly target: string
    readonly slice: Readonly<SliceExpr>
    readonly name: string
}

class ActionImpl implements Action {
    public target!: string
    public slice!: Readonly<SliceExpr>
    public name!: string
    public actionType = ActionType.SET_NAME_SLICE
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
        payloads.push(new SetSliceNamePayloadBuilder()
            .uuid(this.target)
            .index(index)
            .name(this.name.trim())
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

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'target',
        'slice',
        'name',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
