import {Builder} from '@logi/base/ts/common/builder'
import {
    FocusHierarchyPayloadBuilder,
    HierarchyPayload,
    RemoveSlicePayloadBuilder,
    SetExpressionPayloadBuilder,
    SetTypePayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {isFormulaBearer, SliceExpr} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../../type'
import {Action as Base} from '../base'

/**
 * Remove slice from target node.
 */
export interface Action extends Base {
    readonly target: string
    readonly slices: readonly Readonly<SliceExpr>[]
}

class ActionImpl implements Action {
    public target!: string
    public slices!: readonly Readonly<SliceExpr>[]
    public actionType = ActionType.REMOVE_SLICE

    public getPayloads(service: EditorService): readonly HierarchyPayload[] {
        const map = service.bookMap
        const fb = map.get(this.target)
        if (!isFormulaBearer(fb))
            return []
        const payloads: HierarchyPayload[] = []
        const slices = fb.sliceExprs
        if (slices.length === 0)
            return []
        if (slices.every((s: SliceExpr): boolean => this.slices.includes(s))) {
            const setExpr = new SetExpressionPayloadBuilder()
                .uuid(fb.uuid)
                .expression(slices[0].expression)
                .build()
            const setType = new SetTypePayloadBuilder()
                .uuid(fb.uuid)
                .type(slices[0].type)
                .build()
            payloads.push(setExpr, setType)
        }
        this.slices
            .map((s: SliceExpr): number => fb.sliceExprs.indexOf(s))
            .sort((a: number, b: number): number => b - a)
            .forEach((idx: number): void => {
                if (idx < 0)
                    return
                payloads.push(new RemoveSlicePayloadBuilder()
                    .uuid(this.target)
                    .index(idx)
                    .build())
                const focus = new FocusHierarchyPayloadBuilder()
                    .uuid(fb.uuid)
                    .slice(fb.sliceExprs[idx])
                    .build()
                payloads.push(focus)
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

    public target(target: string): this {
        this.getImpl().target = target
        return this
    }

    public slices(slices: readonly Readonly<SliceExpr>[]): this {
        this.getImpl().slices = slices
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'target',
        'slices',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
