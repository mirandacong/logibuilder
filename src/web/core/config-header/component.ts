import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnInit,
    ViewChild,
} from '@angular/core'
import {MatDialogRef} from '@angular/material/dialog'
import {
    AddStdHeaderActionBuilder,
    buildDcfHeader,
    DefaultHeaderActionBuilder,
    RemoveStdHeaderActionBuilder,
    RenameStdHeaderActionBuilder,
    UpdateStdHeaderActionBuilder,
} from '@logi/src/lib/api'
import {
    Column,
    ColumnBlock,
    isColumn,
    isColumnBlock,
    isNode,
} from '@logi/src/lib/hierarchy/core'
import {StandardHeader, StandardHeaderBuilder} from '@logi/src/lib/template'
import {getCopyName} from '@logi/src/web/base/utils'
import {
    getDefault as initDataRange,
} from '@logi/src/web/common/header-picker/date-range'
import {StudioApiService} from '@logi/src/web/global/api/service'
import {timer} from 'rxjs'
import {take} from 'rxjs/operators'

const WAIT_TIME = 100

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-config-header',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class ConfigHeaderComponent implements OnInit {
    public constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _dialogRef: MatDialogRef<ConfigHeaderComponent>,
        private readonly _studioApiSvc: StudioApiService,
    ) { }
    public standardHeaders: readonly StandardHeader[] = []
    public isColumn = isColumn
    public isColumnBlock = isColumnBlock
    public loading = false
    public currHeader?: StandardHeader
    public focusInput = false
    public nodes!: readonly (Readonly<Column> | Readonly<ColumnBlock>)[]
    public inputDate!: StandardHeader
    public trackBy = trackBy
    public ngOnInit (): void {
        this._initData()
        this.currHeader = this.standardHeaders[0]
        this._afterChangeCurr()
    }

    public setCurr (header?: StandardHeader): void {
        if (header === undefined) {
            this.currHeader = undefined
            return
        }
        const currHeader = this._store.get(header.name)
        if (currHeader === undefined)
            return
        this.currHeader = new StandardHeaderBuilder()
            .headerInfos(currHeader.headerInfos)
            .name(header.name)
            .reportDate(currHeader.reportDate)
            .unit(currHeader.unit)
            .build()
        this._afterChangeCurr()
        this._cd.detectChanges()
    }

    public handleInfo (event: StandardHeader): void {
        if (this.currHeader === undefined)
            return
        const newHeader = this._store.get(this.currHeader.name)
        if (newHeader === undefined)
            return
        this._store.set(this.currHeader.name, event)
        this._afterChangeCurr()
    }

    public onCancel (): void {
        this._dialogRef.close()
    }

    public isDefault (header: StandardHeader): boolean {
        const defaultHeader = this._studioApiSvc.getDefaultStdHeader()
        if (defaultHeader === undefined)
            return false
        return header.name === defaultHeader
    }

    public focusName (data: StandardHeader): void {
        this.currHeader = data
        this._afterChangeCurr()
        this.focusInput = true
    }

    /**
     * if @param event never emit, focus will never stop
     * so here should change
     */
    public renameHeader (event: string, data: StandardHeader): void {
        this.focusInput = false
        const action = new RenameStdHeaderActionBuilder()
            .newName(event)
            .oldName(data.name)
            .build()
        this._studioApiSvc.handleAction(action).pipe(take(1)).subscribe(() => {
            const store = this._store.get(data.name)
            if (store !== undefined)
                this._store.set(event, store)
            this._store.delete(data.name)

            this._initData()
            const cur = this.standardHeaders.find(h => h.name === event)
            this.setCurr(cur)
            this._cd.detectChanges()
        })
    }

    public setDefault (header: StandardHeader): void {
        const h = this.isDefault(header) ? undefined : header.name
        const action = new DefaultHeaderActionBuilder().defaultHeader(h).build()
        this._studioApiSvc.handleAction(action).pipe(take(1)).subscribe(() => {
            this._initData()
            this._cd.detectChanges()
        })
    }

    public addHeader (): void {
        const standardInfo = initDataRange()
        const header = new StandardHeaderBuilder()
            .name(getCopyName('新建表头', this.standardHeaders.map(h => h.name)))
            .reportDate(standardInfo.reportDate)
            .headerInfos(standardInfo.headerInfos)
            .unit(standardInfo.unit)
            .build()
        const action = new AddStdHeaderActionBuilder().stdHeader(header).build()
        this._studioApiSvc.handleAction(action).pipe(take(1)).subscribe(() => {
            this.currHeader = header
            this._initData()
            this._afterChangeCurr()
            this._cd.detectChanges()
            // tslint:disable-next-line: ng-rvalue-only-native-element
            this._blockLeft.nativeElement.scrollTop
                = this._blockLeft.nativeElement.scrollHeight
            this.focusInput = true
            this._cd.detectChanges()
        })
    }

    public deleteHeader (data: StandardHeader): void {
        const action = new RemoveStdHeaderActionBuilder()
            .name(data.name)
            .build()
        this._studioApiSvc.handleAction(action).pipe(take(1)).subscribe(() => {
            this._store.delete(data.name)
            this._initData()
            this.setCurr(this.standardHeaders[0])
            this._cd.detectChanges()
        })
    }

    public getOtherNames (header: StandardHeader): readonly string[] {
        return this.standardHeaders
            .filter(r => r.name !== header.name)
            .map(r => r.name)
    }

    public onApplyHeader (): void {
        this.loading = true
        this._cd.detectChanges()
        this._studioApiSvc.excelChange().pipe(take(1)).subscribe((): void => {
            this.loading = false
        })
        timer(WAIT_TIME).subscribe((): void => {
            this._store.forEach((info, header) => {
                const newHeader = new StandardHeaderBuilder()
                    .name(header)
                    .reportDate(info.reportDate)
                    .headerInfos(info.headerInfos)
                    .unit(info.unit)
                    .build()
                const action = new UpdateStdHeaderActionBuilder()
                    .stdHeader(newHeader)
                    .build()
                this._studioApiSvc.handleAction(action)
            })

            this._dialogRef.close()
        })
    }

    @ViewChild('block_left', {static: true})
    private _blockLeft!: ElementRef<HTMLDivElement>

    private _store = new Map<string, StandardHeader>()

    /**
     * call this function after change currHeader or change currHeader store
     */
    private _afterChangeCurr (): void {
        this._setInputData()
        this._setNodes()
        this._cd.detectChanges()
    }

    private _setInputData (): void {
        if (this.currHeader === undefined)
            return
        this.inputDate = this._store
            .get(this.currHeader.name) ?? this.currHeader
    }

    private _setNodes (): void {
        if (this.currHeader === undefined)
            return
        const store = this._store.get(this.currHeader.name)
        if (store === undefined)
            return
        const node = buildDcfHeader(store.reportDate, store.headerInfos)
        this.nodes = node.tree
    }

    private _initData (): void {
        this.standardHeaders = this._studioApiSvc
            .currTemplateSet().standardHeaders
        this.standardHeaders.forEach(r => {
            const store = this._store.get(r.name)
            if (store !== undefined) {
                this._store.set(r.name, store)
                return
            }
            this._store.set(r.name, r)
        })
    }
}

// tslint:disable-next-line: naming-convention ext-variable-name
function trackBy (_: number, item: unknown): unknown {
    if (isNode(item))
        return item.uuid
    return item
}
