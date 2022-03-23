import {Injector} from '@angular/core'
import {ActiveSheetActionBuilder} from '@logi/src/lib/api'
import {
    isColumn,
    isColumnBlock,
    isRow,
    isRowBlock,
    isSheet,
    isTable,
    Node,
    NodeType,
    SliceExpr,
} from '@logi/src/lib/hierarchy/core'
import {NodeExpandService} from '@logi/src/web/core/editor/node-expand'
import {
    TableTabStatusService,
    TableTabView,
} from '@logi/src/web/core/editor/table-tab-status'
import {Observable, Subject} from 'rxjs'

import {Base} from './base'
import {
    FocusConfig,
    FocusConfigBuilder,
    FocusType,
    NodeFocusInfo,
    NodeFocusInfoBuilder,
    SelConfig,
    SelConfigBuilder,
} from './define'

export class FocusStore extends Base {
    public constructor(
        public readonly injector: Injector,
    ) {
        super(injector)
        this.nodeExpandSvc = this.injector.get(NodeExpandService)
        this.tableTabStatusSvc = this.injector.get(TableTabStatusService)
    }
    public readonly nodeExpandSvc: NodeExpandService
    public readonly tableTabStatusSvc: TableTabStatusService
    /**
     * only `addSels` or `delSels` can set this field.
     *
     * public only for test
     */
    public lastSelected?: NodeFocusInfo
    public lastCuttingInfos: readonly NodeFocusInfo[] = []

    public setDragNode (isDrag = true): void {
        const sels = this.getSelsInActiveSheet()
        sels.forEach(s => {
            const dire = this.getDire(s)
            if (dire.length === 0)
                return
            dire.forEach(d => d.setDrag(isDrag))
        })
        this.lastDrags = isDrag ? sels : []
        this._dragChange$.next(isDrag)
    }

    public setCut (sels: readonly NodeFocusInfo[]): void {
        sels.forEach(s => {
            const dire = this.getDire(s)
            if (dire.length === 0)
                return
            dire.forEach(d => d.setCut())
        })
    }

    public delLastCut (sels: readonly NodeFocusInfo[]): void {
        sels.forEach(s => {
            const dire = this.getDire(s)
            if (dire.length === 0)
                return
            dire.forEach(d => d.deleteLastCut())
        })
    }

    public onDragChange (): Observable<boolean> {
        return this._dragChange$
    }

    public isDrag (info: NodeFocusInfo): boolean {
        return this.lastDrags.find(d => d.nodeId === info.nodeId) !== undefined
    }

    public hasFocus (): boolean {
        if (this.lastFocus === undefined)
            return false
        const dire = this.getDire(this.lastFocus)
        if (dire.length === 0)
            return false
        return dire.every(r => r.hasFocus())
    }

    public isFocus (node: string, type: FocusType, slice?: SliceExpr): boolean {
        const info = new NodeFocusInfoBuilder()
            .nodeId(node)
            .slice(slice)
            .focusType(type)
            .build()
        return this.isInfoFocus(info)
    }

    public isInfoFocus (info: NodeFocusInfo): boolean {
        if (this.lastFocus === undefined)
            return false
        return info.infoEqual(this.lastFocus)
    }

    /**
     * Unique set focus style and effect.
     * NOTE: Do not set select in this function. Must set focus and select
     * separately.
     */
    public setFocus (info: NodeFocusInfo, config: FocusConfig): void {
        this._setFocus(config, info)
        this.lastFocus = config.focus ? info : undefined
    }

    public blur (): void {
        if (this.lastFocus === undefined)
            return
        const config = new FocusConfigBuilder().focus(false).build()
        this.setFocus(this.lastFocus, config)
    }

    public setSelNodes (
        nodeIds: readonly string[],
        lastSelected?: Readonly<NodeFocusInfo>,
        config = new SelConfigBuilder().multiSelect(false).build(),
    ): void {
        const infos = nodeIds
            .map(n => new NodeFocusInfoBuilder().nodeId(n).build())
        this.setSelInfos(infos, lastSelected, config)
    }

    /**
     * @param lastSelected if it is undefined will set infos[0] to lastselected
     */
    public setSelInfos (
        infos: readonly NodeFocusInfo[],
        lastSelected?: Readonly<NodeFocusInfo>,
        config = new SelConfigBuilder().multiSelect(false).build(),
    ): void {
        const last = lastSelected ?? infos[0]
        this.addSels(infos, config, last)
    }

