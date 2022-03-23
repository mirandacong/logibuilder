import {
    AddSheetPayload,
    MoveSheetPayload,
    RenameSheetPayload,
    SetActiveSheetPayload,
} from '@logi/src/lib/api/payloads'
import {Subject, timer} from 'rxjs'

import {Plugin as Base, PluginType, Product} from '../base'
import {Plugin as BookPlugin} from '../book/plugin'
import {FormBuilder} from '../form'
import {Plugin as WorkbookPlugin} from '../workbook/plugin'

import {
    SheetTab,
    SheetTabBuilder,
    SheetTabsResult,
    SheetTabsResultBuilder,
} from './result'

export class Plugin extends Base<SheetTabsResult> {
    public constructor(
        private readonly _book: BookPlugin,
        private readonly _workbook: WorkbookPlugin,
    ) {
        super()
    }
    public type = PluginType.SHEET_TABS
    public result$ = new Subject<SheetTabsResult>()

    public handle(input: Readonly<Product>): void {
        const sheets = this._book.book.sheets
        this._activeSheet = this._sheetTabs.activeSheet
        const tabs: SheetTab[] = []
        const hierarchySheets = sheets.map(s => s.name)
        const names: string[] = []
        this._workbook.workbook.sheets.forEach(s => {
            const isCustom = !hierarchySheets.includes(s.name())
            const tab = new SheetTabBuilder()
                .isCustom(isCustom)
                .name(s.name())
                .build()
            tabs.push(tab)
            names.push(s.name())
        })
        this.handlePayloads(input)
        if (!names.includes(this._activeSheet) && names.length > 0) {
            const oldIndex = this._sheetTabs.activeIndex()
            const newIndex = oldIndex - 1 >= 0 ? oldIndex - 1 : 0
            this._activeSheet = names[newIndex]
        }
        this._workbook.workbook.setActiveSheet(this._activeSheet)
        timer().subscribe((): void => {
            this._workbook.workbook.refresh()
        })
        const newSheetTabs = new SheetTabsResultBuilder()
            .activeSheet(this._activeSheet)
            .sheetTables(tabs)
            .build()
        if (newSheetTabs.equals(this._sheetTabs))
            return
        this._sheetTabs = newSheetTabs
        this.result$.next(newSheetTabs)
    }

    public setActiveSheetPayload(p: SetActiveSheetPayload): void {
        this._activeSheet = p.sheet
    }

    public addSheetPayload(p: AddSheetPayload): void {
        this._activeSheet = p.name
    }

    public renameSheetPayload(p: RenameSheetPayload): void {
        this._activeSheet = p.name
    }

    public moveSheetPayload(p: MoveSheetPayload): void {
        this._activeSheet = p.name
    }

    public setBookPayload(): void {
        this._activeSheet = this._workbook.workbook.sheets[0]?.name() ?? ''
    }

    public get sheetTabs(): SheetTabsResult {
        return this._sheetTabs
    }
    private _activeSheet!: string
    private _sheetTabs = new SheetTabsResultBuilder().build()
}

export const SHEET_TABS_FORM = new FormBuilder()
    .ctor(Plugin)
    .type(PluginType.SHEET_TABS)
    .deps([PluginType.BOOK, PluginType.WORKBOOK])
    .build()
