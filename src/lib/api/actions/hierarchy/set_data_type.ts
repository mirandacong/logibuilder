import {Builder} from '@logi/base/ts/common/builder'
import {
    FocusHierarchyPayloadBuilder,
    HierarchyPayload,
    SetDataTypePayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {DataType} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../type'

import {Action as Base} from './base'

/**
 * Set scalar of target node.
 */
export interface Action extends Base {
    readonly target: string
    readonly dataType: DataType
}

class ActionImpl implements Action {
    public target!: string
    public dataType!: DataType
    public actionType = ActionType.SET_DATA_TYPE
    public getPayloads(): readonly HierarchyPayload[] {
        const payloads: HierarchyPayload[] = []
        payloads.push(new SetDataTypePayloadBuilder()
            .uuid(this.target)
            .dataType(this.dataType)
            .build())
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

    public dataType(dataType: DataType): this {
        this.getImpl().dataType = dataType
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'target',
        'dataType',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
