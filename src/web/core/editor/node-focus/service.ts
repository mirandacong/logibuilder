import {Injectable, Injector} from '@angular/core'
import {FocusResult} from '@logi/src/lib/api'
import {
    AnnotationKey,
    isColumn,
    isColumnBlock,
    isFormulaBearer,
    isRow,
    isRowBlock,
    isSheet,
    isSliceExpr,
    isTable,
    Node,
    SliceExpr,
} from '@logi/src/lib/hierarchy/core'
import {AddFbService} from '@logi/src/web/core/editor/add-fb'
import {NodeExpandService} from '@logi/src/web/core/editor/node-expand'
import {
    getAllNodesBetween,
    getNextNode,
    getNextNodeInPreOreder,
    getPrevNode,
    getPrevNodeInPreOrder,
} from '@logi/src/web/global/api/hierarchy'

import {
    FocusConfigBuilder,
    FocusType,
    NodeFocusInfoBuilder,
    SelConfigBuilder,
} from './define'
import {FocusStore} from './focus_store'
import {
    getFocusInfo,
    getSelInfos,
    getVerticalFocusInfo,
    horizontalRightFocus,
} from './lib'

@Injectable()
export class NodeFocusService extends FocusStore {
    public constructor(
        public readonly injector: Injector,
        public readonly nodeExpandSvc: NodeExpandService,
        private readonly _addFbSvc: AddFbService,
    ) {
        super(injector)
        this._init()
    }

    public cancelFocus (): void {
        if (this.lastFocus === undefined)
            return
        const config = new FocusConfigBuilder().focus(false).build()
        this.setFocus(this.lastFocus, config)
    }

    public focusExpr (): void {
        const nodes = this.getSelNodes()
        if (nodes.length !== 1)
            return
        const fb = nodes[0]
        if (!isFormulaBearer(fb))
            return
        if (this.hasFocus())
            return
        const config = new FocusConfigBuilder().focus(true)
        const nodeInfo = new NodeFocusInfoBuilder().nodeId(fb.uuid)
        const node = fb.sliceExprs.length > 0 ? fb.sliceExprs[0] : fb
        if (node.annotations.get(AnnotationKey.LINK_CODE) !== undefined)
            nodeInfo.focusType(FocusType.NAME)
        else
            nodeInfo.focusType(FocusType.EXPRESSION)
        if (fb.sliceExprs[0] !== undefined)
            nodeInfo.slice(fb.sliceExprs[0])
        this.setFocus(nodeInfo.build(), config.build())
        this.setSelNodes([fb.uuid])
    }

    public focusNextNode (isEnter = true): void {
        if (this.lastFocus === undefined)
            return
        const fb = this.apiSvc.getNode(this.lastFocus?.nodeId)
        if (!isFormulaBearer(fb))
            return
        const newTarget = getVerticalFocusInfo(this.lastFocus, fb, false)
        if (newTarget.infoEqual(this.lastFocus)) {
            if (!isEnter)
                return
            const table = fb.getTable()
            if (table === undefined)
                return
            this._addFbSvc.focusAddBtn(table.uuid)
            this.setSelNodes([])
            this.blur()
            return
        }
        if (!this.isSelected(newTarget.nodeId))
            this.setSelNodes([newTarget.nodeId])
        const config = new FocusConfigBuilder()
            .focus(true)
            .manualBlur(true)
            .build()
        this.setFocus(newTarget, config)
    }

    public focusLastNode (): void {
        if (this.lastFocus === undefined)
            return
        const fb = this.apiSvc.getNode(this.lastFocus?.nodeId)
        if (!isFormulaBearer(fb))
            return
        const newTarget = getVerticalFocusInfo(this.lastFocus, fb, true)
        if (!this.isSelected(newTarget.nodeId))
            this.setSelNodes([newTarget.nodeId])
        const config = new FocusConfigBuilder()
            .focus(true)
            .manualBlur(true)
            .build()
        this.setFocus(newTarget, config)
    }

    /**
     * Listen `tab` and change focus between ref-name, slice-name, expression.
     */
    public horizontalRightFocus (): void {
        const lastFocus = this.lastFocus
        if (lastFocus === undefined)
            return
        const fb = this.apiSvc.getNode(lastFocus.nodeId)
        if (!isFormulaBearer(fb))
            return
        if (!this.isSelected(fb.uuid))
            this.setSelNodes([fb.uuid])
        const config = new FocusConfigBuilder()
            .focus(true)
            .manualBlur(true)
            .build()
        const newFocusInfo = horizontalRightFocus(lastFocus, fb)
        if (newFocusInfo === undefined)
            return
        this.setFocus(newFocusInfo, config)
    }

    public selectPrevious (): void {
        const node = this.getSelNodes()[0]
        if (node === undefined) {
            this.selectFirstNode()
            return
        }
        const previousNode = getPrevNodeInPreOrder(node)
        if (previousNode === undefined)
            return
        const config = new SelConfigBuilder()
            .multiSelect(false)
            .scrollIntoView(true)
            .build()
        this.setSelNodes([previousNode.uuid], undefined, config)
    }

    public selectNext (): void {
        const node = this.getSelNodes()[0]
        if (node === undefined) {
            this.selectFirstNode()
            return
        }
        const nextNode = getNextNodeInPreOreder(node)
        if (nextNode === undefined)
            return
        const config = new SelConfigBuilder()
            .multiSelect(false)
            .scrollIntoView(true)
            .build()
        this.setSelNodes([nextNode.uuid], undefined, config)
    }

