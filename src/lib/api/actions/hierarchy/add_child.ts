import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {buildDcfHeader} from '@logi/src/lib/api/methods'
import {
    AddChildPayloadBuilder,
    FocusHierarchyPayloadBuilder,
    Payload,
    SetActiveSheetPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {
    BookBuilder,
    ColumnBlockBuilder,
    ColumnBuilder,
    isTable,
    Node,
    NodeType,
    RowBlockBuilder,
    RowBuilder,
    SCALAR_HEADER,
    SheetBuilder,
    TableBuilder,
    TitleBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../type'

import {Action as Base} from './base'

/**
 * Add new child to the target node.
 */
export interface Action extends Base {
    readonly target: string
    readonly name: string
    readonly type: NodeType
    readonly position?: number
}

class ActionImpl implements Impl<Action> {
    public target!: string
    public name!: string
    public type!: NodeType
    public position?: number
    public actionType = ActionType.ADD_CHILD
    public getPayloads(service: Readonly<EditorService>): readonly Payload[] {
        const nodesMap = service.bookMap
        const payloads: Payload[] = []
        const node = nodesMap.get(this.target)
        if (node === undefined)
            return []
        if (!isAllowType(node.nodetype, this.type))
            return []
        const child = getNewChild(this.type, this.name, service, this.target)
        if (child === undefined)
            return []

        const addPayload = new AddChildPayloadBuilder()
            .uuid(this.target)
            .child(child)
            .position(this.position)
            .build()
        const focus = new FocusHierarchyPayloadBuilder()
            .uuid(child.uuid)
            .build()
        payloads.push(addPayload, focus)
        if (this.type === NodeType.SHEET) {
            const activeSheet = new SetActiveSheetPayloadBuilder()
                .sheet(child.name)
                .build()
            payloads.push(activeSheet)
        }
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

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public type(type: NodeType): this {
        this.getImpl().type = type
        return this
    }

    public position(position?: number): this {
        this.getImpl().position = position
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'target',
        'name',
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

/**
 * Use builder to build a new node depend on type and name.
 */
function getNewChild(
    // tslint:disable-next-line: max-params
    type: NodeType,
    name = '',
    service: EditorService,
    parent: string,
): Readonly<Node> | undefined {
    switch (type) {
    case NodeType.BOOK:
        return new BookBuilder().name(name).build()
    case NodeType.SHEET:
        return new SheetBuilder().name(name).build()
    case NodeType.TITLE:
        return new TitleBuilder().name(name).build()
    case NodeType.TABLE:
        const stdHeader = service.templateSet.standardHeaders
            .find(h => h.name === service.templateSet.defaultHeader)
        if (stdHeader === undefined)
            return new TableBuilder()
                .name(name)
                .subnodes([
                    new RowBuilder().name('').build(),
                    new ColumnBuilder().name('').build(),
                ])
                .build()
        const cb = buildDcfHeader(stdHeader.reportDate, stdHeader.headerInfos)
        return new TableBuilder()
            .name(name)
            .subnodes([new RowBuilder().name('').build(), ...cb.tree.slice()])
            .referenceHeader(service.templateSet.defaultHeader ?? '')
            .build()
    case NodeType.ROW:
        const parentNode = service.bookMap.get(parent)
        const table = parentNode?.findParent(NodeType.TABLE)
        const isScalar = isTable(table) &&
            table.referenceHeader === SCALAR_HEADER
        return new RowBuilder().name(name).isDefScalar(isScalar).build()
    case NodeType.COLUMN:
        return new ColumnBuilder().name(name).build()
    case NodeType.ROW_BLOCK:
        return new RowBlockBuilder().name(name).build()
    case NodeType.COLUMN_BLOCK:
        return new ColumnBlockBuilder().name(name).build()
    default:
        return
    }
}

const ALLOW_TYPE_MAP = new Map([
    [NodeType.BOOK, [NodeType.SHEET]],
    [NodeType.SHEET, [NodeType.TABLE, NodeType.TITLE]],
    [NodeType.TITLE, [NodeType.TITLE]],
    [NodeType.COLUMN_BLOCK, [NodeType.COLUMN, NodeType.COLUMN_BLOCK]],
    [NodeType.ROW_BLOCK, [NodeType.ROW, NodeType.ROW_BLOCK]],
    [NodeType.TABLE, [
        NodeType.COLUMN,
        NodeType.COLUMN_BLOCK,
        NodeType.ROW,
        NodeType.ROW_BLOCK,
    ]],
])

function isAllowType(parent: NodeType, child: NodeType): boolean {
    const allowType = ALLOW_TYPE_MAP.get(parent)
    if (allowType === undefined)
        return false
    return allowType.includes(child)
}
