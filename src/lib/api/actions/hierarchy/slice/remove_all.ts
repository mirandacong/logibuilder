import {Builder} from '@logi/base/ts/common/builder'
import {
    FocusHierarchyPayloadBuilder,
    HierarchyPayload,
    RemoveSlicePayloadBuilder,
    SetExpressionPayloadBuilder,
    SetTypePayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {
    FormulaBearer,
    isFormulaBearer,
    Node,
} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../../type'
import {Action as Base} from '../base'

/**
 * Remove all slices from target node.
 */
export interface Action extends Base {
    readonly targets: readonly string[]
}

class ActionImpl implements Action {
    public targets: readonly string[] = []
    public actionType = ActionType.REMOVE_ALL_SLICES

    public getPayloads(
        service: Readonly<EditorService>,
    ): readonly HierarchyPayload[] {
        const map = service.bookMap
        const payloads: HierarchyPayload[] = []
        const fbs = this.targets
            .map((uuid: string): Readonly<Node> | undefined => map.get(uuid))
            .filter(isFormulaBearer)
        fbs.forEach((fb: Readonly<FormulaBearer>): void => {
            const slices = fb.sliceExprs
            if (slices.length === 0)
                return
            const setExpr = new SetExpressionPayloadBuilder()
                .uuid(fb.uuid)
                .expression(slices[0].expression)
                .build()
            const setType = new SetTypePayloadBuilder()
                .uuid(fb.uuid)
                .type(slices[0].type)
                .build()
            payloads.push(setExpr, setType)
            for (let i = slices.length - 1; i >= 0; i -= 1)
                payloads.push(new RemoveSlicePayloadBuilder()
                    .uuid(fb.uuid)
                    .index(0)
                    .build(),
                )
            const f = new FocusHierarchyPayloadBuilder().uuid(fb.uuid).build()
            payloads.push(f)
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

    public targets(targets: readonly string[]): this {
        this.getImpl().targets = targets
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'targets',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
