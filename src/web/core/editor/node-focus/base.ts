import {Injector} from '@angular/core'
import {SliceExpr, Table} from '@logi/src/lib/hierarchy/core'
import {StudioApiService} from '@logi/src/web/global/api/service'
import {BehaviorSubject, Observable, Subject} from 'rxjs'
import {map} from 'rxjs/operators'

import {NodeFocusInfo, NodeFocusInfoBuilder} from './define'
import {NodeFocusableDirective} from './directive'

/**
 * Events and Register defined.
 */
export abstract class Base {
    public constructor(
        public readonly injector: Injector,
    ) {
        this.apiSvc = this.injector.get(StudioApiService)
    }

    public readonly apiSvc: StudioApiService
    public isColumnTab$ = new Subject<readonly [Readonly<Table>, boolean]>()
    /**
     * NOTE: Only one place can add and one place can remove.
     *
     * public only for test
     */
    // tslint:disable-next-line: readonly-array
    public sels = new Map<string, NodeFocusInfo[]>()
    public registry(d: NodeFocusableDirective): void {
        const nodeId = d.node.uuid
        const ds = this.focusDirectiveMap.get(nodeId) ?? []
        if (!ds.includes(d))
            ds.push(d)
        this.focusDirectiveMap.set(nodeId, ds)
        if (this.isSelected(nodeId, d.sliceExpr)) {
            d.scrollIntoView()
            d.setSelect(true)
        }
    }

    public unregistry(d: NodeFocusableDirective): void {
        const nodeId = d.node.uuid
        const ds = this.focusDirectiveMap.get(nodeId) ?? []
        const index = ds.indexOf(d)
        if (index !== -1)
            ds.splice(index, 1)
        if (ds.length === 0)
            this.focusDirectiveMap.delete(nodeId)
    }

    public listenFocusChange(): Observable<readonly NodeFocusInfo[]> {
        return this.focusChange$
    }

    public listenFocusNodeIds(): Observable<readonly string[]> {
        return this.listenFocusChange().pipe(map(is => is.map(i => i.nodeId)))
    }

    public isSelected(nodeId: string, slice?: SliceExpr): boolean {
        const info = new NodeFocusInfoBuilder()
            .nodeId(nodeId)
            .slice(slice)
            .build()
        return this.isInfoSelected(info)
    }

    public isInfoSelected(nodeFocusInfo: NodeFocusInfo): boolean {
        const selInfo = new NodeFocusInfoBuilder()
            .nodeId(nodeFocusInfo.nodeId)
            .slice(nodeFocusInfo.slice)
            .build()
        return this.getSelsInActiveSheet().some(d => d.infoEqual(selInfo))
    }

    // tslint:disable-next-line: readonly-array
    public addSelsInActiveSheet(value: NodeFocusInfo): void {
        const activeSheet = this.apiSvc.getActiveSheet()
        const arr = this.getSelsInActiveSheet().slice()
        const exist = arr.find(sel => sel.infoEqual(value)) !== undefined
        if (exist)
            return
        arr.push(value)
        this.sels.set(activeSheet, arr)
    }

    public removeSelsInActiveSheet(index: number): void {
        const activeSheet = this.apiSvc.getActiveSheet()
        const sels = this.getSelsInActiveSheet().slice()
        sels.splice(index, 1)
        this.sels.set(activeSheet, sels)
    }

    public updateActiveTemplateRoot(id: string): void {
        this._activeTemplateRoot = id
    }

    public updateIsTemplate(isTemplate: boolean): void {
        this._isTemplate = isTemplate
        if (!isTemplate)
            this._activeTemplateRoot = ''
    }
    protected focusChange$ = new BehaviorSubject<readonly NodeFocusInfo[]>([])

    // tslint:disable-next-line: readonly-array
    protected focusDirectiveMap = new Map<string, NodeFocusableDirective[]>()

    protected getSelsInActiveSheet(): readonly NodeFocusInfo[] {
        const activeSheet = this._isTemplate ? this._activeTemplateRoot :
            this.apiSvc.getActiveSheet()
        const sels = this.sels.get(activeSheet)
        if (sels === undefined)
            return []
        return sels
    }

    protected getDire(
        info: Readonly<NodeFocusInfo>,
    ): readonly NodeFocusableDirective[] {
        const dires = this.focusDirectiveMap.get(info.nodeId)
        if (dires === undefined)
            return []
        return dires.filter(d => d.sliceExpr?.uuid === info.slice?.uuid
            && d.focusType === info.focusType,
        )
    }
    private _isTemplate = false
    private _activeTemplateRoot = ''
}
