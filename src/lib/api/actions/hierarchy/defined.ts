import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {
    AddChildPayloadBuilder,
    FocusHierarchyPayloadBuilder,
    HierarchyPayload,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {isRow, RowBuilder} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../type'

import {Action as Base} from './base'
import {getChildIndex} from './lib'

/**
 * Defined the undefiend refrence.
 */
export interface Action extends Base {
    readonly row: string
    readonly name: string
}

class ActionImpl implements Impl<Action> {
    public row!: string
    public name!: string
    public actionType = ActionType.DEFINED
    public getPayloads(
        service: Readonly<EditorService>,
    ): readonly HierarchyPayload[] {
        const nodesMap = service.bookMap
        const row = nodesMap.get(this.row)
        if (!isRow(row))
            return []
        const parent = row.parent
        if (parent === null)
            return []
        const payloads: HierarchyPayload[] = []
        const pos = getChildIndex(row)
        const colonIdx = this.name.indexOf(':')
        const name = colonIdx < 0 ? this.name : this.name.slice(0, colonIdx)
        const newNode = new RowBuilder().name(name).build()
        const addChild = new AddChildPayloadBuilder()
            .uuid(parent.uuid)
            .child(newNode)
            .position(pos)
            .build()
        payloads.push(addChild)
        const focus = new FocusHierarchyPayloadBuilder()
            .uuid(newNode.uuid)
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

    public row(row: string): this {
        this.getImpl().row = row
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
        'row',
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
