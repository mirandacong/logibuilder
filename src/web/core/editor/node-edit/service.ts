// tslint:disable: remove-import-comment
import {Injectable, ViewContainerRef} from '@angular/core'
import {AbstractControl, ValidationErrors} from '@angular/forms'
import {MatDialog} from '@angular/material/dialog'
import {isString, isUndefinedOrNull} from '@logi/base/ts/common/type_guard'
import {
    ActiveSheetActionBuilder,
    AddChildActionBuilder,
    AddFormulasActionBuilder,
    AddSheetActionBuilder,
    AddSliceActionBuilder,
    BaseHistoricalForecastActionBuilder,
    BatchAddSlicesActionBuilder,
    ClipboardActionBuilder,
    ClipboardResult,
    CloneSheetActionBuilder,
    EditBarType,
    GrowthRateActionBuilder,
    ItemizedForecastActionBuilder,
    LevelChangeActionBuilder,
    MoveSheetActionBuilder,
    MoveSliceVerticallyBuilder,
    MoveVerticallyActionBuilder,
    PasteActionBuilder,
    PasteSliceActionBuilder,
    PredictBaseHistAverageActionBuilder,
    PredictFromLastYearActionBuilder,
    RedoActionBuilder,
    RemoveAllSlicesActionBuilder,
    RemoveNodesActionBuilder,
    RemoveSheetActionBuilder,
    RemoveSliceActionBuilder,
    SetAliasActionBuilder,
    SetDataTypeActionBuilder,
    SetNameActionBuilder,
    SetRefHeaderActionBuilder,
    UndoActionBuilder,
    UnlinkActionBuilder,
} from '@logi/src/lib/api'
import {
    assertIsSheet,
    DataType,
    // @ts-ignore
    isColumn,
    isColumnBlock,
    isFormulaBearer,
    isNode,
    isRow,
    // @ts-ignore
    isRowBlock,
    isSheet,
    // @ts-ignore
    isTitle,
    Node,
    NodeType,
    Row,
    Sheet,
    SliceExpr,
    Table,
} from '@logi/src/lib/hierarchy/core'
import {toHalfWidth} from '@logi/src/web/base/utils'
import {ConfigHeaderComponent} from '@logi/src/web/core/config-header'
import {AddNode} from '@logi/src/web/core/editor/node-edit/add_node'
import {NodeExpandService} from '@logi/src/web/core/editor/node-expand'
import {
    NodeFocusInfo,
    NodeFocusInfoBuilder,
    NodeFocusService,
    SelConfigBuilder,
} from '@logi/src/web/core/editor/node-focus'
import {TableTabStatusService} from '@logi/src/web/core/editor/table-tab-status'
import {StudioApiService} from '@logi/src/web/global/api/service'
import {
    ActionBuilder,
    ButtonGroupBuilder,
    DialogService,
    InputDialogData,
    InputDialogDataBuilder,
} from '@logi/src/web/ui/dialog'
import {Observable, of, Subscriber} from 'rxjs'
import {map} from 'rxjs/operators'

import {
    AddItem,
    getAddType,
    getList,
    itemAddBlock,
    itemAddRowOrColumn,
    itemAddTable,
    itemAddTitle,
    onClickAddNode,
} from './add_list'
import {BatchAddDialogComponent, DialogData} from './batch-add-dialog'
import {LabelDialogComponent} from './label-dialog'
import {LabelManageComponent} from './label-management'
import {getInsertPosition, hasSlice} from './lib'

@Injectable()
export class NodeEditService {
    // tslint:disable-next-line: max-func-body-length
    public constructor(
        private readonly _nodeFocusSvc: NodeFocusService,
        private readonly _nodeExpandSvc: NodeExpandService,
        private readonly _studioApiSvc: StudioApiService,
        private readonly _dialog: MatDialog,
        private readonly _dialogSvc: DialogService,
        private readonly _tableTabStatus: TableTabStatusService,
    ) {
        this._studioApiSvc.clipboardChange().subscribe((
            res: ClipboardResult,
        ) => {
            const infos: NodeFocusInfo[] = []
            res.cutNodes.forEach(id => {
                infos.push(new NodeFocusInfoBuilder().nodeId(id).build())
            })
            this._nodeFocusSvc.delLastCut(this._nodeFocusSvc.lastCuttingInfos)
            this._nodeFocusSvc.lastCuttingInfos = infos
            this._nodeFocusSvc.setCut(infos)
        })
    }

