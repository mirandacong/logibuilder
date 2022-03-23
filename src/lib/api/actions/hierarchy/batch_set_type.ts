import {Builder} from '@logi/base/ts/common/builder'
import {
    FocusHierarchyPayload,
    FocusHierarchyPayloadBuilder,
    HierarchyPayload,
    SetSliceTypePayloadBuilder,
    SetTypePayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {isFormulaBearer, Type} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../type'

import {Action as Base} from './base'

/**
 * Set type to target nodes and slices.
 */
export interface Action extends Base {
    readonly targets: readonly (readonly [string, string | undefined])[]
    readonly type: Type
}

class ActionImpl implements Action {
    /**
     * [node.uuid, slice.uuid | undefined]
     */
    public targets!: readonly (readonly [string, string | undefined])[]
    public type!: Type
    public actionType = ActionType.BATCH_SET_TYPE
    public getPayloads(
        service: Readonly<EditorService>,
    ): readonly HierarchyPayload[] {
        const payloads: HierarchyPayload[] = []
        this.targets.forEach(target => {
            const slice = target[1]
            let focus: FocusHierarchyPayload
            if (slice === undefined) {
                payloads.push(new SetTypePayloadBuilder()
                    .uuid(target[0])
                    .type(this.type)
                    .build())
                focus = new FocusHierarchyPayloadBuilder()
                    .uuid(target[0])
                    .build()
            } else {
                const fb = service.bookMap.get(target[0])
                if (!isFormulaBearer(fb))
                    return
                const index = fb.sliceExprs.findIndex(s => s.uuid === slice)
                if (index < 0)
                    return
                payloads.push(new SetSliceTypePayloadBuilder()
                    .uuid(target[0])
                    .index(index)
                    .type(this.type)
                    .build())
                focus = new FocusHierarchyPayloadBuilder()
                    .uuid(target[0])
                    .slice(fb.sliceExprs[index])
                    .build()
            }
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

    public targets(
        targets: readonly (readonly [string, string | undefined])[],
    ): this {
        this.getImpl().targets = targets
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
        'targets',
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
