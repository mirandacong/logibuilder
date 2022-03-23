// tslint:disable: max-file-line-count
import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {AddSeparatorAction, AddSeparatorActionBuilder} from '@logi/src/lib/api'
import {
    isColumn,
    isColumnBlock,
    isNode,
    isRow,
    isRowBlock,
    isTable,
    isTitle,
    Node,
    NodeType,
    Sheet,
} from '@logi/src/lib/hierarchy/core'
import {
    AddNode,
    AddNodeBuilder,
} from '@logi/src/web/core/editor/node-edit/add_node'
import {TableTabView} from '@logi/src/web/core/editor/table-tab-status'

import {getInsertPosition} from './lib'

/**
 * On click add specific node button in top toolbar->edit.
 */
export function getList(node?: Readonly<Node>): readonly Readonly<AddItem>[] {
    const isUndefined = node === undefined
    const titleDisabled = isUndefined ? false : isRowBlock(node) ||
        isRow(node) || isColumnBlock(node) || isColumn(node)
    const blockDisabled = (isUndefined || isTitle(node)) ? true : false
    return [
        new AddItemBuilder()
            .nodeType(NodeType.TITLE)
            .disabled(titleDisabled)
            .text('添加标题')
            .build(),
        new AddItemBuilder()
            .nodeType(NodeType.TABLE)
            .disabled(false)
            .text('添加表格')
            .build(),
        new AddItemBuilder()
            .nodeType(NodeType.COLUMN_BLOCK)
            .disabled(blockDisabled)
            .text('添加组')
            .build(),
    ]
}

export function getSnippetList(): readonly Readonly<AddItem>[] {
    return [
        new AddItemBuilder()
            .disabled(false)
            .type(ToolbarBtnType.SUM)
            .text('求和')
            .build(),
        new AddItemBuilder()
            .disabled(true)
            .type(ToolbarBtnType.FORECAST)
            .text('分项预测')
            .build(),
        new AddItemBuilder()
            .disabled(true)
            .type(ToolbarBtnType.GROWTH_RATE)
            .text('计算增长率')
            .build(),
        new AddItemBuilder()
            .disabled(true)
            .type(ToolbarBtnType.PREDICT_BASE_LAST_YEAR)
            .text('根据前一年预测')
            .build(),
        new AddItemBuilder()
            .disabled(true)
            .type(ToolbarBtnType.PREDICT_BASE_HIST_AVERAGE)
            .text('根据历史平均值预测')
            .build(),
    ]
}

/**
 * Each item display in dropdown menu after click add menu.
 */
export interface AddItem {
    readonly disabled: boolean
    readonly text: string
    readonly type?: ToolbarBtnType,
    readonly nodeType?: NodeType,
    readonly icon: ToolbarBtnType,
    updateDisabled(disabled: boolean): void
}

class AddItemImpl implements Impl<AddItem> {
    public disabled = true
    public text = ''
    public type?: ToolbarBtnType
    public nodeType?: NodeType
    public icon = ToolbarBtnType.UNDEFINED
    public updateDisabled(disabled: boolean): void {
        this.disabled = disabled
    }
}

