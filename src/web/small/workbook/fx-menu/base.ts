import {ChangeDetectorRef, Injector, Renderer2} from '@angular/core'
import {MatDialog} from '@angular/material/dialog'
import {MatMenuTrigger} from '@angular/material/menu'
import {DownloadActionBuilder, LoadExcelActionBuilder} from '@logi/src/lib/api'
import {readFile} from '@logi/src/web/base/file'
import {trackByFnReturnItem} from '@logi/src/web/base/track-by'
import {isHTMLInputElement} from '@logi/src/web/base/utils'
import {FileType} from '@logi/base/ts/common/file_type'
import {AboutComponent} from '@logi/src/web/common/about'
import {FuncDocComponent} from '@logi/src/web/common/func-doc'
import {
    AddItem,
    AddItemBuilder,
    ToolbarBtnType,
} from '@logi/src/web/core/editor/node-edit/add_list'
import {NodeFocusService} from '@logi/src/web/core/editor/node-focus'
import {ButtonType, TopMenuService} from './service'
import {StudioApiService, SaveAsService} from '@logi/src/web/global/api'
import {DownloadService} from '@logi/src/web/global/api/download.service'
import {ReadonlyService} from '@logi/src/web/global/readonly'
import {
    ActionBuilder,
    ButtonGroupBuilder,
    DialogService,
    InputDialogDataBuilder,
} from '@logi/src/web/ui/dialog'
import {NotificationService} from '@logi/src/web/ui/notification'
import {Observable, of, Subject} from 'rxjs'
import {mergeMap, takeUntil} from 'rxjs/operators'

export class Base {
    // tslint:disable-next-line: max-func-body-length
    public constructor(
        public readonly injector: Injector,
    ) {
        this.notificationSvc = injector.get(NotificationService)
        this.topMenuSvc = injector.get(TopMenuService)
        this.render2 = injector.get(Renderer2)
        this.readonlySvc = injector.get(ReadonlyService)
        this.apiSvc = injector.get(StudioApiService)
        this.dialog = injector.get(MatDialog)
        this.nodeFocusSvc = injector.get(NodeFocusService)
        this.cd = injector.get(ChangeDetectorRef)
        this.dialogSvc = injector.get(DialogService)
        this.downloadSvc = injector.get(DownloadService)
        this.saveAsSvc = injector.get(SaveAsService)
    }
    public saveAsSvc: SaveAsService
    public dialog: MatDialog
    public isEmpty = true
    public notificationSvc: NotificationService
    public nodeFocusSvc: NodeFocusService
    public cd: ChangeDetectorRef
    public apiSvc: StudioApiService
    public menuOpen = false
    public readonly = false
    public isOpened = false
    public type = ButtonType
    public helpList = helpList()
    public currType = ButtonType.UNKNOWN
    public readonly render2: Renderer2
    public trackBy = trackByFnReturnItem

    public emptyFocus (): void {
        this.nodeFocusSvc
            .listenFocusNodeIds()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((nodeIds: readonly string[]): void => {
                this.cd.markForCheck()
                this.isEmpty = nodeIds.length < 1 ? true : false
            })
    }

    public onHelpButton (btn: AddItem, event: Event): void {
        if (btn.disabled)
            event.stopPropagation()
        const btnType = btn.type
        switch (btnType) {
        case ToolbarBtnType.ABORT:
            this._onClickAbout()
            break
        case ToolbarBtnType.DOCUMENT:
            break
        case ToolbarBtnType.FUNC_LIST:
            this._openFuncListTab()
            break
        default:
            return
        }
    }

    public setOpened (status: boolean): void {
        this.isOpened = status
        this.topMenuSvc.onBtnOpen(this.currType, status)
        this.setButtonStyle()
    }

    // tslint:disable-next-line: prefer-function-over-method
    public disableBtn (e: Event): void {
        e.stopPropagation()
    }

    public baseInit (): void {
        this.topMenuSvc
            .listenBtnOpen()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((state: ButtonType): void => {
                state !== this.currType ? this.close() : this.open()
            })
        this.readonlySvc
            .getReadonly()
            .pipe(takeUntil(this.destroyed$))
            .subscribe(r => {
                if (r === undefined)
                    return
                this.readonly = r
                this.cd.detectChanges()
            })
        this.destroyed$.subscribe(() => {
            this.topMenuSvc.closeAll()
        })
    }

