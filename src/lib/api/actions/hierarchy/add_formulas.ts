import {Builder} from '@logi/base/ts/common/builder'
import {
    AddChildPayloadBuilder,
    FocusHierarchyPayloadBuilder,
    HierarchyPayload,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {
    ColumnBuilder,
    getSubnodes,
    isColumn,
    isColumnBlock,
    isRow,
    isRowBlock,
    isTable,
    Node,
    NodeType,
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
    readonly isScalar: boolean
    readonly type: NodeType.ROW | NodeType.COLUMN
}

class ActionImpl implements Action {
    public target!: string
    public names!: readonly string[]
    public isScalar = false
    public type!: NodeType.ROW | NodeType.COLUMN
    public actionType = ActionType.ADD_FORMULAS

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
        if (!canAdd(node, this.type))
            return []
        const parent = isRow(node) || isColumn(node)
            ? node.parent
            : node
        if (parent === null)
            return []
        const position = isRow(node) || isColumn(node)
            ? getChildIndex(node) + 1
            : getSubnodes(node).length + 1
        this.names.forEach((name: string, idx: number): void => {
            const pos = position + idx
            const ctor = this.type === NodeType.ROW ? new RowBuilder()
                .isDefScalar(this.isScalar) : new ColumnBuilder()
            const fb = ctor.name(name).build()
            payloads.push(new AddChildPayloadBuilder()
                .uuid(parent.uuid)
                .child(fb)
                .position(pos)
                .build(),
            )
            const focus = new FocusHierarchyPayloadBuilder()
                .uuid(fb.uuid)
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

    public isScalar(isScalar: boolean): this {
        this.getImpl().isScalar = isScalar
        return this
    }

    public names(names: readonly string[]): this {
        this.getImpl().names = names
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
        'names',
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

function canAdd(
    node: Readonly<Node>,
    type: NodeType.COLUMN | NodeType.ROW,
): boolean {
    if (!(isTable(node) || isRowBlock(node) || isColumnBlock(node) ||
        isRow(node) || isColumn(node)))
        return false
    if ((isRowBlock(node) || isRow(node)) && type === NodeType.COLUMN)
        return false
    if (isColumnBlock(node) || isColumn(node) && type === NodeType.ROW)
        return false
    return true
}
