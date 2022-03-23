import {Builder} from '@logi/base/ts/common/builder'
import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {
    AddSlicePayloadBuilder,
    FocusHierarchyPayloadBuilder,
    HierarchyPayload,
    SetExpressionPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {
    FormulaBearer,
    getNodesVisitor,
    isFormulaBearer,
    NodeType,
    SliceExpr,
    SliceExprBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../../type'
import {Action as Base} from '../base'

/**
 * Paste slices from clipboard to a formula bearer.
 */
export interface Action extends Base {
    readonly target: string
    readonly position: number | undefined
}

class ActionImpl implements Action {
    public target!: string
    public position: number | undefined
    public actionType = ActionType.PASTE_SLICE
    // tslint:disable-next-line: max-func-body-length
    public getPayloads(
        service: Readonly<EditorService>,
    ): readonly HierarchyPayload[] {
        const nodesMap = service.bookMap
        const payloads: HierarchyPayload[] = []
        const fb = nodesMap.get(this.target)
        if (!isFormulaBearer(fb))
            return []
        const slices = service.clipboard.getSlices()
        if (slices.length === 0)
            return []
        if (fb.sliceExprs.length === 0) {
            const slice = new SliceExprBuilder()
                .name('')
                .expression(fb.expression)
                .type(fb.type)
                .build()
            payloads.push(new AddSlicePayloadBuilder()
                .uuid(this.target)
                .slice(slice)
                .build())
            payloads.push(new SetExpressionPayloadBuilder()
                .uuid(fb.uuid)
                .expression('')
                .build(),
            )
        }
        const map = new Map<string, SliceExpr>()
        const fbs = preOrderWalk(
            service.book,
            getNodesVisitor,
            [NodeType.ROW, NodeType.COLUMN],
        ).filter(isFormulaBearer)
        fbs.forEach((f: Readonly<FormulaBearer>): void => {
            f.sliceExprs.forEach((s: SliceExpr): void => {
                map.set(s.uuid, s)
            })
        })
        slices.forEach((u: string, idx: number): void => {
            const ori = map.get(u)
            if (ori === undefined)
                return
            const s = new SliceExprBuilder(ori)
                .annotations(new Map(ori.annotations))
                .build()
            const pos = this.position !== undefined
                ? this.position + idx
                : this.position
            const action = new AddSlicePayloadBuilder()
                .uuid(this.target)
                .slice(s)
                .position(pos)
                .build()
            payloads.push(action)
            const focus = new FocusHierarchyPayloadBuilder()
                .uuid(this.target)
                .slice(s)
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

    public position(position: number | undefined): this {
        this.getImpl().position = position
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'target',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
