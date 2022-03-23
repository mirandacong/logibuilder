import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {preOrderWalk2} from '@logi/base/ts/common/walk_utils'
import {
    FocusHierarchyPayloadBuilder,
    FocusSourcePayloadBuilder,
    Payload,
    RemoveSliceAnnotationPayloadBuilder,
    SetSourcePayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {
    AnnotationKey,
    getNodesVisitor,
    isRow,
    isTable,
    Node,
    NodeType,
    SliceExpr,
} from '@logi/src/lib/hierarchy/core'
import {DatabaseSourceBuilder} from '@logi/src/lib/source'

import {ActionType} from '../../type'
import {Action as Base} from '../base'

export interface Action extends Base {
    /**
     * uuid of row.
     */
    readonly target: string
    /**
     * The target slice.
     */
    readonly slice: SliceExpr
    /**
     * Whether remove the linked source.
     */
    readonly removeSource: boolean
}

class ActionImpl implements Impl<Action> {
    public target!: string
    public slice!: SliceExpr
    public removeSource = true
    public actionType = ActionType.REMOVE_SLICE_DB_DATA

    // tslint:disable-next-line: max-func-body-length
    public getPayloads(service: Readonly<EditorService>): readonly Payload[] {
        const nodesMap = service.bookMap
        const row = nodesMap.get(this.target)
        if (!isRow(row))
            return []
        const payloads: Payload[] = []
        const index = row.sliceExprs.indexOf(this.slice)
        if (index < 0)
            return []
        payloads.push(new RemoveSliceAnnotationPayloadBuilder()
            .uuid(this.target)
            .index(index)
            .key(AnnotationKey.LINK_NAME)
            .build())
        payloads.push(new RemoveSliceAnnotationPayloadBuilder()
            .uuid(this.target)
            .index(index)
            .key(AnnotationKey.LINK_CODE)
            .build())
        const focus = new FocusHierarchyPayloadBuilder()
            .uuid(this.target)
            .slice(this.slice)
            .build()
        payloads.push(focus)
        if (!this.removeSource)
            return payloads
        const table = row.getTable()
        if (!isTable(table))
            return payloads
        const targets = preOrderWalk2(
            table,
            getNodesVisitor,
            [NodeType.COLUMN, NodeType.COLUMN_BLOCK],
        ).filter((n: Readonly<Node>): boolean =>
            n.name === this.slice.name || n.labels.includes(this.slice.name))
        const cols: Readonly<Node>[] = []
        targets.forEach((n: Readonly<Node>): void => {
            cols.push(...preOrderWalk2(n, getNodesVisitor, [NodeType.COLUMN]))
        })
        cols.forEach((col: Readonly<Node>): void => {
            const source = new DatabaseSourceBuilder().value('').build()
            const p = new SetSourcePayloadBuilder()
                .row(this.target)
                .col(col.uuid)
                .source(source)
                .build()
            payloads.push(p)
            const f = new FocusSourcePayloadBuilder()
                .row(this.target)
                .col(col.uuid)
                .build()
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
    public target(target: string): this {
        this.getImpl().target = target
        return this
    }

    public slice(slice: SliceExpr): this {
        this.getImpl().slice = slice
        return this
    }

    public removeSource(removeSource: boolean): this {
        this.getImpl().removeSource = removeSource
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'target',
        'slice',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
