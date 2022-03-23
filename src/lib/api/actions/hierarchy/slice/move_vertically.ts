import {Builder} from '@logi/base/ts/common/builder'
import {canMoveSlicesVertically} from '@logi/src/lib/api/common'
import {
    AddSlicePayloadBuilder,
    FocusHierarchyPayloadBuilder,
    HierarchyPayload,
    RemoveSlicePayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {
    FormulaBearer,
    isFormulaBearer,
    SliceExpr,
} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../../type'
import {Action as Base} from '../base'

/**
 * Move up or move down slices in a formula bearer.
 */
export interface Action extends Base {
    readonly target: string
    readonly slices: readonly Readonly<SliceExpr>[]
    readonly isUp: boolean
}

class ActionImpl implements Action {
    public target!: string
    public slices!: readonly Readonly<SliceExpr>[]
    public isUp!: boolean
    public actionType = ActionType.MOVE_VERTICALLY_SLICE

    public getPayloads(
        service: Readonly<EditorService>,
    ): readonly HierarchyPayload[] {
        const nodesMap = service.bookMap
        const payloads: HierarchyPayload[] = []
        const fb = nodesMap.get(this.target)
        if (!isFormulaBearer(fb))
            return []
        if (!canMoveSlicesVertically(fb, this.slices, this.isUp))
            return []
        this.slices.forEach((s: SliceExpr): void => {
            const focus = new FocusHierarchyPayloadBuilder()
                .uuid(this.target)
                .slice(s)
                .build()
            payloads.push(focus)
        })
        const allSlices = fb.sliceExprs
        if (this.isUp) {
            const upSorted = this.slices.slice().sort((
                a: Readonly<SliceExpr>,
                b: Readonly<SliceExpr>,
            ): number => allSlices.indexOf(a) < allSlices.indexOf(b) ? -1 : 1)
            payloads.push(...getMovingUpPayloads(upSorted, fb))
            return payloads
        }
        const downSorted = this.slices.slice().sort((
            a: Readonly<SliceExpr>,
            b: Readonly<SliceExpr>,
        ): number => allSlices.indexOf(a) < allSlices.indexOf(b) ? 1 : -1)
        payloads.push(...getMovingDownPayloads(downSorted, fb))
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

    public isUp(isUp: boolean): this {
        this.getImpl().isUp = isUp
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'target',
        'slices',
        'isUp',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}

function getMovingUpPayloads(
    slices: readonly Readonly<SliceExpr>[],
    fb: Readonly<FormulaBearer>,
): readonly HierarchyPayload[] {
    const payloads: HierarchyPayload[] = []
    const allSlices = fb.sliceExprs
    const positions = slices.map((s: Readonly<SliceExpr>): number =>
        allSlices.indexOf(s))
    slices.forEach((s: Readonly<SliceExpr>, idx: number): void => {
        const pos = positions[idx]
        /**
         * Skip nodes at the top.
         */
        if (pos === idx)
            return
        const rm = new RemoveSlicePayloadBuilder()
            .uuid(fb.uuid)
            .index(pos)
            .build()
        payloads.push(rm)
        const add = new AddSlicePayloadBuilder()
            .uuid(fb.uuid)
            .slice(s)
            .position(pos - 1)
            .build()
        payloads.push(add)
    })
    return payloads
}

function getMovingDownPayloads(
    slices: readonly Readonly<SliceExpr>[],
    fb: Readonly<FormulaBearer>,
): readonly HierarchyPayload[] {
    const payloads: HierarchyPayload[] = []
    const allSlices = fb.sliceExprs
    const positions = slices.map((s: Readonly<SliceExpr>): number =>
        allSlices.indexOf(s))
    slices.forEach((s: Readonly<SliceExpr>, idx: number): void => {
        const pos = positions[idx]
        /**
         * Skip nodes at the bottom.
         */
        if (pos === allSlices.length - idx - 1)
            return
        const rm = new RemoveSlicePayloadBuilder()
            .uuid(fb.uuid)
            .index(pos)
            .build()
        payloads.push(rm)
        const add = new AddSlicePayloadBuilder()
            .uuid(fb.uuid)
            .slice(s)
            .position(pos + 1)
            .build()
        payloads.push(add)
    })
    return payloads
}
