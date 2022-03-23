import {Injectable, ViewContainerRef} from '@angular/core'
import {
    Column,
    DataType,
    FormulaBearer,
    isColumn,
    isFormulaBearer,
    isRow,
    isTable,
    Node,
    NodeType,
    Row,
    SCALAR_HEADER,
    Table,
} from '@logi/src/lib/hierarchy/core'
import {ContextMenuItem} from '@logi/src/web/common/context-menu'
import {CleanDataService} from '@logi/src/web/core/editor/clean-data'
import {NodeEditService} from '@logi/src/web/core/editor/node-edit/service'
import {
    TableTabStatusService,
    TableTabView,
} from '@logi/src/web/core/editor/table-tab-status'
import {StudioApiService} from '@logi/src/web/global/api'
import {haveStandarHeader} from '@logi/src/web/global/api/hierarchy'

@Injectable()
/**
 * Service for node edit.
 */
export class ContextMenuActionService {
    public constructor(
        private readonly _editSvc: NodeEditService,
        private readonly _studioApiSvc: StudioApiService,
        private readonly _cleanDataSvc: CleanDataService,
        private readonly _tableTabStatusService: TableTabStatusService,
    ) { }

    public getSubActions (): readonly ContextMenuItem[] {
        const node = this._editSvc.getSelectedNode()
        if (isTable(node))
            return this.initTableSubContextMenu(node)
        if (isRow(node))
            return this._initRowType(node)
        return []
    }

    // tslint:disable-next-line: max-func-body-length cyclomatic-complexity
    public getActions (
        isTemplate: boolean,
        viewContainerRef?: ViewContainerRef,
    ): readonly ContextMenuItem[] {
        const nodes = this._editSvc.getSelectedNodes()
        if (nodes.length === 0)
            return []
        if (nodes.length > 1)
            return isPureRowOrCol(nodes) ? this
                ._getRowsAndColsActions(nodes) : this._getNodesActions()
        const node = nodes[0]
        const type = node.nodetype
        if ((isRow(node) || isColumn(node)) && node.separator)
            return this._getSeparatedActions(isRow(node))
        if (isRow(node))
            return this._getRowActions(node)
        if (type === NodeType.ROW_BLOCK) {
            if (isTemplate && node.parent === null)
                return this._getRowTemplateActions()
            return this._getRowBlockActions()
        }
        if (isColumn(node))
            return this._getColumnActions(node, viewContainerRef)
        if (type === NodeType.COLUMN_BLOCK) {
            if (isTemplate && node.parent === null)
                return this._getColumnTemplateActions()
            return this._getColumnBlockActions()
        }
        if (isTable(node) && !isTemplate)
            return this._getTableActions(node)
        if (isTable(node) && isTemplate)
            return this._getTableTemplateActions(node)
        if (type === NodeType.TITLE)
            return this._getTitleActions()
        return []
    }

    public getTableSubMenu (
        table: Readonly<Table>
    ): readonly ContextMenuItem[] {
        const isCustomize = table.referenceHeader === undefined
        return [
            {
                click: (): void => this._editSvc.unlinkStandardHeader(table),
                divider: false,
                enabled: true,
                html: (): string => '使用自定义列',
                // @ts-ignore
                isCurr: isCustomize,
                visible: true,
            },
            {
                click: (): void => this._editSvc.deployHeader(),
                divider: false,
                enabled: true,
                html: (): string => '配置表头',
                visible: true,
            },
        ]
    }

    /**
     * Init submenu in table contextmenu.
     */
    public initTableSubContextMenu (
        table: Readonly<Table>,
    ): readonly ContextMenuItem[] {
        const templateSet = this._studioApiSvc.currTemplateSet()
        const headerMenu: ContextMenuItem[] = []
        templateSet.standardHeaders.forEach(header => {
            const isCurr = table.referenceHeader === header.name
            headerMenu.push({
                click: (): void => this._editSvc
                    .setReferenceHeader(table, header.name),
                divider: false,
                enabled: true,
                html: (): string => header.name,
                isCurr,
                visible: true,
                showToolTip: true,
            })
        })
        if (headerMenu.length !== 0)
            headerMenu.push({
                divider: true,
                enabled: true,
                html: (): string => '',
                visible: true,
            })
        const singleColMenu = this._getTableSingleColMenu(table)
        return [...singleColMenu, ...headerMenu, ...this.getTableSubMenu(table)]
    }

