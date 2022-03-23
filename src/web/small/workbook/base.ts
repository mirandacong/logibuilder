import {ChangeDetectorRef, Injector} from '@angular/core'
import {isSheetTab, SheetTab} from '@logi/src/lib/api'
import {assertIsSheet, Sheet} from '@logi/src/lib/hierarchy/core'
import {
    ContextMenuClickEventBuilder,
    ContextMenuComponent,
    ContextMenuService,
} from '@logi/src/web/common/context-menu'
import {getNameColor, ORIGIN_COLOR} from '@logi/src/web/common/palette'
import {CleanDataService} from '@logi/src/web/core/editor/clean-data'
import {NodeEditService} from '@logi/src/web/core/editor/node-edit/service'
import {StudioApiService} from '@logi/src/web/global/api'
import {ReadonlyService} from '@logi/src/web/global/readonly'
import {NotificationService} from '@logi/src/web/ui/notification'
import {TabLocation} from '@logi/src/web/ui/tabs/tabset.component'
import {Subscription, timer} from 'rxjs'

import {getContextMenu} from './menu'

export class EditorBase {
    public constructor(public readonly injector: Injector) {
        this.apiSvc = this.injector.get(StudioApiService)
        this.cd = injector.get(ChangeDetectorRef)
        this.contextMenuSvc = this.injector.get(ContextMenuService)
        this.nodeEditSvc = this.injector.get(NodeEditService)
        this.notificationSvc = this.injector.get(NotificationService)
        this.readonlySvc = this.injector.get(ReadonlyService)
        this.cleanDataSvc = this.injector.get(CleanDataService)
    }
    public readonly apiSvc: StudioApiService
    public readonly contextMenuSvc: ContextMenuService
    public cd: ChangeDetectorRef
    public readonly nodeEditSvc: NodeEditService
    public readonly notificationSvc: NotificationService
    public readonly readonlySvc: ReadonlyService
    public readonly cleanDataSvc: CleanDataService
    public readonly = false
    public isLogiSheet = true
    public sheetTabs: readonly SheetTab[] = []

    public contextMenuActions = getContextMenu(this)
    /**
     * NOTE: only sheet-tabs plugin can set this field.
     */
    public selectedIndex = 0
    public curColorMap: Map<string, string> = new Map<string, string>()
    public subs = new Subscription()

    public contextMenu!: ContextMenuComponent
    public getSheetFromName (name: string): Readonly<Sheet> {
        const sheet = this.apiSvc.currBook().sheets.find(s => s.name === name)
        assertIsSheet(sheet)
        return sheet
    }

    public getSheetFromIndex (i?: number): Readonly<Sheet> | undefined {
        const index = i === undefined ? this.selectedIndex : i
        const tab = this.sheetTabs[index]
        if (tab === undefined || tab.isCustom)
            return
        return this.getSheetFromName(tab.name)
    }

    // tslint:disable-next-line: ter-max-len
    // tslint:disable-next-line: ext-variable-name naming-convention prefer-function-over-method
    public trackBy (_: number, item: unknown): unknown {
        if (isSheetTab(item))
            return item.name
        return item
    }

    public setCurColor (): void {
        const sheets = this.apiSvc.currBook().sheets
        sheets.forEach((sheet: Readonly<Sheet>): void => {
            this.curColorMap.set(sheet.uuid, ORIGIN_COLOR)
        })
    }

    public listenReadonly (): void {
        this.subs.add(this.readonlySvc.getReadonly().subscribe(r => {
            if (r === undefined)
                return
            this.readonly = r
            this.cd.detectChanges()
        }))
    }

    public scrollItem (): void {
        const selectDom = document.querySelectorAll('.flag-button')
        if (selectDom.length === 0)
            return
        timer().subscribe(() => {
            Array.from(selectDom)[this.selectedIndex].scrollIntoView()
        })
    }

    public onRename (newName: string): void {
        if (this.readonly)
            return
        const sheet = this.getSheetFromIndex()
        if (sheet === undefined)
            return
        this.nodeEditSvc.sheetRename(sheet, newName)
    }

    public getOtherNames (currName: string): readonly string[] {
        return this.sheetTabs
            .filter(tab => tab.name !== currName)
            .map(t => t.name)
    }

    public getInkBarColor (index: number): string {
        const sheet = this.getSheetFromIndex(index)
        if (sheet === undefined)
            return ORIGIN_COLOR
        const target = this.curColorMap.get(sheet.uuid)
        if (target === undefined) {
            this.curColorMap.set(sheet.uuid, ORIGIN_COLOR)
            return ORIGIN_COLOR
        }
        return target
    }

    public getInputNameColor (index: number): string {
        return getNameColor(this.getInkBarColor(index))
    }

    public setColor (color: string): void {
        const sheet = this.getSheetFromIndex()
        if (sheet === undefined)
            return
        this.curColorMap.set(sheet.uuid, color)
        this.cd.detectChanges()
    }

    public onCloseSheet (): void {
        if (this.sheetTabs.length === 1) {
            this.notificationSvc.showWarning('工作区内至少含有一张工作表')
            return
        }
        const tab = this.sheetTabs[this.selectedIndex]
        if (tab === undefined)
            return
        this.nodeEditSvc.deleteSheet(tab.name)
    }

    public changeSheetName (): void {
        const sheet = this.getSheetFromIndex()
        if (sheet === undefined)
            return
        const names = this.sheetTabs.map(s => s.name)
        this.nodeEditSvc.renameSheetOpenDialog(sheet, names)
    }

    public copy (): void {
        this.nodeEditSvc.cloneSheet()
    }

    public cleanData (): void {
        const sheet = this.getSheetFromIndex()
        if (sheet === undefined)
            return
        this.cleanDataSvc.openCleanDialog(sheet.name, sheet.uuid)
    }

    public shift (position: TabLocation): void {
        const sheetname = this.sheetTabs[position.oldPosition].name
        this.nodeEditSvc.moveSheet(position.newPosition, sheetname)
    }

    public setActiveSheet (i: number): void {
        if (i === this.selectedIndex)
            return
        this.nodeEditSvc.setActiveSheet(i)
    }

    public onContextmenu (event: MouseEvent, index: number): void {
        this.setActiveSheet(index)
        const sheets = this.apiSvc.currBook().sheets
        if (this.contextMenu === undefined || this.contextMenu.disabled ||
            this.readonly)
            return
        this.contextMenuSvc.show.next(new ContextMenuClickEventBuilder()
            .contextMenu(this.contextMenu)
            .event(event)
            .item({
                color: this.curColorMap.get(sheets[index]?.uuid ?? ''),
                isCustom: this.sheetTabs[index].isCustom,
                isEnableLeft: index !== 0,
                isEnableRight: index !== this.curColorMap.size - 1,
            })
            .build())
        event.preventDefault()
        event.stopPropagation()
    }

    public addSheet (): void {
        this.nodeEditSvc.addSheet()
    }
}
