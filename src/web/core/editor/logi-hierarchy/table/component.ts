import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostListener,
    Injector,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core'
import {NodeType, SCALAR_HEADER, Table} from '@logi/src/lib/hierarchy/core'
import {ContextMenuItem} from '@logi/src/web/common/context-menu'
import {AddFbService} from '@logi/src/web/core/editor/add-fb'
import {
    ContextMenuActionService,
} from '@logi/src/web/core/editor/contextmenu-action'
import {
    Table as TableViewBase,
} from '@logi/src/web/core/editor/logi-hierarchy/base'
import {NodeEditService} from '@logi/src/web/core/editor/node-edit/service'
import {SelConfigBuilder} from '@logi/src/web/core/editor/node-focus'
import {
    TableTabStatusService,
    TableTabView,
} from '@logi/src/web/core/editor/table-tab-status'
import {haveStandarHeader} from '@logi/src/web/global/api/hierarchy'
import {LogiButtonComponent} from '@logi/src/web/ui/button'
import {takeUntil} from 'rxjs/operators'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-editor-table',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class TableComponent extends TableViewBase implements
OnInit, OnDestroy, AfterViewInit {
    @Input() public set table(t: Readonly<Table>) {
        this.node = t
        this.stub = t.headerStub
        this.name = t.name
    }
    public constructor(
        private readonly _addFbSvc: AddFbService,
        private readonly _contextMenuActionSvc: ContextMenuActionService,
        private readonly _el: ElementRef<HTMLElement>,
        private readonly _nodeEditSvc: NodeEditService,
        private readonly _tableTabStatusSvc: TableTabStatusService,
        public readonly injector: Injector,
    ) {
        super(injector)
    }
    public subMenuActions: readonly ContextMenuItem[] = []

    public isColumnTab = false
    public stub = ''
    /**
     * public only for test
     */
    // tslint:disable-next-line: codelyzer-template-property-should-be-public
    @ViewChild('add_btn') public readonly addBtn!: LogiButtonComponent

    @HostListener('click')
    public onClickTable(): void {
        const tabStatus = this.isColumnTab ?
            TableTabView.COLUMN : TableTabView.ROW
        this._tableTabStatusSvc.setTabStatus(this.node, tabStatus)
    }

    /**
     * tab click trigger before hostlistener('click')
     * so here set 'this.isColumnTab' is enough
     */
    public clickTab(isRow: boolean): void {
        this.isColumnTab = !isRow
        if (this._title.nativeElement.classList.contains('table-sticky-change'))
            this._el.nativeElement.scrollIntoView({block: 'start'})
    }

    public addTableChild(): void {
        const type = this.isColumnTab ? this.nodeType.COLUMN : this.nodeType.ROW
        const length = this.isColumnTab
            ? this.node.cols.length
            : this.node.rows.length
        this.addChild(type, length)
    }

    public ngOnInit(): void {
        this.name = this.node.name
        this.stub = this.node.headerStub
        this._serviceSubscribe()
        this.initSubContextMenu()
        this.onClickTable()
    }

    public ngAfterViewInit(): void {
        this._addFbSvc.setBtn(this.node.uuid, this.addBtn.el.nativeElement)
    }

    public ngOnDestroy(): void {
        this.destroyed$.next()
        this.destroyed$.complete()
        this._addFbSvc.tableDestroy(this.node)
    }

    // tslint:disable-next-line: codelyzer-template-property-should-be-public
    public selectAllnodes(type: NodeType): void {
        const config = new SelConfigBuilder().multiSelect(false).build()
        if (type === NodeType.COLUMN)
            this.nodeFocusSvc.setSelNodes(
                this.node.cols.map(n => n.uuid),
                undefined,
                config,
            )
        else if (type === NodeType.ROW)
            this.nodeFocusSvc.setSelNodes(
                this.node.rows.map(n => n.uuid),
                undefined,
                config,
            )
    }

    public initSubContextMenu(): void {
        this.subMenuActions =
            this._contextMenuActionSvc.initTableSubContextMenu(this.node)
        /**
         * If do not use `detectChanges`, submenu can not use.
         */
        // tslint:disable-next-line: ng-markforcheck-instead-of-detectchanges
        this.cd.detectChanges()
    }

    public getHeaderName(): string {
        if (this.node.referenceHeader === undefined)
            return '自定义列'
        if (this.node.referenceHeader === SCALAR_HEADER)
            return '标量表头'
        return this.node.referenceHeader
    }

    public isStandardHeader(): boolean {
        return haveStandarHeader(this.node)
    }

    // tslint:disable-next-line: codelyzer-template-property-should-be-public
    public canUnlink(): boolean {
        return this._nodeEditSvc.canUnlink(this.node)
    }

    // tslint:disable-next-line: codelyzer-template-property-should-be-public
    public getSubMenu(): readonly unknown[] {
        return this._contextMenuActionSvc.getTableSubMenu(this.node)
    }

    @ViewChild('table_title')
    private readonly _title!: ElementRef<HTMLDivElement>

    // tslint:disable-next-line: max-func-body-length
    private _serviceSubscribe(): void {
        this.nodeFocusSvc.isColumnTab$
            .pipe(takeUntil(this.destroyed$))
            .subscribe((m: readonly [Readonly<Table>, boolean]): void => {
                if (m[0].uuid !== this.node.uuid)
                    return
                this.isColumnTab = m[1]
                this.collapse = false
                this.cd.detectChanges()
            },)
        this.expandNodeState()
    }
}