    private _getSeparatedActions (
        isRowNode: boolean,
    ): readonly ContextMenuItem[] {
        return [
            {
                click: (): void => this._editSvc
                    .addSiblingNode(isRowNode ? NodeType.ROW : NodeType.COLUMN),
                divider: false,
                enabled: true,
                html: (): string => `${isRowNode ? '添加行' : '添加列'}`,
                visible: true,
            },
            {
                click: (): void => this._editSvc.addSiblingNode(
                    isRowNode ? NodeType.ROW_BLOCK : NodeType.COLUMN_BLOCK,
                ),
                divider: false,
                enabled: true,
                html: (): string => '添加组',
                visible: true,
            },
            {
                divider: true,
                enabled: true,
                html: (): string => '',
                visible: true,
            },
            {
                click: (): void => this._editSvc.remove(),
                divider: false,
                enabled: true,
                html: (): string => `${isRowNode ? '删除分隔行' : '删除分隔列'}`,
                visible: true,
            },
        ]
    }

    private _getRowsAndColsActions (
        nodes: readonly Readonly<Node>[],
    ): readonly ContextMenuItem[] {
        const allNotHasSlice = nodes
            .filter(isFormulaBearer)
            .find(fb => fb.sliceExprs.length !== 0) === undefined
        return this._getBaseActions().concat([
            {
                divider: true,
                enabled: true,
                html: (): string => '',
                visible: true,
            },
            {
                click: (): void => this._editSvc.batchAddSlices(),
                divider: false,
                enabled: true,
                html: (): string => '添加切片',
                shortcut: 'Alt+S',
                visible: true,
            },
            {
                click: (): void => this._editSvc.cancelSlices(),
                divider: false,
                enabled: true,
                html: (): string => '取消切片',
                shortcut: 'Alt+Shift+S',
                visible: !allNotHasSlice,
            },
            {
                divider: true,
                enabled: true,
                html: (): string => '',
                visible: true,
            },
            {
                click: (): void => this._editSvc.remove(),
                divider: false,
                enabled: true,
                html: (): string => '删除',
                visible: true,
            },
        ])
    }

    private _getTitleActions (): readonly ContextMenuItem[] {
        const baseActions = this._getBaseActions()
        const actions: readonly ContextMenuItem[] = [
            {
                divider: true,
                enabled: true,
                html: (): string => '',
                visible: true,
            },
            {
                click: (): void => this._editSvc.addChild(NodeType.TITLE),
                divider: false,
                enabled: true,
                html: (): string => '添加子标题',
                visible: true,
            },
            {
                divider: true,
                enabled: true,
                html: (): string => '',
                visible: true,
            },
            {
                click: (): void => this._editSvc.remove(),
                divider: false,
                enabled: true,
                html: (): string => '删除标题',
                visible: true,
            },
        ]
        return baseActions.concat(actions)
    }

    private _getTableSingleColMenu (
        table: Readonly<Table>,
    ): readonly ContextMenuItem[] {
        const isCurr = table.referenceHeader === SCALAR_HEADER
        return [
            {
                click: (): void => this._editSvc
                    .setReferenceHeader(table, SCALAR_HEADER),
                divider: false,
                enabled: true,
                html: (): string => '标量表头',
                /**
                 * TODO (kai): Remove this._nodeEditSvc.
                 */
                // @ts-ignore
                isCurr,
                visible: true,
            },
            {
                divider: true,
                enabled: true,
                html: (): string => '',
                visible: true,
            },
        ]
    }

    // tslint:disable-next-line: max-func-body-length
    private _getTableTemplateActions (
        table: Readonly<Table>,
    ): readonly ContextMenuItem[] {
        const tabView = this._tableTabStatusService.getTabStatus(table)
        const isRowView = tabView !== TableTabView.COLUMN
        return [
            {
                click: (): void => this._editSvc.addChild(NodeType.ROW),
                divider: false,
                enabled: true,
                html: (): string => '添加行',
                visible: isRowView,
            },
            {
                click: (): void => this._editSvc.addChild(NodeType.ROW_BLOCK),
                divider: false,
                enabled: true,
                html: (): string => '添加组',
                visible: isRowView,
            },
            {
                click: (): void => this._editSvc.addChild(NodeType.COLUMN),
                divider: false,
                enabled: true,
                html: (): string => '添加列',
                visible: !isRowView,
            },
            {
                click: (): void => this._editSvc
                    .addChild(NodeType.COLUMN_BLOCK),
                divider: false,
                enabled: true,
                html: (): string => '添加组',
                visible: !isRowView,
            },
        ]
    }

