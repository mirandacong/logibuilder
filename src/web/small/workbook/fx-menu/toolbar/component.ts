import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
} from '@angular/core'
import {EditBarType} from '@logi/src/lib/api'
import {NodeType} from '@logi/src/lib/hierarchy/core'
import {trackByFnReturnItem} from '@logi/src/web/base/track-by'
import {
    AddItem,
    getAddSeparatorAction,
    getSnippetList,
    ToolbarBtnType,
} from '@logi/src/web/core/editor/node-edit/add_list'
import {NodeEditService} from '@logi/src/web/core/editor/node-edit/service'
import {NodeFocusService} from '@logi/src/web/core/editor/node-focus'
import {
    TableTabStatusService,
    TableTabView,
} from '@logi/src/web/core/editor/table-tab-status'
import {StudioApiService} from '@logi/src/web/global/api'
import {ReadonlyService} from '@logi/src/web/global/readonly'
import {merge, Subject} from 'rxjs'
import {takeUntil} from 'rxjs/operators'

import {FxMenuService} from '../services/service'

import {nodeEditList, simpleEditList} from './toolbar_button'

const BLACK = 'rgba(0, 0, 0, 0.12)'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-fx-menu-toolbar',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class TopMenuToolbarComponent implements OnInit, OnDestroy {
    public constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _fxMenuSvc: FxMenuService,
        private readonly _nodeEditSvc: NodeEditService,
        private readonly _nodeFocusSvc: NodeFocusService,
        private readonly _readonlySvc: ReadonlyService,
        private readonly _studioApiSvc: StudioApiService,
        private readonly _tableTabStatusSvc: TableTabStatusService,
    ) {
    }
    public iconRippleColor = BLACK
    public simpleEditList = simpleEditList()
    public nodeEditList = nodeEditList()
    public addSnippetItems = getSnippetList()
    public addItems: readonly Readonly<AddItem>[] = []
    public toolbarBtnType = ToolbarBtnType
    public addRowDisable = true
    public addColDisable = true
    public rowText = true

    public isOpened = false
    public readonly = false
    public isSnippetOpened = false
    public trackByFn = trackByFnReturnItem

    public ngOnInit (): void {
        this._emptyFocus()
        this._canUndoOrRedo()
        this._readonlySvc
            .getReadonly()
            .pipe(takeUntil(this._destroyed$))
            .subscribe(r => {
                if (r === undefined)
                    return
                this.readonly = r
                this._cd.detectChanges()
            })
        this._tableTabStatusSvc
            .listernTableTabChange()
            .pipe(takeUntil(this._destroyed$))
            .subscribe(() => {
                this._getRowText()
                this._cd.markForCheck()
            })
    }

    public onClickToolbarButton (type?: ToolbarBtnType): void {
        if (type === undefined)
            return
        this._fxMenuSvc.clickToolbarBtn(type)
    }

    public onClickAdd (): void {
        this._nodeEditSvc.insert()
    }

    public onClickAddMore (): void {
        this._nodeEditSvc.batchAddRowOrCol()
    }

    public onAddSeparator (): void {
        const target = this._nodeFocusSvc.getSelNodes()[0]
        const tab = this.rowText ? TableTabView.ROW : TableTabView.COLUMN
        const action = getAddSeparatorAction(target, tab)
        if (action === undefined)
            return
        this._studioApiSvc.handleAction(action)
    }

    public onClickAddListBtn (): void {
        this._nodeEditSvc.getAddList().subscribe((
            list: readonly Readonly<AddItem>[],
        ): void => {
            this.addItems = list
        })
    }

    public onClickItem (item: AddItem): void {
        if (item.nodeType)
            this._nodeEditSvc.addNode(item.nodeType)
    }

    public onInsertSnippet (s: AddItem): void {
        this._fxMenuSvc.onInsertSnippet(s)
    }

    public setOpened (status: boolean): void {
        this.isOpened = status
    }

    public setSnippetOpened (status: boolean): void {
        this.isSnippetOpened = status
    }

    public ngOnDestroy (): void {
        this._destroyed$.next()
        this._destroyed$.complete()
    }

    private _destroyed$ = new Subject()

    private _getRowText (): void {
        const nodes = this._nodeFocusSvc.getSelNodes()
        if (nodes.length < 1)
            return
        const table = nodes[0].findParent(NodeType.TABLE)
        if (table === undefined)
            return
        const tableTab = this._tableTabStatusSvc.getTabStatus(table)
        const isUndefined = nodes === undefined
        this.rowText =
            (isUndefined || tableTab === TableTabView.ROW) ? true : false
    }

    private _emptyFocus (): void {
        this._studioApiSvc
            .clipboardChange()
            .pipe(takeUntil(this._destroyed$))
            .subscribe(() => {
                const paste = this.simpleEditList
                    .find(btn => btn.icon === ToolbarBtnType.PASTE)
                const focusNode = this._nodeFocusSvc
                    .getSelInfos()
                    .map(info => info.nodeId)
                const disa = !this._studioApiSvc.getEditBarStatus(
                    focusNode,
                    EditBarType.PASTE,
                )
                paste?.updateDisabled(disa)
            })
        merge(
            this._nodeFocusSvc.listenFocusNodeIds(),
            this._studioApiSvc.hierarchyChange(),
        ).pipe(takeUntil(this._destroyed$)).subscribe(() => {
            const nodeIdList = this._nodeFocusSvc.getSelNodes().map(n => n.uuid)
            const disabled = nodeIdList.length < 1
            this._updateSimpleEdit(disabled, nodeIdList)
            this._fxMenuSvc.updateStatus(this.addSnippetItems, nodeIdList)
            this._fxMenuSvc.updateStatus(this.nodeEditList, nodeIdList)
            const node = this._studioApiSvc.getNode(nodeIdList[0])
            this.addRowDisable = !this._studioApiSvc.getEditBarStatus(
                [node ? node.uuid : ''],
                EditBarType.ADD_ROW,
            )
            this.addColDisable = !this._studioApiSvc.getEditBarStatus(
                [node ? node.uuid : ''],
                EditBarType.ADD_COL,
            )
            this._cd.detectChanges()
        })
    }

    private _updateSimpleEdit (
        disabled: boolean,
        nodeIds: readonly string[],
    ): void {
        this.simpleEditList.forEach((btn: AddItem): void => {
            if (btn.icon === ToolbarBtnType.CUT
                || btn.icon === ToolbarBtnType.COPY)
                btn.updateDisabled(disabled)
            if (btn.icon !== ToolbarBtnType.PASTE)
                return
            btn.updateDisabled(!this._studioApiSvc.getEditBarStatus(
                nodeIds,
                EditBarType.PASTE,
            ))
        })
    }

    private _canUndoOrRedo (): void {
        this._nodeEditSvc.canRedo().subscribe((canRedo: boolean): void => {
            this.simpleEditList.forEach((v: AddItem): void => {
                if (v.icon === ToolbarBtnType.REDO)
                    v.updateDisabled(!canRedo)
                this._cd.detectChanges()
            })
        })
        this._nodeEditSvc.canUndo().subscribe((canUndo: boolean): void => {
            this.simpleEditList.forEach((v: AddItem): void => {
                if (v.icon === ToolbarBtnType.UNDO)
                    v.updateDisabled(!canUndo)
                this._cd.detectChanges()
            })
        })
    }
}
