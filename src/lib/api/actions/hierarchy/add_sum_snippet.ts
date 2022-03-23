import {Builder} from '@logi/base/ts/common/builder'
import {
    AddChildPayloadBuilder,
    FocusHierarchyPayloadBuilder,
    Payload,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {
    isRow,
    Row,
    RowBuilder,
    simplifyPath,
} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../type'

import {Action as Base} from './base'

export interface Action extends Base {
    /**
     * uuid array of rows.
     */
    readonly rows: readonly string[]
    /**
     * The new generating sum row name.
     */
    readonly name: string
    /**
     * Which node to insert.
     */
    readonly target: string
    readonly position: number
}

class ActionImpl implements Action {
    public rows: readonly string[] = []
    public name!: string
    public target!: string
    public position!: number
    public actionType = ActionType.ADD_SUM_SNIPPET

    public getPayloads(service: Readonly<EditorService>): readonly Payload[] {
        const nodesMap = service.bookMap
        const rows: Readonly<Row>[] = []
        this.rows.forEach((uuid: string): void => {
            const r = nodesMap.get(uuid)
            if (isRow(r))
                rows.push(r)
        })
        const targetNode = nodesMap.get(this.target)
        if (targetNode === undefined)
            return []
        const rowPath = rows
            .map(r => `{${simplifyPath(r, targetNode).toString()}}`)
            .join(',')
        const expression = `SUM(${rowPath})`
        const row = new RowBuilder()
            .name(this.name)
            .expression(expression)
            .build()
        const payloads: Payload[] = []
        const position = this.position ?? 0
        const addPayload = new AddChildPayloadBuilder()
            .uuid(this.target)
            .child(row)
            .position(position)
            .build()
        const focus = new FocusHierarchyPayloadBuilder().uuid(row.uuid).build()
        payloads.push(addPayload, focus)
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

    public rows(rows: readonly string[]): this {
        this.getImpl().rows = rows
        return this
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public target(target: string): this {
        this.getImpl().target = target
        return this
    }

    public position(position: number): this {
        this.getImpl().position = position
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'rows',
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
