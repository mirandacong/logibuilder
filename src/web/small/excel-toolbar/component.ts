import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    Injector,
    OnDestroy,
    OnInit,
} from '@angular/core'
import {ToolbarType} from './toolbar_type'
import {ToolbarBase} from './base'
import {Subscription} from 'rxjs'

import {fxExcelToolbar} from './toolbar_button'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-excel-toolbar',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class ExcelToolbarComponent
    extends ToolbarBase implements OnInit, OnDestroy, AfterViewInit {
    public constructor(
        // tslint:disable-next-line: ter-max-len
        // tslint:disable-next-line: codelyzer-template-property-should-be-public
        public readonly injector: Injector,
    ) {
        super(injector)
    }
    public toolbarType = ToolbarType
    public fxExcelToolbar = fxExcelToolbar()
    public ngOnInit (): void {
        this._subs
            .add(this.nodeFocusSvc.listenFocusChange().subscribe(focus => {
                if (focus.length < 1)
                    return
                this.getToolbarStatus(focus[0].nodeId, this.fxExcelToolbar)
                this._getZoom()
                this.cd.detectChanges()
            }))
        this._subs.add(this.readonlySvc.getReadonly().subscribe(r => {
            this.readonly = r === undefined ? true : r
            this.readonly ? this.fontSizeCtrl.disable() :
                this.fontSizeCtrl.enable()
            this.cd.detectChanges()
        }))
    }

    public ngAfterViewInit (): void {
        this._subs.add(this.excelPreviewSvc.getZoomChanged().subscribe(() => {
            this._getZoom()
        }))

        this._subs.add(this.apiSvc.sheetTabsChange().subscribe(r => {
            const workbook = this.excelPreviewSvc.getWorkbook()
            const sheet = workbook.sheets[r.activeIndex()]
            // tslint:disable-next-line: no-magic-numbers
            const zoom = (sheet ? sheet.zoom() : 1) * 100
            this.zoomCtrl.setValue(zoom + '%')
        }))
    }

    public ngOnDestroy (): void {
        this._subs.unsubscribe()
    }
    private _subs = new Subscription()

    private _getZoom (): void {
        const workbook = this.excelPreviewSvc.getWorkbook()
        if (workbook == undefined)
            return
        // tslint:disable-next-line: no-magic-numbers
        const zoom = workbook.getActiveSheet().zoom() * 100
        this.zoomCtrl.setValue(zoom + '%')
    }
}
