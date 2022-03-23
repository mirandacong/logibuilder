import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    Injector,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core'
import {MatMenuTrigger} from '@angular/material/menu'
import {EditBarType} from '@logi/src/lib/api'
import {
    AddItem,
    getAddSeparatorAction,
    getSnippetList,
} from '@logi/src/web/core/editor/node-edit/add_list'
import {NodeEditService} from '@logi/src/web/core/editor/node-edit/service'
import {
    TableTabStatusService,
    TableTabView,
} from '@logi/src/web/core/editor/table-tab-status'
import {Base} from '../base'
import {takeUntil} from 'rxjs/operators'

import {FxMenuService} from '../services/service'

import {getAddItems} from './node_list'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-fx-menu-function',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class TopMenuFunctionComponent extends Base
    implements OnDestroy, OnInit, AfterViewInit {
    public constructor(
        private readonly _fxMenuSvc: FxMenuService,
        private readonly _nodeEditSvc: NodeEditService,
        private readonly _tableTabStatusSvc: TableTabStatusService,
        public readonly injector: Injector,
    ) {
        super(injector)
    }
    @Input() public menuOpen = false
    public nodeEditItems = getAddItems()
    public addItems: readonly Readonly<AddItem>[] = []
    public addSnippetItems = getSnippetList()
    // tslint:disable-next-line: codelyzer-template-property-should-be-public
    public currType = this.type.FUNCTION
    public addRowDisable = true
    public addColDisable = true
    public canEditLabel = false
    public ngAfterViewInit (): void {
        this.baseInit()
        this.menu.menuOpened.pipe(takeUntil(this.destroyed$)).subscribe(() => {
            const nodeIds = this.nodeFocusSvc.getSelNodes().map(n => n.uuid)
            this._fxMenuSvc.updateStatus(this.nodeEditItems, nodeIds)
        })
    }

    public onAddSeparator (): void {
        const target = this.nodeFocusSvc.getSelNodes()[0]
        const tab = this.isRowView() ? TableTabView.ROW : TableTabView.COLUMN
        const action = getAddSeparatorAction(target, tab)
        if (action === undefined)
            return
        this.apiSvc.handleAction(action)
    }

    public ngOnInit (): void {
        this._emptyFocus()
    }

    public ngOnDestroy (): void {
        this.destroyed$.next()
        this.destroyed$.complete()
    }

    public isRowView (): boolean {
        const node = this.nodeFocusSvc.getSelNodes()[0]
        if (!node)
            return true
        return this._tableTabStatusSvc.isRowView(node)
    }

    /**
     * Currently only support add one child.
     * TOOD (minglong): support add multi children?
     */
    public onClickAddBtn (event: Event): void {
        if (this.isRowView() ? !this.addRowDisable : !this.addColDisable)
            this._nodeEditSvc.insert()
        else
            this.disableBtn(event)
    }

    public onInsertSnippet (snippet: AddItem): void {
        this._fxMenuSvc.onInsertSnippet(snippet)
    }

    public onClickItem (item: AddItem, event: Event): void {
        item.nodeType ? this._nodeEditSvc.addNode(item.nodeType)
            : this.disableBtn(event)
    }

    public onClickAddListBtn (): void {
        this._nodeEditSvc.getAddList().subscribe((
            list: readonly Readonly<AddItem>[],
        ): void => {
            this.addItems = list
        })
    }

    public onClickEditLabel (e: Event): void {
        if (!this.canEditLabel) {
            this.disableBtn(e)
            return
        }
        this._nodeEditSvc.setLabel()
    }

    public onClickRemove (event: Event): void {
        if (this.isEmpty) {
            this.disableBtn(event)
            return
        }
        this._nodeEditSvc.remove()
    }

    public onClickAddMore (): void {
        this._nodeEditSvc.batchAddRowOrCol()
    }

    public onClickEditItems (item: AddItem, e: Event): void {
        if (item.disabled) {
            this.disableBtn(e)
            return
        }
        if (item.type === undefined)
            return
        this._fxMenuSvc.clickToolbarBtn(item.type)
    }

    @ViewChild(MatMenuTrigger) protected menu!: MatMenuTrigger

    private _emptyFocus (): void {
        this.nodeFocusSvc
            .listenFocusNodeIds()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((nodeIds: readonly string[]): void => {
                this.cd.markForCheck()
                this.isEmpty = nodeIds.length < 1 ? true : false
                this.addRowDisable = !this.apiSvc.getEditBarStatus(
                    nodeIds,
                    EditBarType.ADD_ROW,
                )
                this.addColDisable = !this.apiSvc.getEditBarStatus(
                    nodeIds,
                    EditBarType.ADD_COL,
                )
                if (nodeIds.length <= 0)
                    return
                this.canEditLabel = this.apiSvc
                    .getEditBarStatus(nodeIds, EditBarType.EDIT_LABEL)
            })
    }
}
