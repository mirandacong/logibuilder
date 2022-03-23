import {Builder} from '@logi/base/ts/common/builder'
import {
    AddChildPayloadBuilder,
    FocusHierarchyPayloadBuilder,
    Payload,
} from '@logi/src/lib/api/payloads'
import {ColumnBuilder, NodeType, RowBuilder} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../type'

import {Action as Base} from './base'

export interface Action extends Base {
    readonly target: string
    readonly name: string
    readonly type: NodeType.ROW | NodeType.COLUMN
    readonly position?: number
}

class ActionImpl implements Action {
    public target!: string
    public name!: string
    public type!: NodeType.ROW | NodeType.COLUMN
    public position?: number
    public actionType = ActionType.ADD_SEPARATOR
    public getPayloads(): readonly Payload[] {
        const builder = this.type === NodeType.ROW
            ? new RowBuilder()
            : new ColumnBuilder()
        const child = builder.name(this.name).separator(true).build()
        const addChildPayload = new AddChildPayloadBuilder()
            .uuid(this.target)
            .child(child)
            .position(this.position)
            .build()
        const focusPayload = new FocusHierarchyPayloadBuilder()
            .uuid(child.uuid)
            .build()
        return [addChildPayload, focusPayload]
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

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public position(position: number): this {
        this.getImpl().position = position
        return this
    }

    public type(type: NodeType.ROW | NodeType.COLUMN): this {
        this.getImpl().type = type
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'target',
        'name',
        'type',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}
