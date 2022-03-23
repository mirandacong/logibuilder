import {Builder} from '@logi/base/ts/common/builder'
import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {canChangeLevel} from '@logi/src/lib/api/common'
import {
    AddChildPayloadBuilder,
    FocusHierarchyPayloadBuilder,
    HierarchyPayload,
    RemoveChildPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {
    getNodesVisitor,
    getSubnodes,
    isNode,
    isRowBlock,
    Node,
    NodeType,
    RowBlockBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../type'

import {Action as Base} from './base'
import {getUpdateDepExprPayload, getUpdateRdepExprPayload} from './lib'

/**
 * Change level of rows in the same parent.
 * The neighboring rows will be grouped together and different groups will
 * insert into different row blocks.
 */
export interface Action extends Base {
    readonly targets: readonly string[]
    readonly isUp: boolean
}

class ActionImpl implements Action {
    public targets!: readonly string[]
    public isUp!: boolean
    public actionType = ActionType.LEVEL_CHANGE

    // tslint:disable-next-line: max-func-body-length
    public getPayloads(
        service: Readonly<EditorService>,
    ): readonly HierarchyPayload[] {
        const nodesMap = service.bookMap
        const payloads: HierarchyPayload[] = []
        const nodes: Readonly<Node>[] = []
        this.targets.forEach((uuid: string): void => {
            const row = nodesMap.get(uuid)
            if (row === undefined)
                return
            nodes.push(row)
        })
        if (!canChangeLevel(nodes, this.isUp))
            return []
        const parent = nodes[0].parent
        if (!isNode(parent))
            return []
        const subNodes = getSubnodes(parent)
        const groupRows: Readonly<Node>[][] = []
        let group: Readonly<Node>[] = []
        /**
         * Group neighboring rows together.
         */
        subNodes.slice().reverse().forEach((n: Readonly<Node>): void => {
            if (nodes.includes(n)) {
                group.push(n)
                return
            }
            if (group.length === 0)
                return
            groupRows.push(group.reverse())
            group = []
        })
        if (group.length !== 0)
            groupRows.push(group.reverse())
        groupRows.forEach((rows: Readonly<Node>[]): void => {
            rows.forEach((r: Readonly<Node>): void => {
                const rmPayload = new RemoveChildPayloadBuilder()
                    .child(r.uuid)
                    .uuid(parent.uuid)
                    .build()
                payloads.push(rmPayload)
                const subRows = preOrderWalk(r, getNodesVisitor, [NodeType.ROW])
                subRows.forEach((sub: Readonly <Node>): void => {
                    payloads.push(...getUpdateDepExprPayload(sub))
                    payloads.push(...getUpdateRdepExprPayload(sub, service))
                })
            })
            if (this.isUp) {
                payloads.push(...getLevelUpPayloads(rows, parent))
                return
            }
            payloads.push(...getLevelDownPayloads(rows, parent))
        })
        this.targets.forEach((uuid: string): void => {
            const focus = new FocusHierarchyPayloadBuilder().uuid(uuid).build()
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

    public targets(targets: readonly string[]): this {
        this.getImpl().targets = targets
        return this
    }

    public isUp(isUp: boolean): this {
        this.getImpl().isUp = isUp
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'targets',
        'isUp',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}

export function getLevelUpPayloads(
    rows: readonly Readonly<Node>[],
    parent: Readonly<Node>,
): readonly HierarchyPayload[] {
    const payloads: HierarchyPayload[] = []
    const grandparent = parent.parent
    if (!isRowBlock(parent) || !isNode(grandparent))
        return []
    const index = getSubnodes(grandparent).indexOf(parent)
    rows.slice().reverse().forEach((r: Readonly<Node>): void => {
        const upAddPayload = new AddChildPayloadBuilder()
            .child(r)
            .uuid(grandparent.uuid)
            .position(index + 1)
            .build()
        payloads.push(upAddPayload)
    })
    if (parent.tree.length > rows.length)
        return payloads
    /**
     * If the row block has no sub nodes, remove it.
     */
    const rmRowBlock = new RemoveChildPayloadBuilder()
        .child(parent.uuid)
        .uuid(grandparent.uuid)
        .build()
    payloads.push(rmRowBlock)
    return payloads
}

export function getLevelDownPayloads(
    rows: readonly Readonly<Node>[],
    parent: Readonly<Node>,
): readonly HierarchyPayload[] {
    const payloads: HierarchyPayload[] = []
    const subNodes = getSubnodes(parent)
    const idx = subNodes.indexOf(rows[0])
    const sibling = subNodes[idx - 1]
    /**
     * If the last sibling is row block, insert into it.
     */
    if (isRowBlock(sibling)) {
        rows.forEach((r: Readonly<Node>): void => {
            const addPayload = new AddChildPayloadBuilder()
                .child(r)
                .uuid(sibling.uuid)
                .build()
            payloads.push(addPayload)
        })
        return payloads
    }
    /**
     * If the last sibling is not row block, create a row block and insert into
     * it.
     */
    const rb = new RowBlockBuilder().name('Block').build()
    const addRbPayload = new AddChildPayloadBuilder()
        .child(rb)
        .uuid(parent.uuid)
        .position(idx)
        .build()
    payloads.push(addRbPayload)
    rows.forEach((r: Readonly<Node>): void => {
        const p = new AddChildPayloadBuilder().child(r).uuid(rb.uuid).build()
        payloads.push(p)
    })
    return payloads
}