    public selectFirstNode (): void {
        const sheetname = this.apiSvc.getActiveSheet()
        const sheet = this.apiSvc.currBook().sheets
            .find(s => s.name === sheetname)
        if (!isSheet(sheet) || sheet.tree[0] === undefined)
            return
        const node = sheet.tree[0]
        if (node === undefined)
            return
        const config = new SelConfigBuilder()
            .multiSelect(false)
            .scrollIntoView(true)
            .build()
        this.setSelNodes([node.uuid], undefined, config)
    }

    /**
     * Select all nodes.
     *
     * If there is no any selected node, then select all table and title of
     * current sheet.
     *
     * If it has selected a table, then select all rows or cols of it.
     * If it has selected a row/rowblock, then select all rows of its parent.
     * If it has selected a col/colblock, then select all cols of its parent.
     */
    public selectAll (): void {
        const nodes = this.getSelNodes()
        const focusNodes: Readonly<Node>[] = []
        if (nodes.length === 0) {
            const sheetname = this.apiSvc.getActiveSheet()
            const sheet = this.apiSvc.currBook().sheets
                .find(s => s.name === sheetname)
            if (sheet === undefined)
                return
            focusNodes.push(...sheet.tree)
        }
        const node = nodes[0]
        if (isTable(node))
            focusNodes.push(...(this.tableTabStatusSvc
                .isRowView(node) ? node.rows : node.cols),)
        if (isRow(node) || isRowBlock(node)) {
            const parent = node.parent
            if (isTable(parent))
                focusNodes.push(...parent.rows)
            if (isRowBlock(parent))
                focusNodes.push(...parent.tree)
        }
        if (isColumn(node) || isColumnBlock(node)) {
            const parent = node.parent
            if (isTable(parent))
                focusNodes.push(...parent.cols)
            if (isColumnBlock(parent))
                focusNodes.push(...parent.tree)
        }
        const config = new SelConfigBuilder().multiSelect(false).build()
        this.setSelNodes(focusNodes.map(n => n.uuid), undefined, config)
    }

    /**
     * Continuously select nodes.
     * Current selected node must be row.
     */
    public continuousSelect (target: Readonly<Node>): void {
        const nodes = this.getSelNodes()
        if (nodes.length === 0)
            return
        const lastFocusedNode = this.lastSelected !== undefined ?
            this.apiSvc.getNode(this.lastSelected.nodeId) :
            undefined
        const startNode = lastFocusedNode ?? nodes[0]
        const betweenNodes = getAllNodesBetween(startNode, target)
        const config = new SelConfigBuilder().multiSelect(false).build()
        this.setSelNodes(
            betweenNodes.map(n => n.uuid),
            this.lastSelected,
            config,
        )
    }

    /**
     * Continuously select nodes by keyboard (shift + up / down).
     */
    public continuousSelectWithKeyboard (up: boolean): void {
        if (this.lastSelected === undefined)
            return
        const node = this.apiSvc.getNode(this.lastSelected.nodeId)
        if (node === undefined)
            return
        const target = up ? getPrevNode(node) : getNextNode(node)
        if (target === undefined || node.parent !== target.parent)
            return
        const info = new NodeFocusInfoBuilder().nodeId(target.uuid).build()
        const config = new SelConfigBuilder().multiSelect(true).build()
        this.isSelected(target.uuid)
            ? this.delSels([this.lastSelected])
            : this.setSelInfos([info], undefined, config)
    }

    public cancelSelect (
        nodeId: string,
        isLast: boolean,
        slice?: SliceExpr,
    ): void {
        const info = new NodeFocusInfoBuilder()
            .nodeId(nodeId)
            .slice(slice)
            .build()
        const last = isLast ? info : undefined
        this.delSels([info], last)
    }

    /**
     * If focus expression, should cancel focus. Or else cancel all selected
     * nodes.
     */
    public cancelAllSelect (): void {
        this.delSels(this.getSelsInActiveSheet())
    }

    public cancelAllSlicesOrNode (isSlice: boolean): void {
        const sels = this.getSelsInActiveSheet()
        isSlice ?
            this.delSels(sels.filter(s => s.slice))
            :
            this.delSels(sels.filter(s => !s.slice))
    }

    public cancelOtherSel (info: Readonly<Node | SliceExpr>): void {
        const sels = this.getSelsInActiveSheet()
        const last = new NodeFocusInfoBuilder().nodeId(info.uuid).build()
        if (!isSliceExpr(info))
            this.delSels(sels.filter(s => s.nodeId !== info.uuid), last)
        else
            this.delSels(sels.filter(s => s.slice !== info), last)
    }

    private _init (): void {
        this.apiSvc.focusChange().subscribe((r: FocusResult): void => {
            const selInfos = getSelInfos(r)
            const selConfig = new SelConfigBuilder()
                .isExpand(true)
                .multiSelect(false)
                .build()
            if (selInfos.length !== 0)
                this.setSelInfos(selInfos, undefined, selConfig)
            const focusInfo = getFocusInfo(r)
            const focusConfig = new FocusConfigBuilder()
                .focus(true)
                .manualBlur(true)
                .build()
            if (focusInfo !== undefined)
                this.setFocus(focusInfo, focusConfig)
        })
    }
}