    // tslint:disable-next-line: max-func-body-length
    private _getTableActions (
        table: Readonly<Table>,
    ): readonly ContextMenuItem[] {
        const tabView = this._tableTabStatusService.getTabStatus(table)
        const isRowView = tabView !== TableTabView.COLUMN
        const baseActions = this._getBaseActions()
        const actions: readonly ContextMenuItem[] = [
            {
                divider: true,
                enabled: true,
                html: (): string => '',
                visible: true,
            },
            {
                click: (): void => this._editSvc.addChild(NodeType.ROW),
                divider: false,
                enabled: true,
                html: (): string => '添加行',
                visible: isRowView,
            },
            {
                click: (): void => this._editSvc.addChild(NodeType.ROW_BLOCK),
                divider: false,
                enabled: true,
                html: (): string => '添加组',
                visible: isRowView,
            },
            {
                click: (): void => this._editSvc.addChild(NodeType.COLUMN),
                divider: false,
                enabled: !haveStandarHeader(table),
                html: (): string => '添加列',
                visible: !isRowView,
            },
            {
                click: (): void => this._editSvc
                    .addChild(NodeType.COLUMN_BLOCK),
                divider: false,
                enabled: !haveStandarHeader(table),
                html: (): string => '添加组',
                visible: !isRowView,
            },
            {
                divider: true,
                enabled: true,
                html: (): string => '',
                visible: true,
            },
            {
                divider: true,
                enabled: true,
                html: (): string => '',
                visible: true,
            },
            {
                childMenuClass: 'logi-config-header-menu',
                divider: false,
                enabled: true,
                html: (): string => '表头设置',
                subMenu: this.initTableSubContextMenu(table),
                visible: true,
            },
            {
                divider: true,
                enabled: true,
                html: (): string => '',
                visible: true,
            },
            {
                click: (): void => this._cleanDataSvc
                    .openCleanDialog(table.name, table.uuid),
                divider: false,
                enabled: true,
                html: (): string => '清除输入数据',
                visible: true,
            },
            {
                divider: true,
                enabled: true,
                html: (): string => '',
                visible: true,
            },
            {
                click: (): void => this._editSvc.remove(),
                divider: false,
                enabled: true,
                html: (): string => '删除表格',
                visible: true,
            },
        ]
        return baseActions.concat(actions)
    }

    private _getColumnTemplateActions (): readonly ContextMenuItem[] {
        return [
            {
                click: (): void => {
                    this._editSvc.addChild(NodeType.COLUMN)
                },
                divider: false,
                enabled: true,
                html: (): string => '添加列',
                visible: true,
            },
            {
                click: (): void => {
                    this._editSvc.addChild(NodeType.COLUMN_BLOCK)
                },
                divider: false,
                enabled: true,
                html: (): string => '添加组',
                visible: true,
            },
        ]
    }

    // tslint:disable-next-line: max-func-body-length
    private _getColumnBlockActions (): readonly ContextMenuItem[] {
        const baseActions = this._getBaseActions()
        const actions: readonly ContextMenuItem[] = [
            {
                divider: true,
                enabled: true,
                html: (): string => '',
                visible: true,
            },
            {
                click: (): void => this._editSvc.addChild(NodeType.COLUMN),
                divider: false,
                enabled: true,
                html: (): string => '添加列',
                visible: true,
            },
            {
                click: (): void => this._editSvc
                    .addSiblingNode(NodeType.COLUMN),
                divider: false,
                enabled: true,
                html: (): string => '在外部添加列',
                visible: true,
            },
            {
                click: (): void => this._editSvc
                    .addChild(NodeType.COLUMN_BLOCK),
                divider: false,
                enabled: true,
                html: (): string => '添加组',
                visible: true,
            },
            {
                click: (): void => this._editSvc
                    .addSiblingNode(NodeType.COLUMN_BLOCK),
                divider: false,
                enabled: true,
                html: (): string => '在外部添加组',
                visible: true,
            },
            {
                divider: true,
                enabled: true,
                html: (): string => '',
                visible: true,
            },
            {
                click: (): void => this._editSvc.remove(),
                divider: false,
                enabled: true,
                html: (): string => '删除组',
                visible: true,
            },
        ]
        return baseActions.concat(actions)
    }