    public getSelInfos (): readonly NodeFocusInfo[] {
        return this.getSelsInActiveSheet()
    }

    public getSelNodes (): readonly Readonly<Node>[] {
        const nodes: Readonly<Node>[] = []
        this.getSelInfos().forEach(info => {
            const node = this.apiSvc.getNode(info.nodeId)
            if (node === undefined)
                return
            nodes.push(node)
        })
        return nodes
    }

    /**
     * only `setFocus` can set this field.
     */
    protected lastFocus?: NodeFocusInfo
    protected lastDrags: readonly NodeFocusInfo[] = []

    protected addSels (
        infos: readonly NodeFocusInfo[],
        config: SelConfig,
        lastSelected: Readonly<NodeFocusInfo>,
    ): void {
        this.lastSelected = lastSelected
        if (infos[0] !== undefined && config.trust)
            this._setActiveSheet(infos[0].nodeId)
        if (!config.multiSelect)
            this._doDelSels(this.getSelsInActiveSheet())
        infos.forEach(info => {
            if (!this.getSelsInActiveSheet().some(s => s.infoEqual(info)))
                this.addSelsInActiveSheet(info)
            if (config.isExpand)
                this._expandParent(info.nodeId)
            const infoDire = this.getDire(info)
            infoDire.forEach(directive => directive.setSelect(true))
        })
        if (infos[0] !== undefined && config.scrollIntoView) {
            const dire = this.getDire(infos[0])
            if (dire.length !== 0)
                dire.forEach(directive => directive.scrollIntoView())
        }
        this.focusChange$.next(this.getSelsInActiveSheet())
    }

    protected delSels (
        infos: readonly NodeFocusInfo[],
        lastSelected?: Readonly<NodeFocusInfo>,
    ): void {
        if (lastSelected !== undefined)
            this.lastSelected = lastSelected
        this._doDelSels(infos)
        this.focusChange$.next(this.getSelsInActiveSheet())
    }
    private _dragChange$ = new Subject<boolean>()

    private _setFocus (config: FocusConfig, info: NodeFocusInfo): void {
        if (config.manualBlur && this.lastFocus !== undefined) {
            const lastDire = this.getDire(this.lastFocus)
            lastDire.forEach(dire => {
                dire.updateDisableAutoBlur(true)
                dire.setFocus(false)
            })
        }
        const targetDire = this.getDire(info)
        if (targetDire === undefined)
            return
        /**
         * Blur.
         */
        if (!config.focus) {
            targetDire.forEach(dire => dire.setFocus(false))
            return
        }
        targetDire.forEach(dire => dire.setFocus(true))
    }

    private _doDelSels (infos: readonly NodeFocusInfo[]): void {
        const length = infos.length
        if (length === 0)
            return
        for (let i = length - 1; i >= 0; i -= 1) {
            const d = this.getDire(infos[i])
            if (d.length !== 0)
                d.forEach(dire => dire.setSelect(false))
            const index = Array
                .from(this.getSelsInActiveSheet())
                .findIndex(s => s.infoEqual(infos[i]))
            if (index !== -1)
                this.removeSelsInActiveSheet(index)
        }
    }

    private _setActiveSheet (nodeId: string): void {
        const node = this.apiSvc.getNode(nodeId)
        const activeSheet = this.apiSvc.getActiveSheet()
        const sheet = node?.findParent(NodeType.SHEET)
        if (!isSheet(sheet) || sheet.name === activeSheet)
            return
        const action = new ActiveSheetActionBuilder()
            .activeSheet(sheet.name)
            .build()
        this.apiSvc.handleAction(action)
    }

    private _expandParent (nodeUuid: string): void {
        const node = this.apiSvc.getNode(nodeUuid)
        if (node === undefined)
            return
        /**
         * Figure out whether to change table tab.
         */
        const parent = node.findParent(NodeType.TABLE)
        if (!isTable(parent))
            return
        if (isRow(node) || isRowBlock(node)) {
            this.tableTabStatusSvc.setTabStatus(parent, TableTabView.ROW)
            this.isColumnTab$.next([parent, false])
        } else if (isColumn(node) || isColumnBlock(node)) {
            this.tableTabStatusSvc.setTabStatus(parent, TableTabView.COLUMN)
            this.isColumnTab$.next([parent, true])
        }
    }
}