export class AddItemBuilder extends Builder<AddItem, AddItemImpl> {
    public constructor(obj?: Readonly<AddItem>) {
        const impl = new AddItemImpl()
        if (obj)
            AddItemBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public disabled(disabled: boolean): this {
        this.getImpl().disabled = disabled
        return this
    }

    public text(text: string): this {
        this.getImpl().text = text
        return this
    }

    public type(type: ToolbarBtnType): this {
        this.getImpl().type = type
        return this
    }

    public nodeType(nodeType: NodeType): this {
        this.getImpl().nodeType = nodeType
        return this
    }

    public icon(icon: ToolbarBtnType): this {
        this.getImpl().icon = icon
        return this
    }

    protected get daa(): readonly string[] {
        return AddItemBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['text']
}

export function isAddItem(value: unknown): value is AddItem {
    return value instanceof AddItemImpl
}

export function assertIsAddItem(value: unknown): asserts value is AddItem {
    if (!(value instanceof AddItemImpl))
        throw Error('Not a AddItem!')
}

/**
 * On click 'Add Title' in top toolbar.
 */
export function itemAddTitle(
    nodes: readonly Readonly<Node>[],
    sheet: Readonly<Sheet>,
): Readonly<AddNode> | undefined {
    const builder = new AddNodeBuilder().addType(NodeType.TITLE)
    if (nodes.length === 0)
        return builder.parent(sheet).build()
    if (isTable(nodes[0]))
        return addPeerNode(builder, nodes[0])
    if (!isTitle(nodes[0]))
        return
    const parent = nodes[0].parent
    if (parent === null)
        return
    return builder.parent(parent).build()
}

/**
 * On click 'Add Table' in top toolbar.
 */
export function itemAddTable(
    nodes: readonly Readonly<Node>[],
    sheet: Readonly<Sheet>,
): Readonly<AddNode> | undefined {
    const builder = new AddNodeBuilder().addType(NodeType.TABLE)
    if (nodes.length === 0)
        return builder.parent(sheet).build()
    if (isTable(nodes[0]))
        return addPeerNode(builder, nodes[0])
    if (isTitle(nodes[0])) {
        const topTitle = nodes[0].getAncestors().find(isTitle)
        if (topTitle === undefined)
            return
        const index = sheet.tree.indexOf(topTitle)
        return builder.parent(sheet).index(index + 1).build()
    }
    const table = nodes[0].findParent(NodeType.TABLE)
    if (table === undefined || !isTable(table))
        return
    return addPeerNode(builder, table)
}

/**
 * On click 'Add Row' or 'Add Column' in top toolbar.
 */
export function itemAddRowOrColumn(
    nodes: readonly Readonly<Node>[],
    type: NodeType,
): Readonly<AddNode> | undefined {
    if (nodes.length === 0 || nodes.length !== 1)
        return
    const builder = new AddNodeBuilder().addType(type)
    if (type === NodeType.ROW) {
        if (isTable(nodes[0]) || isRowBlock(nodes[0]))
            return builder.parent(nodes[0]).build()
        if (!isRow(nodes[0]))
            return
        return addPeerNode(builder, nodes[0])
    }
    if (type === NodeType.COLUMN) {
        if (isTable(nodes[0]) || isColumnBlock(nodes[0]))
            return builder.parent(nodes[0]).build()
        if (!isColumn(nodes[0]))
            return
        return addPeerNode(builder, nodes[0])
    }
    return
}

/**
 * On click 'Add Block' in top toolbar.
 */
export function itemAddBlock(
    nodes: readonly Readonly<Node>[],
    tabType: TableTabView,
): Readonly<AddNode> | undefined {
    if (nodes.length === 0 || nodes.length !== 1)
        return
    const type = tabType === TableTabView.COLUMN ? NodeType.COLUMN_BLOCK :
        NodeType.ROW_BLOCK
    const builder = new AddNodeBuilder().addType(type)
    if (isTable(nodes[0]) || isRowBlock(nodes[0]) || isColumnBlock(nodes[0]))
        return builder.parent(nodes[0]).build()
    if (isRow(nodes[0]) || isColumn(nodes[0]))
        return addPeerNode(builder, nodes[0])

    return
}

/**
 * `curr` is title, add sub title.
 * `curr` is table, add column or row depend on `tabStatus`.
 * `curr` is rowblock, add sub row.
 * `curr` is row, add peer row under `curr`.
 * `curr` is column block, add sub column.
 * `curr` is column, add peer column under `curr`.
 */
export function onClickAddNode(
    curr: Readonly<Node>,
    // tslint:disable-next-line: no-optional-parameter
    tabStatus?: TableTabView,
): Readonly<AddNode> | undefined {
    const addnode = new AddNodeBuilder().parent(curr)
    const parent = curr.parent
    if (parent === null || !isNode(parent))
        return
    const index = getInsertPosition(curr)
    const type = getAddType(curr, tabStatus)
    if (type === undefined)
        return
    addnode.addType(type)
    if (isColumn(curr) || isRow(curr))
        addnode.index(index).parent(parent)
    return addnode.build()
}

export function getAddType(
    curr: Readonly<Node>,
    // tslint:disable-next-line: no-optional-parameter
    tabStatus?: TableTabView,
): NodeType | undefined {
    if (isTitle(curr))
        return NodeType.TITLE
    if (isTable(curr)) {
        if (tabStatus === undefined)
            return
        return tabStatus === TableTabView.COLUMN ? NodeType.COLUMN :
            NodeType.ROW
    }
    if (isRow(curr) || isRowBlock(curr))
        return NodeType.ROW
    if (isColumn(curr) || isColumnBlock(curr))
        return NodeType.COLUMN
    return
}

export function getAddSeparatorAction(
    node: Readonly<Node>,
    tabStatus: TableTabView,
): AddSeparatorAction | undefined {
    const addNode = onClickAddNode(node, tabStatus)
    if (addNode === undefined)
        return
    const type = tabStatus === TableTabView.ROW ? NodeType.ROW : NodeType.COLUMN
    const action = new AddSeparatorActionBuilder()
        .target(addNode.parent.uuid)
        .name('')
        .type(type)
    if (addNode.index !== undefined)
        action.position(addNode.index)
    return action.build()
}

function addPeerNode(
    builder: AddNodeBuilder,
    node: Readonly<Node>,
): undefined | Readonly<AddNode> {
    const parent = node.parent
    if (parent === null || !isNode(parent))
        return
    const index = getInsertPosition(node)
    return builder.parent(parent).index(index).build()
}
/**
 * TODO(liminglong): ng-icon-group build enum,key-value corresponding id
 */
// tslint:disable-next-line: const-enum
export enum ToolbarBtnType {
    UNDEFINED = '',
    COMMENT = 'ic_comment',
    PUBLISH = 'ic_publish',
    SAVE = 'ic_start_save',
    SAVE_AS = 'ic_start_save_as',
    UNDO = 'ic_edit_undo',
    REDO = 'ic_edit_redo',
    CUT = 'ic_edit_cut',
    COPY = 'ic_edit_copy',
    PASTE = 'ic_edit_paste',
    ADD = 'ic_add_row',
    ADD_NODE = 'ic_add_node',
    EDIT_LABEL = 'ic_label_add',
    LOAD_TEMPLATE = 'ic_template_import',
    REMOVE = 'ic_remove',
    UP = 'ic_arrow_node_up',
    DOWN = 'ic_arrow_node_down',
    LEVEL_UP = 'ic_arrow_node_left',
    LEVEL_DOWN = 'ic_arrow_node_right',
    SEARCH = 'ic_search',
    SHOW_LABEL = 'ic_view_show_label',
    HIDE_LABEL = 'ic_view_hide_label',
    COMPACT_VIEW = 'ic_view_compact_view',
    EDITOR_VIEW = 'ic_view_editor_view',
    REFRESH = 'ic_refresh',
    ABORT = 'abort',
    DOCUMENT = 'document',
    FUNC_LIST = 'func_list',
    DROP_DOWN = 'ic_arrow_drop_down',
    INSERT_CLIP = 'ic_add_snippet',
    // '求和'
    SUM = 'sum',
    // '分项预测'
    FORECAST = 'forecast',
    // '计算增长率'
    GROWTH_RATE = 'growth_rate',
    // '根据历史平均增长率预测'
    BASE_HISTORICAL = 'base_historical',
    // '根据前一年预测'
    PREDICT_BASE_LAST_YEAR = 'predict_base_last_year',
    // '根据历史平均值预测'
    PREDICT_BASE_HIST_AVERAGE = 'predict_base_hist_average',
    PAINTFORMAT = 'ic_paintformat',
    PERCENT = 'ic_percent',
    CURRENCY = 'ic_currency',
    POINT_DEC= 'ic_point_dec',
    POINT_INC= 'ic_point_inc',
    UNDERLINE = 'ic_underline',
    STRIKETHROUGH = 'ic_strikethrough',
    BOLD = 'ic_bold',
    ITALIC = 'ic_italic',
    SEPARATOR = 'ic_separator',
    TEXT_COLOR = 'ic_text_color',
    LINE_STYLE = 'ic_line_style',
    CELL_COLOR = 'ic_cell_color',
    CELL_BORDER = 'ic_border',
    CELL_BORDER_BOTTOM = 'ic_border_bottom',
    CELL_BORDER_CLEAR = 'ic_border_clear',
    CELL_BORDER_COLOR = 'ic_border_color',
    CELL_BORDER_HORIZONTAL = 'ic_border_horizontal',
    CELL_BORDER_INNER = 'ic_border_inner',
    CELL_BORDER_LEFT = 'ic_border_left',
    CELL_BORDER_RIGHT = 'ic_border_right',
    CELL_BORDER_OUTER = 'ic_border_outer',
    CELL_BORDER_TOP = 'ic_border_top',
    CELL_BORDER_VERTICAL = 'ic_border_vertical',
    CELL_MERGE = 'ic_merge',
    ALIGN = 'ic_align',
    ALIGN_RIGHT = 'ic_align_right',
    ALIGN_CENTRE = 'ic_align_center',
    VALIGN = 'ic_valign',
    VALIGN_TOP = 'ic_valign_top',
    VALIGN_MIDDLE = 'ic_valign_middle',
    TEXT_WRAP = 'ic_text_wrap',
    TEXT_OVERFLOW = 'ic_text_overflow',
    TEXT_CLIP = 'ic_text_clip',
    LINK = 'ic_link',
    INSERT_CHART = 'ic_insert_chart',
    AUTO_TOGGLE = 'ic_autofilter_toggle',
    FUNCTION = 'ic_function',
    DECREASE = 'ic_decrease_indent',
    INCREASE = 'ic_increase_indent',
}
