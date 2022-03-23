// tslint:disable-next-line: no-wildcard-import
import * as GC from '@grapecity/spread-sheets'
import {debugTimer} from '@logi/base/ts/common/debug'
import {
    CustomSheetInfo,
    HistoryType,
    LoadCustomSheetsPayload,
    RedoPayload,
    RenderPayload,
    SpreadsheetCommandPayload,
    UndoPayload,
} from '@logi/src/lib/api/payloads'
import {
    convertLogi,
    convertToExcel,
    CustomSheet,
    CustomSheetBuilder,
    getConvertDiffPayloads,
} from '@logi/src/lib/hsf'
import {
    executeSpreadjsCommand,
    SpreadsheetPayload,
} from '@logi/src/lib/spreadsheet'
import {Subject, timer} from 'rxjs'

import {Plugin as Base, PluginType, Product} from '../base'
import {FormBuilder} from '../form'
import {EditorHandler, HistoryHandler} from '../handler'
import {Plugin as HsfPlugin} from '../hsf/plugin'

import {History} from './history'
import {WorkbookResult, WorkbookResultBuilder} from './result'

export class Plugin extends Base<WorkbookResult> implements
    EditorHandler, HistoryHandler {
    public constructor(
        private readonly _hsf: HsfPlugin,
    ) {
        super()
    }
    public type = PluginType.WORKBOOK
    public result$ = new Subject<WorkbookResult>()
    public workbook = new GC.Spread.Sheets.Workbook(
        undefined,
        {iterativeCalculationMaximumIterations: 100},
    )

    @debugTimer('workbook plugin')
    public handle(input: Readonly<Product>): void {
        const result = new WorkbookResultBuilder()
            .workbook(this.workbook)
            .actionType(input.actionType)
            .build()
        this._init()
        this.handlePayloads(input)
        const hsfInfo = this._hsf.hsfInfo
        /**
         * There are three type convertion.
         * `load file` or `load excel` will re-convert the whole workbook
         * including custom sheets.
         * `render` action will re-convert the logi sheets.
         * Hierarchy action will convert the diff parts.
         */
        if (this._completeConvert && hsfInfo !== undefined) {
            convertToExcel(
                hsfInfo.hsfBook,
                this.workbook,
                this._customSheets,
                this._styles,
            )
            timer().subscribe((): void => {
                this.workbook.refresh()
            })
        } else if (this._renderLogi && hsfInfo !== undefined)
            convertLogi(hsfInfo.hsfBook, this.workbook)
        else if (hsfInfo !== undefined && hsfInfo.hsfDiff !== undefined) {
            const ps = getConvertDiffPayloads(
                hsfInfo.hsfBook,
                hsfInfo.status,
                hsfInfo.hsfDiff,
            )
            ps.forEach(p => this._commandPayloads.push(p))
        }
        if (this._commandPayloads.length > 0 || this._dryRun) {
            input.addChanged(PluginType.WORKBOOK)
            this._history.add(this._commandPayloads)
        }
        if (this._commandPayloads.length > 0 && !this._dryRun)
            executeSpreadjsCommand(this.workbook, this._commandPayloads)
        this.result$.next(result)
        return
    }

    // tslint:disable-next-line: prefer-function-over-method no-empty
    public setBookPayload(): void {}

    public renderPayload(p: RenderPayload): void {
        if (p.hsfOnly)
            return
        if (p.logiOnly)
            this._renderLogi = true
        else
            this._completeConvert = true
    }

    public initPayload(): void {
        this.workbook.clearSheets()
    }

    // tslint:disable-next-line: prefer-function-over-method no-empty
    public setSourceManagerPayload(): void {}

    public loadCustomSheetsPayload(p: LoadCustomSheetsPayload): void {
        const sheets: CustomSheet[] = []
        // tslint:disable: limit-indent-for-method-in-class
        p.sheets.forEach((cs: CustomSheetInfo): void => {
            const ws = cs.sheet
            const sheet = new CustomSheetBuilder()
                .name(ws.name())
                .content(ws.toJSON())
                .rowCount(ws.getRowCount())
                .colCount(ws.getColumnCount())
                .index(cs.index)
                .build()
            sheets.push(sheet)
        })
        this._customSheets = sheets
        this._styles = p.styles
        p.workbook.destroy()
    }

    public spreadsheetCommandPayload(p: SpreadsheetCommandPayload): void {
        this._commandPayloads.push(...p.payloads)
    }

    public dryRunCommandPayload(): void {
        this._dryRun = true
    }

    public undoPayload(p: UndoPayload): void {
        if (p.undoPlugin !== HistoryType.WORKBOOK)
            return
        this.workbook.suspendEvent()
        this.workbook.undoManager().undo()
        this.workbook.resumeEvent()
        this._history.undo()
    }

    public redoPayload(p: RedoPayload): void {
        if (p.redoPlugin !== HistoryType.WORKBOOK)
            return
        this.workbook.suspendEvent()
        this.workbook.undoManager().redo()
        this.workbook.resumeEvent()
        this._history.redo()
    }
    // tslint:disable-next-line: readonly-array
    private _commandPayloads: SpreadsheetPayload[] = []
    private _dryRun = false

    private _customSheets: readonly CustomSheet[] = []
    private _styles: readonly GC.Spread.Sheets.Style[] = []
    private _completeConvert = false
    private _renderLogi = false
    private _history = new History()

    private _init(): void {
        this._completeConvert = false
        this._renderLogi = false
        this._customSheets = []
        this._styles = []
        this._commandPayloads = []
        this._dryRun = false
    }
}

export const WORKBOOK_FORM = new FormBuilder()
    .type(PluginType.WORKBOOK)
    .deps([
        PluginType.HSF,
    ])
    .ctor(Plugin)
    .build()
