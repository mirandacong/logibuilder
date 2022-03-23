import {Builder} from '@logi/base/ts/common/builder'
import {Writable} from '@logi/base/ts/common/mapped_types'
import {
    AddChildPayloadBuilder,
    FocusHierarchyPayloadBuilder,
    Payload,
    RemoveChildPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {
    Column,
    ColumnBlock,
    getSubnodes,
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
    NodeType,
    Row,
    RowBlock,
} from '@logi/src/lib/hierarchy/core'
import {getCloneResult} from '@logi/src/lib/model'

import {ActionType} from '../type'

import {Action as Base} from './base'
import {
    getChildIndex,
    getPayloadsFromCloneResult,
    getUpdateDepExprPayload,
    getUpdateRdepExprPayload,
} from './lib'

/**
 * Paste nodes to the base node. It will filter illgel nodes.
 * Title and table will paste as the next sibling when the base node is
 * title and table.
 * Formular and block will paste as the next sibling when the base node is
 * formular.
 * Formular and block will paste into as the subnode when the base node is
 * table or block.
 */
export interface Action extends Base {
    readonly base: string
}

class ActionImpl implements Action {
    public base!: string
    public actionType = ActionType.PASTE

    // tslint:disable-next-line: max-func-body-length
    public getPayloads(service: Readonly<EditorService>): readonly Payload[] {
        const bookMap = service.bookMap
        const payloads: Payload[] = []
        const baseNode = bookMap.get(this.base)
        if (baseNode === undefined)
            return []
        const sheetPos = getSheetPos(baseNode)
        const titleOrTablePos = getTitleOrTablePos(baseNode)
        const formulaOrBlockPos = getFormulaOrBlockPos(baseNode)
        const uuids = service.clipboard.getNodes()
        const nodes = uuids
            .map((u: string): Readonly<Node> | undefined => bookMap.get(u))
            .filter(isNode)
        const reversed = [...nodes].reverse()
        const isCut = service.clipboard.isCut
        if (isCut) {
            calCutPostion(sheetPos, uuids, baseNode)
            calCutPostion(titleOrTablePos, uuids, baseNode)
            calCutPostion(formulaOrBlockPos, uuids, baseNode)
            nodes.forEach((n: Readonly<Node>): void => {
                if (n.parent === null)
                    return
                payloads.push(new RemoveChildPayloadBuilder()
                    .uuid(n.parent.uuid)
                    .child(n.uuid)
                    .build())
            })
        }
        /**
         * We insert into the same position so we should reverse the nodes then
         * they can get the correct order.
         * For example, insert [new1, new2] after row1 in Table[row1, row2].
         *                                               insert pos ^
         * We reserve the insert nodes and get [new2, new1].
         * Insert new2 fisrt, we can get Table[row1, new2, row2]
         * Insert new1 then, we can get Table[row1, new1, new2, row2]
         *
         * We don't use a self-increment postion because the insert nodes may
         * insert difference parents because of their types.
         */
        // tslint:disable-next-line: max-func-body-length cyclomatic-complexity
        reversed.forEach((oriNode: Readonly<Node>): void => {
            let n: Readonly<Node>
            if (isCut)
                n = oriNode
            // tslint:disable-next-line: brace-style
            else {
                const res = getCloneResult(
                    oriNode,
                    service.modifierManager,
                    service.sourceManager,
                    service.formulaManager,
                )
                n = res.clonedNode
                const clonePs = getPayloadsFromCloneResult(res)
                payloads.push(...clonePs)
            }
            if (isSheet(n))
                return
            if ((isTitle(n) || isTable(n)) && titleOrTablePos !== undefined) {
                payloads.push(new AddChildPayloadBuilder()
                    .child(n)
                    .uuid(titleOrTablePos.parent.uuid)
                    .position(titleOrTablePos.position)
                    .build())
                const f = new FocusHierarchyPayloadBuilder()
                    .uuid(n.uuid)
                    .build()
                payloads.push(f)
                return
            }
            if (!isColOrColBlock(n) && !isRowOrRowBlock(n) ||
                formulaOrBlockPos === undefined)
                return
            if (isColOrColBlock(n) && isRowOrRowBlock(baseNode) ||
                isRowOrRowBlock(n) && isColOrColBlock(baseNode))
                return
            const parent = formulaOrBlockPos.parent
            const payload = new AddChildPayloadBuilder()
                .child(n)
                .uuid(parent.uuid)
                .position(
                    formulaOrBlockPos.position ?? getLastPostion(parent, n),
                )
                .build()
            if (isFormulaBearer(n)) {
                payloads.push(...getUpdateRdepExprPayload(n, service))
                payloads.push(...getUpdateDepExprPayload(n))
            }
            const focus = new FocusHierarchyPayloadBuilder()
                .uuid(n.uuid)
                .build()
            payloads.push(focus)
            payloads.push(payload)
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

    public base(base: string): this {
        this.getImpl().base = base
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'base',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}

interface Position {
    readonly parent: Readonly<Node>
    readonly position: number | undefined
}

class PositionImpl implements Position {
    public parent!: Readonly<Node>
    public position!: number | undefined
}

export class PositionBuilder extends Builder<Position, PositionImpl> {
    public constructor(obj?: Readonly<Position>) {
        const impl = new PositionImpl()
        if (obj)
            PositionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public parent(parent: Readonly<Node>): this {
        this.getImpl().parent = parent
        return this
    }

    public position(position: number | undefined): this {
        this.getImpl().position = position
        return this
    }
}

function calCutPostion(
    pos: Position | undefined,
    nodes: readonly string[],
    base: Readonly<Node>,
): void {
    if (pos === undefined)
        return
    // tslint:disable-next-line: no-type-assertion
    const writable = pos as Writable<Position>
    if (writable.position === undefined)
        return
    const subNodes: Readonly<Node>[] = []
    if (!isTable(writable.parent))
        subNodes.push(...getSubnodes(writable.parent))
    else if (isRowOrRowBlock(base))
        subNodes.push(...writable.parent.rows)
    else
        subNodes.push(...writable.parent.cols)
    let count = 0
    subNodes.slice(0, pos.position).forEach((n: Readonly<Node>): void => {
        if (nodes.includes(n.uuid))
            count += 1
    })
    if (writable.position !== undefined)
        writable.position -= count
}

function getFormulaOrBlockPos(baseNode: Readonly<Node>): Position | undefined {
    if (isTable(baseNode))
        return new PositionBuilder()
            .parent(baseNode)
            .position(undefined)
            .build()
    if (!isRowOrRowBlock(baseNode) && !isColOrColBlock(baseNode))
        return
    /**
     * The node is col or row template root.
     */
    if ((isColumnBlock(baseNode) || isRowBlock(baseNode))
        && baseNode.parent === null)
        return new PositionBuilder()
            .parent(baseNode)
            .position(baseNode.tree.length)
            .build()
    const position = getChildIndex(baseNode) + 1
    if (position === 0)
        return
    const parent = baseNode.parent
    if (!isNode(parent))
        return
    return new PositionBuilder().parent(parent).position(position).build()
}

function getTitleOrTablePos(baseNode: Readonly<Node>): Position | undefined {
    if (isSheet(baseNode))
        return new PositionBuilder()
            .parent(baseNode)
            .position(baseNode.tree.length)
            .build()
    /**
     * Should not paste tabel to table that in template.
     */
    if (isTable(baseNode) && baseNode.getBook() === undefined)
        return
    const node = baseNode.findParent(NodeType.TITLE) ??
        baseNode.findParent(NodeType.TABLE)
    if (node === undefined)
        return
    const position = getChildIndex(node) + 1
    if (position === 0)
        return
    const parent = node.parent
    if (!isNode(parent))
        return
    return new PositionBuilder().parent(parent).position(position).build()
}

function getSheetPos(baseNode: Readonly<Node>): Position | undefined {
    if (isBook(baseNode))
        return new PositionBuilder()
            .parent(baseNode)
            .position(baseNode.sheets.length)
            .build()
    if (!isSheet(baseNode))
        return
    const parent = baseNode.parent
    if (!isNode(parent))
        return
    const position = getChildIndex(baseNode) + 1
    if (position === 0)
        return
    return new PositionBuilder().parent(parent).position(position).build()
}

function isRowOrRowBlock(node: unknown): node is Readonly<Row | RowBlock> {
    return isRow(node) || isRowBlock(node)
}

function isColOrColBlock(n: unknown): n is Readonly<Column | ColumnBlock> {
    return isColumn(n) || isColumnBlock(n)
}

function getLastPostion(parent: Readonly<Node>, child: Readonly<Node>): number {
    if (!isTable(parent))
        return getSubnodes(parent).length
    return isRowOrRowBlock(child) ? parent.rows.length : parent.cols.length
}
