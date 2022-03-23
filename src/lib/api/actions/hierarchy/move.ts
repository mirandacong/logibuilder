import {Builder} from '@logi/base/ts/common/builder'
import {
    AddChildPayloadBuilder,
    FocusHierarchyPayloadBuilder,
    HierarchyPayload,
    RemoveChildPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {
    isBook,
    isColumn,
    isColumnBlock,
    isFormulaBearer,
    isNode,
    isRow,
    isRowBlock,
    isSheet,
    isTable,
    isTitle,
    Node,
} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../type'

import {Action as Base} from './base'
import {
    getChildIndex,
    getUpdateDepExprPayload,
    getUpdateRdepExprPayload,
} from './lib'

/**
 * Move nodes to the target node. The position of target node is before the
 * the nodes is moved.
 */
export interface Action extends Base {
    readonly target: string
    readonly children: readonly string[]
    readonly position?: number
}

class ActionImpl implements Action {
    public target!: string
    public children: readonly string[] = []
    public position?: number
    public actionType = ActionType.MOVE

    // tslint:disable-next-line: max-func-body-length
    public getPayloads(
        service: Readonly<EditorService>,
    ): readonly HierarchyPayload[] {
        const nodesMap = service.bookMap
        const payloads: HierarchyPayload[] = []
        const target = nodesMap.get(this.target)
        if (target === undefined)
            return []
        const children = this.children
            .reduce(
                (res: Readonly<Node>[], uuid: string): Readonly<Node>[] => {
                    const child = nodesMap.get(uuid)
                    if (child !== undefined)
                        res.push(child)
                    return res
                },
                [],
            )
            .reverse()
            .filter((child: Readonly<Node>): boolean => canMove(target, child))
        let position = this.position
        if (position !== undefined)
            children.forEach((child: Readonly<Node>): void => {
                if (child.parent !== target)
                    return
                if (position === undefined || this.position === undefined)
                    return
                if (getChildIndex(child) < this.position)
                    position -= 1
            })
        children.forEach((child: Readonly<Node>): void => {
            const parent = child.parent
            if (!isNode(parent))
                return
            const rmPayload = new RemoveChildPayloadBuilder()
                .uuid(parent.uuid)
                .child(child.uuid)
                .build()
            payloads.push(rmPayload)
        })
        children.forEach((child: Readonly<Node>): void => {
            const addPayload = new AddChildPayloadBuilder()
                .uuid(this.target)
                .child(child)
                .position(position)
                .build()
            payloads.push(addPayload)
            payloads.push(...getUpdateRdepExprPayload(child, service))
            payloads.push(...getUpdateDepExprPayload(child))
            const focus = new FocusHierarchyPayloadBuilder()
                .uuid(child.uuid)
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

    public children(children: readonly string[]): this {
        this.getImpl().children = children
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

// tslint:disable-next-line: cyclomatic-complexity
function canMove(parent: Readonly<Node>, child: Readonly<Node>): boolean {
    if (isBook(parent) && isSheet(child))
        return true
    if (isSheet(parent) && (isTable(child) || isTitle(child)))
        return true
    if (isTitle(parent) && isTitle(child))
        return true
    if (isTable(parent) &&
        (isFormulaBearer(child) || isColumnBlock(child) || isRowBlock(child)))
        return true
    if (isColumnBlock(parent) && (isColumnBlock(child) || isColumn(child)))
        return true
    if (isRowBlock(parent) && (isRowBlock(child) || isRow(child)))
        return true
    return false
}
