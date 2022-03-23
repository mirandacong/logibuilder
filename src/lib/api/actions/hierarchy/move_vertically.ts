import {Builder} from '@logi/base/ts/common/builder'
import {canMoveVertically} from '@logi/src/lib/api/common'
import {
    AddChildPayloadBuilder,
    FocusHierarchyPayloadBuilder,
    HierarchyPayload,
    RemoveChildPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {
    getSubnodes,
    isNode,
    isRow,
    isRowBlock,
    isTable,
    Node,
} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../type'

import {Action as Base} from './base'

/**
 * Move the nodes in the same parent up or down one step.
 * Only the nodes not at the top can be moved up and the nodes not at the bottom
 * can be moved down.
 */
export interface Action extends Base {
    readonly targets: readonly string[]
    readonly isUp: boolean
}

class ActionImpl implements Action {
    public targets!: readonly string[]
    public isUp!: boolean
    public actionType = ActionType.MOVE_VERTICALLY

    public getPayloads(
        service: Readonly<EditorService>,
    ): readonly HierarchyPayload[] {
        const nodesMap = service.bookMap
        const payloads: HierarchyPayload[] = []
        const nodes: Readonly<Node>[] = []
        this.targets.forEach((uuid: string): void => {
            const node = nodesMap.get(uuid)
            if (node === undefined)
                return
            nodes.push(node)
        })
        if (!canMoveVertically(nodes, this.isUp))
            return []
        const parent = nodes[0].parent
        if (!isNode(parent))
            return []
        let subNodes: readonly Readonly<Node>[] = []
        if (!isTable(parent))
            subNodes = getSubnodes(parent)
        else
            subNodes = isRow(nodes[0]) || isRowBlock(nodes[0])
                ? parent.rows
                : parent.cols

        this.targets.forEach((uuid: string): void => {
            const focus = new FocusHierarchyPayloadBuilder().uuid(uuid).build()
            payloads.push(focus)
        })
        if (this.isUp) {
            const upSorted = nodes.sort((
                a: Readonly<Node>,
                b: Readonly<Node>,
            ): number => subNodes.indexOf(a) < subNodes.indexOf(b) ? -1 : 1)
            payloads.push(...getMovingUpPayloads(upSorted, parent, subNodes))
            return payloads
        }
        const downSorted = nodes.sort((
            a: Readonly<Node>,
            b: Readonly<Node>,
        ): number => subNodes.indexOf(a) < subNodes.indexOf(b) ? 1 : -1)
        payloads.push(...getMovingDownPayloads(downSorted, parent, subNodes))
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

function getMovingUpPayloads(
    nodes: readonly Readonly<Node>[],
    parent: Readonly<Node>,
    subNodes: readonly Readonly<Node>[],
): readonly HierarchyPayload[] {
    const payloads: HierarchyPayload[] = []
    const positions = nodes.map((n: Readonly<Node>): number =>
        subNodes.indexOf(n))
    nodes.forEach((n: Readonly<Node>, idx: number): void => {
        const pos = positions[idx]
        /**
         * Skip nodes at the top.
         */
        if (pos === idx)
            return
        const rm = new RemoveChildPayloadBuilder()
            .uuid(parent.uuid)
            .child(n.uuid)
            .build()
        payloads.push(rm)
        const add = new AddChildPayloadBuilder()
            .uuid(parent.uuid)
            .child(n)
            .position(pos - 1)
            .build()
        payloads.push(add)
    })
    return payloads
}

function getMovingDownPayloads(
    nodes: readonly Readonly<Node>[],
    parent: Readonly<Node>,
    subNodes: readonly Readonly<Node>[],
): readonly HierarchyPayload[] {
    const payloads: HierarchyPayload[] = []
    const positions = nodes.map((n: Readonly<Node>): number =>
        subNodes.indexOf(n))
    nodes.forEach((n: Readonly<Node>, idx: number): void => {
        const pos = positions[idx]
        /**
         * Skip nodes at the bottom.
         */
        if (pos === subNodes.length - idx - 1)
            return
        const rm = new RemoveChildPayloadBuilder()
            .uuid(parent.uuid)
            .child(n.uuid)
            .build()
        payloads.push(rm)
        const add = new AddChildPayloadBuilder()
            .uuid(parent.uuid)
            .child(n)
            .position(pos + 1)
            .build()
        payloads.push(add)
    })
    return payloads
}
