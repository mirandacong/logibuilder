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
import {
    NewBookActionBuilder,
    SheetTab,
    SheetTabsResult,
} from '@logi/src/lib/api'
import {addEditorGlobalStyle} from '@logi/src/web/base/editor'
import {ContextMenuComponent} from '@logi/src/web/common/context-menu'
import {ExcelService} from '@logi/src/web/core/excel-preview'
import {EditorBase} from './base'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-workbook',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class WorkbookComponent
    extends EditorBase implements OnInit, AfterViewInit, OnDestroy {
    public constructor(
        private readonly _excelSvc: ExcelService,
        // tslint:disable-next-line: ter-max-len
        // tslint:disable-next-line: codelyzer-template-property-should-be-public
        public readonly injector: Injector,
    ) {
        super(injector)
    }
    @Input() public rendering = false
    public showHint = true
    // tslint:disable-next-line: codelyzer-template-property-should-be-public
    @ViewChild(ContextMenuComponent) public contextMenu!: ContextMenuComponent
    public ngAfterViewInit (): void {
        this.subs.add(this.apiSvc.excelChange().subscribe(() => {
            this._addRenderedSheet()
            this.cd.markForCheck()
            this.rendering = false
        }))
        this.listenReadonly()
        this._init()
        this._updateTabs(this.apiSvc.sheetTabs())
        this.setCurColor()
    }

    public onSave (): void {
    }

    public ngOnDestroy (): void {
        this.subs.unsubscribe()
    }

    public onRefresh (): void {
        this._excelSvc.refresh()
    }

    public ngOnInit (): void {
        this._addRenderedSheet()
        addEditorGlobalStyle()
        this.subs.add(this.apiSvc.sheetTabsChange().subscribe(result => {
            this._updateTabs(result)
        }))
    }

    public hasRendered (tab: SheetTab): boolean {
        const sheet = this.getSheetFromName(tab.name)
        if (sheet === undefined)
            return true
        return this._renderedSheets.includes(sheet.uuid)
    }

    // tslint:disable-next-line: readonly-array
    private _renderedSheets: string[] = []

    private _init () {
        const action = new NewBookActionBuilder().name('工作簿').build()
        this.apiSvc.handleAction(action)
    }

    private _updateTabs (result: SheetTabsResult): void {
        this.sheetTabs = result.sheetTabs
        this.selectedIndex = result.activeIndex()
        if (result.sheetTabs.length === 0)
            return
        this.isLogiSheet = !result.sheetTabs[result.activeIndex()].isCustom
        this._addRenderedSheet()
        this.cd.detectChanges()
    }

    private _addRenderedSheet (): void {
        const sheetTab = this.sheetTabs[this.selectedIndex]
        if (sheetTab === undefined || sheetTab.isCustom)
            return
        const sheet = this.apiSvc.currBook().sheets
            .find(s => s.name === sheetTab.name)
        if (sheet === undefined)
            return
        if (this._renderedSheets.includes(sheet.uuid))
            return
        this._renderedSheets.push(sheet.uuid)
        this.cd.detectChanges()
    }
}