    public onDownload (): void {
        const onConfirm = (controlValue: string): Observable<boolean> => {
            this.downloadSvc.setFileName(controlValue)
            const action = new DownloadActionBuilder()
                .type(FileType.XLSX)
                .build()
            this.apiSvc.handleAction(action)
            return of(true)
        }
        const onCancel = () => of(true)
        const buttonGroup = new ButtonGroupBuilder()
            .secondary([new ActionBuilder().text('取消').run(onCancel).build()])
            .primary(new ActionBuilder().text('保存').run(onConfirm).build())
            .build()
        const dialogData = new InputDialogDataBuilder()
            .title('命名文件')
            .value('')
            .buttonGroup(buttonGroup)
            .build()
        this.dialogSvc.openInputDialog(dialogData)
    }

    public onOpenExcel (e: Event): void {
        e.stopPropagation()
        const el = e.target
        if (!isHTMLInputElement(el))
            return
        this._loadExcel(el).subscribe(() => {
            /**
             * HTMLInputElement.value is the absolute path of file
             * this._fileSvc.loadFile(files[0]) use the el.value,
             * so init el.value must be after load success
             *
             * When the file path is the same,
             * the input change will not be triggered,
             * so we need to initialize the input value
             * moredetails see https://stackoverflow.com/questions/4109276/how-to-detect-input-type-file-change-for-the-same-file
             */
            el.value = ''
        })
    }

    public saveAsModel (): void {
        this.saveAsSvc.saveAsModel()
    }

    public onHoverButton (): void {
        this.topMenuSvc.shouldOpen() ? this.open() : this.close()
    }

    public setButtonStyle (): void {
        const fxBtns = document.querySelectorAll('.top-menu-button')
        const excelBtns = document.querySelectorAll('.fx-menu-button')
        let haveOpenMenu = false
        this.topMenuSvc.getButtonState().forEach((values: boolean): void => {
            if (values)
                haveOpenMenu = values
            return
        })
        const value = haveOpenMenu ? '1500' : '100'
        const btns = Array.from(fxBtns).concat(Array.from(excelBtns))
        btns.forEach((b: Element): void => {
            this.render2.setStyle(b, 'z-index', value)
        })
    }
    protected readonly topMenuSvc: TopMenuService
    protected readonly readonlySvc: ReadonlyService
    protected readonly dialogSvc: DialogService
    protected readonly downloadSvc: DownloadService
    protected destroyed$ = new Subject<void>()
    protected readonly menu!: MatMenuTrigger
    protected open (): void {
        if (this.menu.menuOpen)
            return
        this.menu.openMenu()
    }

    protected close (): void {
        if (!this.menu.menuOpen)
            return
        this.menu.closeMenu()
    }

    private _onClickAbout (): void {
        this.dialog.open(
            AboutComponent,
            {panelClass: 'misc-about-dialog', autoFocus: false},
        )
    }

    private _openFuncListTab (): void {
        this.dialog.open(FuncDocComponent, {
            autoFocus: false,
            hasBackdrop: false,
            height: '630px',
            width: '1080px',
        })
    }

    private _loadExcel (el: HTMLInputElement): Observable<unknown> {
        const files = el.files
        const obs = of(undefined)
        if (files === null || files.length !== 1)
            return obs
        return readFile(files[0]).pipe(mergeMap(strFile => {
            if (strFile === undefined)
                return obs
            const action = new LoadExcelActionBuilder().excel(strFile).build()
            this.apiSvc.handleAction(action)
            return obs
        }))
    }
}

function helpList (): readonly AddItem[] {
    return [
        new AddItemBuilder()
            .type(ToolbarBtnType.ABORT)
            .text('关于')
            .disabled(false)
            .build(),
        new AddItemBuilder()
            .type(ToolbarBtnType.FUNC_LIST)
            .text('函数列表')
            .disabled(false)
            .build(),
    ]
}