    public setRowType (type: DataType, row: Readonly<Row>): void {
        const action = new SetDataTypeActionBuilder()
            .dataType(type)
            .target(row.uuid)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    public addSheet (): void {
        const activeIndex = this._studioApiSvc.sheetTabs().activeIndex()
        const action = new AddSheetActionBuilder()
            .position(activeIndex + 1)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    public setActiveSheet (i: number): void {
        const sheet = this._studioApiSvc.sheetTabs().sheetTabs[i]
        if (sheet === undefined)
            return
        const action = new ActiveSheetActionBuilder()
            .activeSheet(sheet.name)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    public moveSheet (position: number, name: string): void {
        const action = new MoveSheetActionBuilder()
            .position(position)
            .sheetName(name)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    public cloneSheet (): void {
        const activeSheetName = this._studioApiSvc.getActiveSheet()
        const activeSheet = this._studioApiSvc.currBook().sheets
            .find(s => s.name === activeSheetName)
        assertIsSheet(activeSheet)
        const action = new CloneSheetActionBuilder()
            .sheet(activeSheet.uuid)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    public deleteSheet (sheetname: string): void {
        const action = new RemoveSheetActionBuilder().name(sheetname).build()
        this._studioApiSvc.handleAction(action)
    }

    public sheetRename (sheet: Readonly<Sheet>, newName: string): void {
        const action = new SetNameActionBuilder()
            .name(newName)
            .target(sheet.uuid)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    public renameSheetOpenDialog (
        sheet: Readonly<Sheet>,
        names: readonly string[],
    ): void {
        const valid = {
            sameName: {
                message: '工作表名称已经存在',
                validator: (
                    control: AbstractControl,
                ): ValidationErrors | null => {
                    if (names.includes(toHalfWidth(control.value)))
                        // tslint:disable-next-line: limit-indent-for-method-in-class
                        return {sameName: true}
                    // tslint:disable-next-line: no-null-keyword
                    return null
                },
            },
        }
        const onConfirm = (ctrlValue: string): Observable<boolean> =>
            new Observable(sub => {
                if (sheet.name === ctrlValue)
                    return
                this.sheetRename(sheet, ctrlValue)
                sub.next(true)
                sub.complete()
            })
        const onCancel = () => of(true)
        const buttonGroup = new ButtonGroupBuilder()
            .secondary([new ActionBuilder().text('取消').run(onCancel).build()])
            .primary(new ActionBuilder().text('保存').run(onConfirm).build())
            .build()
        const dialogData = new InputDialogDataBuilder()
            .title('重命名工作表')
            .rules(valid)
            .value(sheet.name)
            .buttonGroup(buttonGroup)
            .build()
        this._dialogSvc.openInputDialog(dialogData, {autoFocus: true})
    }

    public calculateGrowthRate (): void {
        const action = new GrowthRateActionBuilder()
            .target(this._nodeFocusSvc.getSelNodes()[0].uuid)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    public predictBaseLastYear (): void {
        const action = new PredictFromLastYearActionBuilder()
            .target(this._nodeFocusSvc.getSelNodes()[0].uuid)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    public predictBaseHistAverage (): void {
        const action = new PredictBaseHistAverageActionBuilder()
            .target(this._nodeFocusSvc.getSelNodes()[0].uuid)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    public baseHistoricalForecast (): void {
        const action = new BaseHistoricalForecastActionBuilder()
            .target(this._nodeFocusSvc.getSelNodes()[0].uuid)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    public itemizedForecast (names: readonly string[]): void {
        const action = new ItemizedForecastActionBuilder()
            .names(names)
            .target(this._nodeFocusSvc.getSelNodes()[0].uuid)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    public batchAddRowOrCol (): void {
        const target = this._nodeFocusSvc.getSelNodes()
        if (target.length !== 1)
            return
        const node = target[0]
        const hasScalar = NodeType.ROW === node.nodetype
        this._dialog
            .open(BatchAddDialogComponent, {
                data: hasScalar,
                height: '436px',
                panelClass: 'batch-add-dialog',
                width: '540px',
            })
            .afterClosed()
            .subscribe((res: undefined | DialogData): void => {
                if (res === undefined)
                    return
                const type = getAddType(
                    node,
                    this._tableTabStatus.getTabStatus(node),
                )
                if (type === undefined || (type !== NodeType.ROW &&
                    type !== NodeType.COLUMN))
                    return
                const action = new AddFormulasActionBuilder()
                    .names(res.rowNames)
                    .isScalar(res.isScalar)
                    .target(node.uuid)
                    .type(type)
                    .build()
                this._studioApiSvc.handleAction(action)
            })
    }

    /**
     * Copy nodes or slices..
     */
    public copy (): void {
        const actionBuilder = new ClipboardActionBuilder().isCut(false)
        const slices = this._getSelSlices()
        const seletedNodes = this
            .getSelectedNodes()
            .map((n: Readonly<Node>): string => n.uuid)
        actionBuilder.content(slices.length !== 0 ? slices : seletedNodes)
        const action = actionBuilder.build()
        this._studioApiSvc.handleAction(action)
    }

    /**
     * Cut nodes.
     */
    public cut (): void {
        const slices = this._getSelSlices()
        if (slices.length === 0) {
            const nodes = this.getSelectedNodes()
            const uuids = nodes.map((n: Readonly<Node>): string => n.uuid)
            const statusAction = new ClipboardActionBuilder()
                .content(uuids)
                .isCut(true)
                .build()
            this._studioApiSvc.handleAction(statusAction)
            return
        }

        const cutAction = new ClipboardActionBuilder()
            .content(slices)
            .isCut(true)
            .build()
        this._studioApiSvc.handleAction(cutAction)
    }

    /**
     * Paste after the first seleted nodes.
     */
    // tslint:disable-next-line: max-func-body-length
    public paste (): void {
        const copiedSlices = this._studioApiSvc.getClipboardSlices()
        const nodes = this.getSelectedNodes()
        const node = nodes[0]
        if (copiedSlices.length === 0) {
            if (nodes.length === 0)
                return
            const action = new PasteActionBuilder().base(node.uuid).build()
            this._studioApiSvc.handleAction(action)
            return
        }

        const focusInfos = this._nodeFocusSvc.getSelInfos()
        if (focusInfos.length === 0)
            return
        const focusInfo = focusInfos[0]
        const slice = focusInfo.slice

        const actionBuilder = new PasteSliceActionBuilder()
            .target(focusInfo.nodeId)
        if (slice !== undefined) {
            const fb = this._studioApiSvc.getNode(focusInfo.nodeId)
            if (!isFormulaBearer(fb))
                return
            const position = fb.sliceExprs.indexOf(slice)
            actionBuilder.position(position === -1 ? 0 : position + 1)
        } else
            actionBuilder.target(focusInfo.nodeId)
        this._studioApiSvc.handleAction(actionBuilder.build())
    }

    /**
     * Insert new row or new column.
     */
    public insert (): void {
        const nodes = this.getSelectedNodes()
        if (nodes.length === 0)
            return
        if (nodes.length !== 1 || isTitle(nodes[0]))
            return
        const node = nodes[0]
        const tabStatus = this._tableTabStatus.getTabStatus(node)
        if (tabStatus === undefined) {
            if (isColumn(node))
                this.addSiblingNode(NodeType.COLUMN)
            if (isColumnBlock(node))
                this.addChild(NodeType.COLUMN)
            if (isRow(node) || isRowBlock(node))
                this.addSiblingNode(NodeType.ROW)
            if (isRowBlock(node))
                this.addChild(NodeType.ROW)
            return
        }
        const childAddNode = onClickAddNode(node, tabStatus)
        if (childAddNode === undefined)
            return
        const action = new AddChildActionBuilder()
            .target(childAddNode.parent.uuid)
            .name('')
            .type(childAddNode.addType)
            .position(childAddNode.index)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    public getAddList (): Observable<readonly Readonly<AddItem>[]> {
        return new Observable((
            sub: Subscriber<readonly Readonly<AddItem>[]>,
        ): void => {
            const focusNodes = this._nodeFocusSvc.getSelNodes()
            const nodes = isSheet(focusNodes[0]) ? [] : focusNodes
            this._addNodeItems = getList(nodes[0])
            if (nodes.length > 1)
                this._addNodeItems.forEach((i: Readonly<AddItem>): void =>
                    i.updateDisabled(true))
            sub.next(this._addNodeItems)
            sub.complete()
        })
    }

    public addRow (table: string): void {
        const action = new AddChildActionBuilder()
            .target(table)
            .type(NodeType.ROW)
            .name('')
            .build()
        this._studioApiSvc.handleAction(action)
    }

    public addNode (type: NodeType): void {
        const focusNodes = this._nodeFocusSvc.getSelNodes()
        const sheetname = this._studioApiSvc.getActiveSheet()
        const sheet = this._studioApiSvc.currBook().sheets
            .find(s => s.name === sheetname)
        if (sheet === undefined)
            return
        const nodes = (isSheet(focusNodes[0])) ? [] : focusNodes
        let addnode: Readonly<AddNode> | undefined
        if (type === NodeType.TITLE)
            addnode = itemAddTitle(nodes, sheet)
        if (type === NodeType.TABLE)
            addnode = itemAddTable(nodes, sheet)
        if (type === NodeType.ROW || type === NodeType.COLUMN)
            addnode = itemAddRowOrColumn(nodes, type)
        if (type === NodeType.ROW_BLOCK || type === NodeType.COLUMN_BLOCK) {
            const table = nodes[0].findParent(NodeType.TABLE)
            if (table === undefined)
                return
            const tabType = this._tableTabStatus.getTabStatus(table)
            if (tabType === undefined)
                return
            addnode = itemAddBlock(nodes, tabType)
        }
        if (addnode === undefined)
            return
        const action = new AddChildActionBuilder()
            .target(addnode.parent.uuid)
            .name('')
            .type(addnode.addType)
            .position(addnode.index)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    /**
     * Add a sibling node for current selected node.
     */
    public addSiblingNode (type: NodeType): void {
        const selectedNodes = this.getSelectedNodes()
        if (selectedNodes.length === 0)
            return
        const selectedNode = selectedNodes[0]
        const position = getInsertPosition(selectedNode)
        if (position === -1)
            return
        const parent = selectedNode.parent
        if (!isNode(parent))
            return
        const action = new AddChildActionBuilder()
            .target(parent.uuid)
            .name('')
            .type(type)
            .position(position)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    public addChild (type: NodeType): void {
        const selectedNodes = this.getSelectedNodes()
        if (selectedNodes.length === 0)
            return
        const selectedNode = selectedNodes[0]
        const action = new AddChildActionBuilder()
            .target(selectedNode.uuid)
            .name('')
            .type(type)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    /**
     * If it is triggered on row, don't need to pass in index
     */
    public addSlice (isInit: boolean, index?: number): void {
        const selectedNode = this.getSelectedNode()
        if (!isFormulaBearer(selectedNode))
            return
        let position: number
        index === undefined ?
            position = hasSlice(selectedNode) ? 1 : 0
            :
            position = index
        const action = new AddSliceActionBuilder()
            .target(selectedNode.uuid)
            .addInitSlice(isInit)
            .position(position)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    public batchAddSlices (): void {
        const nodes: string[] = []
        this._nodeFocusSvc.getSelInfos().forEach(i => {
            nodes.push(i.nodeId)
        })
        const uniqueNodes = Array.from(new Set(nodes))
        const action = new BatchAddSlicesActionBuilder()
            .targets(uniqueNodes)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    /**
     * delete this slice
     */
    public removeSlice (slice?: Readonly<SliceExpr>, index = 0): void {
        const selectedNode = this.getSelectedNode()
        let deleteSlice: Readonly<SliceExpr>
        if (!isFormulaBearer(selectedNode))
            return
        if (!hasSlice(selectedNode))
            return
        slice === undefined ?
            deleteSlice = selectedNode.sliceExprs[index]
            :
            deleteSlice = slice
        const action = new RemoveSliceActionBuilder()
            .slices([deleteSlice])
            .target(selectedNode.uuid)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    /**
     * delete all slice on this node
     */
    public cancelSlice (): void {
        const selectedNode = this.getSelectedNode()
        if (!isFormulaBearer(selectedNode))
            return
        const action = new RemoveAllSlicesActionBuilder()
            .targets([selectedNode.uuid])
            .build()
        this._studioApiSvc.handleAction(action)
    }

    /**
     * delete all slice on nodes
     */
    public cancelSlices (): void {
        const nodes: string[] = []
        this._nodeFocusSvc.getSelInfos().forEach(i => {
            nodes.push(i.nodeId)
        })
        const uniqueNodes = Array.from(new Set(nodes))
        const action = new RemoveAllSlicesActionBuilder()
            .targets(uniqueNodes)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    public setLabel (viewContainerRef?: ViewContainerRef): void {
        const ref = this._dialog.open(LabelDialogComponent, {
            panelClass: 'set-label-dialog',
            viewContainerRef,
        })
        ref.componentInstance._cd.markForCheck()
    }

    public setAlias (): void {
        const node = this._nodeFocusSvc.getSelNodes()[0]
        if (!isRow(node))
            return
        const rowId = node.uuid
        const alias = node.alias
        const dialogData = this.buildInputDialogData(rowId, alias)
        this._dialogSvc.openInputDialog(dialogData, {
            autoFocus: true,
            disableClose: true,
        })
    }

    public clearAlias (): void {
        const node = this._nodeFocusSvc.getSelNodes()[0]
        if (!isRow(node))
            return
        const action = new SetAliasActionBuilder()
            .alias('')
            .target(node.uuid)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    public buildInputDialogData (
        rowId: string,
        rowAlias: string,
    ): InputDialogData {
        const validRules = {
            duplicated: {
                message: '存在冲突',
                validator: (ctl: AbstractControl): ValidationErrors | null => {
                    const value = ctl.value
                    if (!isString(value))
                        // tslint:disable-next-line: no-null-keyword limit-indent-for-method-in-class
                        return null
                    if (this._studioApiSvc.isDuplicatedAlias(value, rowId))
                        // tslint:disable-next-line: limit-indent-for-method-in-class
                        return {duplicated: true}
                    // tslint:disable-next-line: no-null-keyword
                    return null
                },
            },
        }
        const onCancel = () => of(true)
        const onConfirm = (ctrlValue: string): Observable<boolean> =>
            new Observable(sub => {
                const alias = ctrlValue
                const action = new SetAliasActionBuilder()
                    .alias(alias)
                    .target(rowId)
                    .build()
                this._studioApiSvc.handleAction(action)
                sub.next(true)
                sub.complete()
            })
        const buttonGroup = new ButtonGroupBuilder()
            .secondary([new ActionBuilder().text('取消').run(onCancel).build()])
            .primary(new ActionBuilder().text('确定').run(onConfirm).build())
            .build()
        const build = new InputDialogDataBuilder()
            .title('设置别名')
            .rules(validRules)
            .placeholder('请输入别名')
            .buttonGroup(buttonGroup)
            .value(rowAlias)
        return build.build()
    }

    public labelManagement (): void {
        this._dialog.open(LabelManageComponent, {
            panelClass: 'label-manage-dialog',
            width: '540px',
        })
    }

    public deployHeader (): void {
        this._dialog.open(ConfigHeaderComponent, {
            autoFocus: false,
            height: '100vh',
            minWidth: '100vw',
            panelClass: 'logi-config-hearder-dialog',
        })
    }

    /**
     * Remove current selected nodes.
     */
    public remove (): void {
        const nodes = this.getSelectedNodes()
        if (nodes.length === 0)
            return
        const uuids = nodes.map((n: Readonly<Node>): string => n.uuid)
        const action = new RemoveNodesActionBuilder().targets(uuids).build()
        this._studioApiSvc.handleAction(action)
    }

    /**
     * Undo node action.
     */
    public undo (): void {
        const action = new UndoActionBuilder().build()
        this._studioApiSvc.handleAction(action)
    }

    /**
     * Redo node action.
     */
    public redo (): void {
        const action = new RedoActionBuilder().build()
        this._studioApiSvc.handleAction(action)
    }

    public canUndo (): Observable<boolean> {
        return this._studioApiSvc.hierarchyChange().pipe(map((
        ): boolean => this._studioApiSvc
            .getEditBarStatus([], EditBarType.UNDO)))
    }

    public canRedo (): Observable<boolean> {
        return this._studioApiSvc.hierarchyChange().pipe(map((
        ): boolean => this._studioApiSvc
            .getEditBarStatus([], EditBarType.REDO)))
    }

    /**
     * For submenu to set refenrecen header.
     * TODO (minglong): add test:
     *  - header has been set to `table.referenceheader`
     *  - this.node has the cols of header.
     *  - this.node.cols !== header.cols
     */
    public setReferenceHeader (table: Readonly<Table>, name?: string): void {
        const action = new SetRefHeaderActionBuilder().targets([table.uuid])
        if (name !== undefined)
            action.referenceHeader(name)
        this._studioApiSvc.handleAction(action.build())
    }

    public unlinkStandardHeader (table: Readonly<Table>): void {
        const action = new UnlinkActionBuilder().targets([table.uuid]).build()
        this._studioApiSvc.handleAction(action)
    }

    public canUnlink (table: Readonly<Table>): boolean {
        const refHeaderUuid = table.referenceHeader
        if (refHeaderUuid === undefined)
            return false
        const refHeader = this._studioApiSvc.getNode(refHeaderUuid)
        return isColumnBlock(refHeader) && isUndefinedOrNull(refHeader.parent)
    }

    /**
     * Current copied or cut nodes.
     */
    // tslint:disable-next-line: max-func-body-length
    public upOrDown (isUp: boolean): void {
        const slices = this._getSelSlices()
        const nodes = this._nodeFocusSvc.getSelNodes()
        if (slices.length === 0) {
            if (nodes.length === 0)
                return
            const action = new MoveVerticallyActionBuilder()
                .targets(nodes.map((n: Readonly<Node>): string => n.uuid))
                .isUp(isUp)
                .build()
            this._studioApiSvc.handleAction(action)

            this._nodeExpandSvc.toggleState(nodes.map(n => n.uuid))
            return
        }

        const selectedNode = this.getSelectedNode()
        if (!isFormulaBearer(selectedNode))
            return
        const sliceAction = new MoveSliceVerticallyBuilder()
            .target(selectedNode.uuid)
            .slices(slices)
            .isUp(isUp)
            .build()
        this._studioApiSvc.handleAction(sliceAction)
        const infos = slices.map((s: SliceExpr): NodeFocusInfo =>
            new NodeFocusInfoBuilder()
                .nodeId(selectedNode.uuid)
                .slice(s)
                .build())
        const config = new SelConfigBuilder()
            .multiSelect(false)
            .scrollIntoView(true)
            .build()
        const last = new NodeFocusInfoBuilder()
            .nodeId(selectedNode.uuid)
            .build()
        this._nodeFocusSvc.setSelInfos(infos, last, config)
    }

    public levelUpOrDown (isUp: boolean): void {
        const nodes = this._nodeFocusSvc.getSelNodes()
        if (nodes.length === 0)
            return
        const action = new LevelChangeActionBuilder()
            .targets(nodes.map((n: Readonly<Node>): string => n.uuid))
            .isUp(isUp)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    public getSelectedNodes (): readonly Readonly<Node>[] {
        return this._nodeFocusSvc.getSelNodes()
    }

    public getSelectedNode (): Readonly<Node> | undefined {
        const nodes = this._nodeFocusSvc.getSelNodes()
        if (nodes.length === 0)
            return
        return nodes[0]
    }

    private _addNodeItems: readonly Readonly<AddItem>[] = []

    private _getSelSlices (): readonly SliceExpr[] {
        const slices: SliceExpr[] = []
        this._nodeFocusSvc.getSelInfos().forEach(i => {
            if (i.slice === undefined)
                return
            slices.push(i.slice)
        })
        return slices
    }
}
// tslint:disable-next-line: max-file-line-count
