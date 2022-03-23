import {Builder} from '@logi/base/ts/common/builder'
import {
    AddSlicePayloadBuilder,
    HierarchyPayload,
    SetExpressionPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {isRow, SliceExprBuilder, Type} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../type'

import {Action as Base} from './base'

export interface Action extends Base {
    readonly target: string
}

class ActionImpl implements Action {
    public target!: string
    public actionType = ActionType.PREDICT_FROM_LAST_YEAR

    // tslint:disable-next-line: max-func-body-length
    public getPayloads(
        service: Readonly<EditorService>,
    ): readonly HierarchyPayload[] {
        const nodesMap = service.bookMap
        const payloads: HierarchyPayload[] = []
        const row = nodesMap.get(this.target)
        if (!isRow(row))
            return []
        const predictSlice = row.sliceExprs.find(s => s.name === '预测期')
        if (predictSlice !== undefined)
            return []
        const histSlice = row.sliceExprs.find(s => s.name === '历史期')
        payloads.push(new SetExpressionPayloadBuilder()
            .expression('')
            .uuid(this.target)
            .build(),
        )
        if (histSlice === undefined) {
            const newHistSlice = new SliceExprBuilder()
                .name('历史期')
                .type(Type.FACT)
                .expression(row.expression)
                .build()
            payloads.push(new AddSlicePayloadBuilder()
                .position(0)
                .uuid(this.target)
                .slice(newHistSlice)
                .build(),
            )
        }
        const newProjSlice = new SliceExprBuilder()
            .name('预测期')
            .expression(`{${row.name}}.lag(1y)`)
            .type(Type.ASSUMPTION)
            .build()
        payloads.push(new AddSlicePayloadBuilder()
            .uuid(this.target)
            .position(1)
            .slice(newProjSlice)
            .build(),
        )
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
