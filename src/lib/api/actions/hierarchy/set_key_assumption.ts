import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {
    FocusHierarchyPayloadBuilder,
    HierarchyPayload,
    RemoveAnnotationPayloadBuilder,
    SetAnnotationPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {AnnotationKey, isRow} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../type'

import {Action as Base} from './base'

export interface Action extends Base {
    /**
     * uuid of row.
     */
    readonly row: string
    readonly isOn: boolean
}

class ActionImpl implements Impl<Action> {
    public row!: string
    public isOn!: boolean
    public actionType = ActionType.SET_KEY_ASSUMPTION
    public getPayloads(
        service: Readonly<EditorService>,
    ): readonly HierarchyPayload[] {
        const nodesMap = service.bookMap
        const row = nodesMap.get(this.row)
        if (!isRow(row))
            return []
        const payloads: HierarchyPayload[] = []
        if (this.isOn)
            payloads.push(new SetAnnotationPayloadBuilder()
                .uuid(this.row)
                .key(AnnotationKey.KEY_ASSUMPTION)
                .value('')
                .build())
        else
            payloads.push(new RemoveAnnotationPayloadBuilder()
                .uuid(this.row)
                .key(AnnotationKey.KEY_ASSUMPTION)
                .build())
        const f = new FocusHierarchyPayloadBuilder().uuid(this.row).build()
        payloads.push(f)
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

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public isOn(isOn: boolean): this {
        this.getImpl().isOn = isOn
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'isOn',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