    // tslint:disable-next-line: max-func-body-length
    private _getColumnActions (
        col: Readonly<Column>,
        viewContainerRef?: ViewContainerRef,
    ): readonly ContextMenuItem[] {
        const baseActions = this._getBaseActions()
        const actions: readonly ContextMenuItem[] = [
            {
                divider: true,
                enabled: true,
                html: (): string => '',
                visible: true,
            },
            {
                click: (): void => this._editSvc
                    .addSiblingNode(NodeType.COLUMN),
                divider: false,
                enabled: true,
                html: (): string => '添加列',
                visible: true,
            },
            {
                click: (): void => this._editSvc
                    .addSiblingNode(NodeType.COLUMN_BLOCK),
                divider: false,
                enabled: true,
                html: (): string => '添加组',
                visible: true,
            },
            {
                click: (): void => this._editSvc.addSlice(false),
                divider: false,
                enabled: true,
                html: (): string => '设为切片',
                visible: !hasSlice(col),
            },
            {
                click: (): void => this._editSvc.addSlice(true),
                divider: false,
                enabled: true,
                html: (): string => '添加切片',
                shortcut: 'Alt+S',
                visible: true,
            },
            {
                click: (): void => this._editSvc.removeSlice(),
                divider: false,
                enabled: true,
                html: (): string => '删除切片',
                visible: hasSlice(col),
            },
            {
                click: (): void => this._editSvc.cancelSlice(),
                divider: false,
                enabled: true,
                html: (): string => '取消切片',
                shortcut: 'Alt+Shift+S',
                visible: hasSlice(col),
            },
            {
                divider: true,
                enabled: true,
                html: (): string => '',
                visible: true,
            },
            {
                click: (): void => this._editSvc.setLabel(viewContainerRef),
                divider: false,
                enabled: true,
                html: (): string => '设置标签',
                visible: true,
            },
            {
                divider: true,
                enabled: true,
                html: (): string => '',
                visible: true,
            },
            {
                click: (): void => this._editSvc.remove(),
                divider: false,
                enabled: true,
                html: (): string => '删除列',
                visible: true,
            },
        ]
        return baseActions.concat(actions)
    }

    private _getRowTemplateActions (): readonly ContextMenuItem[] {
        return [
            {
                click: (): void => {
                    this._editSvc.addChild(NodeType.ROW)
                },
                divider: false,
                enabled: true,
                html: (): string => '添加行',
                visible: true,
            },
            {
                click: (): void => {
                    this._editSvc.addChild(NodeType.ROW_BLOCK)
                },
                divider: false,
                enabled: true,
                html: (): string => '添加组',
                visible: true,
            },
        ]
    }

    // tslint:disable-next-line: max-func-body-length
    private _getRowBlockActions (): readonly ContextMenuItem[] {
        const baseActions = this._getBaseActions()
        const actions: readonly ContextMenuItem[] = [
            {
                divider: true,
                enabled: true,
                html: (): string => '',
                visible: true,
            },
            {
                click: (): void => this._editSvc.addChild(NodeType.ROW),
                divider: false,
                enabled: true,
                html: (): string => '添加行',
                visible: true,
            },
            {
                click: (): void => this._editSvc.addSiblingNode(NodeType.ROW),
                divider: false,
                enabled: true,
                html: (): string => '在外部添加行',
                visible: true,
            },
            {
                childMenuClass: 'logi-config-header-menu',
                click: (): void => this._editSvc.addChild(NodeType.ROW_BLOCK),
                divider: false,
                enabled: true,
                html: (): string => '添加组',
                visible: true,
            },
            {
                click: (): void => this._editSvc
                    .addSiblingNode(NodeType.ROW_BLOCK),
                divider: false,
                enabled: true,
                html: (): string => '在外部添加组',
                visible: true,
            },
            {
                divider: true,
                enabled: true,
                html: (): string => '',
                visible: true,
            },
            {
                click: (): void => this._editSvc.remove(),
                divider: false,
                enabled: true,
                html: (): string => '删除组',
                visible: true,
            },
        ]
        return baseActions.concat(actions)
    }

