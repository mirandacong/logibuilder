import {Builder} from '@logi/base/ts/common/builder'
import {
    AddChildPayloadBuilder,
    FocusHierarchyPayloadBuilder,
    HierarchyPayload,
    SetExpressionPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {
    isRow,
    isRowBlock,
    isTable,
    Row,
    RowBlock,
    RowBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../type'

import {Action as Base} from './base'
import {getChildIndex} from './lib'

/**
 * Add formula nodes in batches.
 */
export interface Action extends Base {
    readonly target: string
    readonly names: readonly string[]
}

class ActionImpl implements Action {
    public target!: string
    public names!: readonly string[]
    public actionType = ActionType.ITEMIZED_FORECAST

    // tslint:disable-next-line: max-func-body-length
    public getPayloads(
        service: Readonly<EditorService>,
    ): readonly HierarchyPayload[] {
        const nodesMap = service.bookMap
        const payloads: HierarchyPayload[] = []
        if (this.names.length === 0)
            return []
        const node = nodesMap.get(this.target)
        if (node === undefined)
            return []
        if (!isRow(node))
            return []
        const parent = node.parent
        if (parent === null)
            return []
        const existRows = new Map<string, Readonly<Row> | Readonly<RowBlock>>()
        if (isTable(parent))
            parent.rows.forEach(r => {
                if (isRow(r))
                    existRows.set(r.name, r)
            })
        if (isRowBlock(parent))
            parent.tree.forEach(r => {
                if (isRow(r))
                    existRows.set(r.name, r)
            })
        const position = getChildIndex(node) + 1
        let rowExpression = ''
        let index = 0
        this.names.forEach((name: string, i: number): void => {
            index += 1
            i < this.names.length - 1 ?
                rowExpression = rowExpression + `{${name}}+`
                :
                rowExpression = rowExpression + `{${name}}`
            if (existRows.has(name)) {
                const uuid = existRows.get(name)?.uuid
                if (uuid)
                    payloads.push(new FocusHierarchyPayloadBuilder()
                        .uuid(uuid)
                        .build())
                index = index - 1
                return
            }
            const p = position + index - 1
            const newRow = new RowBuilder().name(name).build()
            payloads.push(
                new AddChildPayloadBuilder()
                    .child(newRow)
                    .position(p)
                    .uuid(parent.uuid)
                    .build(),
                new FocusHierarchyPayloadBuilder().uuid(newRow.uuid).build(),
            )
        })
        payloads.push(new SetExpressionPayloadBuilder()
            .expression(rowExpression)
            .uuid(this.target)
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

    public names(names: readonly string[]): this {
        this.getImpl().names = names
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'target',
        'names',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
