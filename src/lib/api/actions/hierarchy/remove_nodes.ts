import {Builder} from '@logi/base/ts/common/builder'
import {
    FocusHierarchyPayloadBuilder,
    Payload,
    RemoveChildPayloadBuilder,
    SetActiveSheetPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {
    getSubnodes,
    isNode,
    isRow,
    isRowBlock,
    isSheet,
    isTable,
    Node,
} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../type'

import {Action as Base} from './base'

/**
 * Remove target nodes from each parent.
 */
export interface Action extends Base {
    readonly targets: readonly string[]
}

class ActionImpl implements Action {
    public targets: readonly string[] = []
    public actionType = ActionType.REMOVE_NODES

    // tslint:disable-next-line: max-func-body-length
    public getPayloads(service: Readonly<EditorService>): readonly Payload[] {
        const bookMap = service.bookMap
        const payloads: Payload[] = []
        const nodes = this.targets.reduce(
            (res: Readonly<Node>[], uuid: string): Readonly<Node>[] => {
                const node = bookMap.get(uuid)
                if (node !== undefined)
                    res.push(node)
                return res
            },
            [],
        )
        nodes.forEach((child: Readonly<Node>): void => {
            const parent = child.parent
            if (!isNode(parent))
                return
            payloads.push(new RemoveChildPayloadBuilder()
                .uuid(parent.uuid)
                .child(child.uuid)
                .build())
            const sublings: Readonly<Node>[] = []
            if (!isTable(parent))
                sublings.push(...getSubnodes(parent))
            else if (isRow(child) || isRowBlock(child))
                sublings.push(...parent.rows)
            else
                sublings.push(...parent.cols)
            const childIdx = sublings.indexOf(child)
            const focusNode = childIdx === sublings.length - 1
                ? sublings[childIdx - 1]
                : sublings[childIdx + 1]
            if (focusNode === undefined)
                return
            if (isSheet(focusNode)) {
                const acitveSheet = new SetActiveSheetPayloadBuilder()
                    .sheet(focusNode.name)
                    .build()
                payloads.push(acitveSheet)
            }
            const focus = new FocusHierarchyPayloadBuilder()
                .uuid(focusNode.uuid)
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

    public targets(targets: readonly string[]): this {
        this.getImpl().targets = targets
        return this
    }
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