    // tslint:disable-next-line: max-func-body-length
    private _getRowActions (row: Readonly<Row>): readonly ContextMenuItem[] {
        const baseActions = this._getBaseActions()
        const isAlias = row.alias.length === 0
        const actions: readonly ContextMenuItem[] = [
            {
                divider: true,
                enabled: true,
                html: (): string => '',
                visible: true,
            },
            {
                click: (): void => this._editSvc.addSiblingNode(NodeType.ROW),
                divider: false,
                enabled: true,
                html: (): string => '添加行',
                visible: true,
            },
            {
                click: (): void => this._editSvc
                    .addSiblingNode(NodeType.ROW_BLOCK),
                divider: false,
                enabled: true,
                html: (): string => '添加组',
                visible: true,
            },
            {
                click: (): void => this._editSvc.addSlice(false),
                divider: false,
                enabled: true,
                html: (): string => '设为切片',
                visible: !hasSlice(row),
            },
            {
                click: (): void => this._editSvc.addSlice(true),
                divider: false,
                enabled: true,
                html: (): string => '添加切片',
                shortcut: 'Alt+S',
                visible: true,
            },
            {
                click: (): void => this._editSvc.removeSlice(),
                divider: false,
                enabled: true,
                html: (): string => '删除切片',
                visible: hasSlice(row),
            },
            {
                click: (): void => this._editSvc.cancelSlice(),
                divider: false,
                enabled: true,
                html: (): string => '取消切片',
                shortcut: 'Alt+Shift+S',
                visible: hasSlice(row),
            },
            {
                divider: true,
                enabled: true,
                html: (): string => '',
                visible: true,
            },
            {
                click: (): void => this._editSvc.setAlias(),
                divider: false,
                enabled: true,
                html: (): string => '设置别名',
                visible: true,
            },
            {
                click: (): void => this._editSvc.clearAlias(),
                divider: false,
                enabled: true,
                html: (): string => '取消别名',
                visible: !isAlias,
            },
            {
                divider: false,
                enabled: true,
                html: (): string => '设置类型',
                subMenu: this._initRowType(row),
                visible: true,
            },
            {
                divider: true,
                enabled: true,
                html: (): string => '',
                visible: true,
            },
            {
                click: (): void => this._editSvc.remove(),
                divider: false,
                enabled: true,
                html: (): string => '删除行',
                visible: true,
            },
        ]
        return baseActions.concat(actions)
    }

    private _getNodesActions (): readonly ContextMenuItem[] {
        return this._getBaseActions().concat([
            {
                click: (): void => this._editSvc.remove(),
                divider: false,
                enabled: true,
                html: (): string => '删除',
                visible: true,
            },
        ])
    }

    private _initRowType (row: Readonly<Row>): readonly ContextMenuItem[] {
        return [
            {
                click: (): void => this._editSvc.setRowType(DataType.FLOW, row),
                divider: false,
                enabled: true,
                html: (): string => '流量',
                isCurr: row.dataType === DataType.FLOW,
                visible: true,
            },
            {
                click: (): void => this._editSvc
                    .setRowType(DataType.STOCK, row),
                divider: false,
                enabled: true,
                html: (): string => '存量',
                isCurr: row.dataType === DataType.STOCK,
                visible: true,
            },
            {
                click: (): void => this._editSvc
                    .setRowType(DataType.SCALAR, row),
                divider: false,
                enabled: true,
                html: (): string => '标量',
                isCurr: row.dataType === DataType.SCALAR,
                visible: true,
            },
            {
                divider: true,
                enabled: true,
                html: (): string => '',
                visible: true,
            },
            {
                click: (): void => this._editSvc.setRowType(DataType.NONE, row),
                divider: false,
                enabled: row.dataType !== DataType.NONE,
                html: (): string => '清除类型',
                visible: true,
            },
        ]
    }

    private _getBaseActions (): readonly ContextMenuItem[] {
        return [
            {
                click: (): void => this._editSvc.cut(),
                divider: false,
                enabled: true,
                html: (): string => '剪切',
                shortcut: 'Ctrl+X',
                visible: true,
            },
            {
                click: (): void => this._editSvc.copy(),
                divider: false,
                enabled: true,
                html: (): string => '复制',
                shortcut: 'Ctrl+C',
                visible: true,
            },
            {
                click: (): void => this._editSvc.paste(),
                divider: false,
                enabled: true,
                html: (): string => '粘贴',
                shortcut: 'Ctrl+V',
                visible: true,
            },
        ]
    }
}

function hasSlice (node: Readonly<FormulaBearer>): boolean {
    return node.sliceExprs.length > 0
}

function isPureRowOrCol (nodes: readonly Readonly<Node>[]): boolean {
    const target = nodes.find((node: Readonly<Node>): boolean =>
        !isColumn(node) && !isRow(node))
    return target === undefined
    // tslint:disable-next-line: max-file-line-count
}
