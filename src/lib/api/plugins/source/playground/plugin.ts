// tslint:disable-next-line: no-import-side-effect
import '@logi/base/ts/spreadjs/spreadjs_init'
// tslint:disable-next-line: no-wildcard-import ordered-imports
import * as GC from '@grapecity/spread-sheets'
import {Address, AddressBuilder} from '@logi/base/ts/common/excel'
import {isException} from '@logi/base/ts/common/exception'
import {
    isInitPlaygroundPayload,
    isResetChangePayload,
    isSetSourceInPlayGroundPayload,
    ResetChangePayload,
    SetSourceInPlayGroundPayload,
} from '@logi/src/lib/api/payloads'
import {Subject} from 'rxjs'

import {Plugin as Base, PluginType, Product} from '../../base'
import {FormBuilder} from '../../form'
import {Plugin as HsfPlugin} from '../../hsf/plugin'
import {Plugin as WorkbookPlugin} from '../../workbook/plugin'

import {
    CellHistory,
    CellHistoryBuilder,
    CellValue,
    CellValueBuilder,
} from './lib'
import {
    ChangedType,
    PlaygroundResult,
    PlaygroundResultBuilder,
    SourceChanged,
    SourceChangedBuilder,
} from './result'

type SetPayload = SetSourceInPlayGroundPayload
type ResetPayload = ResetChangePayload
type Workbook = GC.Spread.Sheets.Workbook

export class Plugin extends Base<PlaygroundResult> {
    public constructor(
        private readonly _hsf: HsfPlugin,
        private readonly _workbook: WorkbookPlugin,
    ) {
        super()
    }

    public type = PluginType.SOURCE_PLAYGROUND
    public result$ = new Subject<PlaygroundResult>()

    // tslint:disable-next-line: readonly-array
    public historyStorage = new Map<string, CellHistory>()
    public modification = new Map<string, number | null>()
    public getHistory(): readonly CellValue[] {
        const result: CellValue[] = []
        this.historyStorage.forEach((value, key): void => {
            const oldValue = value.value
            const ids = splitCellId(key)
            const row = ids[0]
            const col = ids[1]
            result.push(new CellValueBuilder()
                .row(row)
                .col(col)
                .value(oldValue)
                .build(),
            )
        })
        return result
    }

    public getModification(): readonly CellValue[] {
        const result: CellValue[] = []
        this.modification.forEach((value, key): void => {
            const ids = splitCellId(key)
            const row = ids[0]
            const col = ids[1]
            result.push(new CellValueBuilder()
                .row(row)
                .col(col)
                .value(value)
                .build())
        })
        return result
    }

    public handle(input: Readonly<Product>): void {
        const payloads = input.payloads
        const setPayloads: SetPayload[] = []
        const resetPayloads: ResetPayload[] = []
        let init = false
        payloads.forEach(p => {
            if (isSetSourceInPlayGroundPayload(p))
                setPayloads.push(p)
            else if (isResetChangePayload(p))
                resetPayloads.push(p)
            else if (isInitPlaygroundPayload(p))
                init = true
        })
        if (setPayloads.length > 0)
            this._handleSetPayloads(setPayloads)
        if (resetPayloads.length > 0)
            this._handleResetPayloads(resetPayloads)
        if (init) {
            this.historyStorage = new Map<string, CellHistory>()
            this._changedCounter = new Map<string, number>()
            this.modification = new Map<string, number>()
        }
        return
    }

    public isInPlayground(): boolean {
        return this.historyStorage.size > 0
    }

    private _changedCounter = new Map<string, number>()

    // tslint:disable-next-line: max-func-body-length
    private _handleResetPayloads(payloads: readonly ResetPayload[]): void {
        const changed: SourceChanged[] = []
        payloads.forEach((p: ResetPayload): void => {
            const addr = this._hsf.hsfManager.getCellAddress(p.row, p.col)
            if (isException(addr))
                return
            const ws = this._workbook.workbook.getSheetFromName(addr.sheetName)
            const oldValue = ws.getValue(addr.row, addr.col)
            const id = getCellId(p.row, p.col)
            const cellHist = this.historyStorage.get(id)
            const value = cellHist?.value
            const dependents = getAllDependents(this._workbook.workbook, addr)
            const oldValues = getValues(this._workbook.workbook, dependents)
            ws.setFormula(addr.row, addr.col, cellHist?.formula ?? '')
            ws.setValue(addr.row, addr.col, value)
            this.historyStorage.delete(id)
            this.modification.delete(id)
            const newValues = getValues(this._workbook.workbook, dependents)
            const newTexts = getTexts(this._workbook.workbook, dependents)
            const c = new SourceChangedBuilder()
                .col(p.col)
                .row(p.row)
                // tslint:disable-next-line: no-null-keyword
                .oldValue(oldValue)
                // tslint:disable-next-line: no-null-keyword
                .newValue(value ?? null)
                .type(ChangedType.RESET)
                .newText(ws.getText(addr.row, addr.col) ?? '')
                .build()
            changed.push(c)
            dependents.forEach((a: Address, idx: number): void => {
                const hAddr = this._hsf.hsfManager
                    .getCell(a.sheetName, a.row, a.col)
                if (isException(hAddr))
                    return
                if (oldValues[idx] === newValues[idx])
                    return
                const left = this._substractCount(hAddr[0], hAddr[1])
                const sc = new SourceChangedBuilder()
                    .row(hAddr[0])
                    .col(hAddr[1])
                    .oldValue(oldValues[idx])
                    .newValue(newValues[idx])
                    .newText(newTexts[idx])
                    .type(left > 0 ? ChangedType.EFFECTED : ChangedType.RESET)
                    .build()
                changed.push(sc)
                if (left > 0)
                    return
                this._changedCounter.delete(getCellId(hAddr[0], hAddr[1]))
            })
        })
        this.result$
            .next(new PlaygroundResultBuilder().changed(changed).build())
        return
    }

    // tslint:disable-next-line: max-func-body-length
    private _handleSetPayloads(payloads: readonly SetPayload[]): void {
        const sourceChanged: SourceChanged[] = []
        payloads.forEach((p: SetPayload): void => {
            const addr = this._hsf.hsfManager.getCellAddress(p.row, p.col)
            if (isException(addr))
                return
            const ws = this._workbook.workbook.getSheetFromName(addr.sheetName)
            const oldValue = ws.getValue(addr.row, addr.col)
            const dependents = getAllDependents(this._workbook.workbook, addr)
            const oldValues = getValues(this._workbook.workbook, dependents)
            const formula = ws.getFormula(addr.row, addr.col)
            if (formula !== null)
                ws.setFormula(addr.row, addr.col, '')
            ws.setValue(addr.row, addr.col, p.source.value)
            const newValues = getValues(this._workbook.workbook, dependents)
            const newTexts = getTexts(this._workbook.workbook, dependents)
            dependents.forEach((a: Address, idx: number): void => {
                const hAddr = this._hsf.hsfManager
                    .getCell(a.sheetName, a.row, a.col)
                if (isException(hAddr))
                    return
                if (oldValues[idx] === newValues[idx])
                    return
                const changed = new SourceChangedBuilder()
                    .row(hAddr[0])
                    .col(hAddr[1])
                    .oldValue(oldValues[idx])
                    .newValue(newValues[idx])
                    .newText(newTexts[idx])
                    .type(ChangedType.EFFECTED)
                    .build()
                sourceChanged.push(changed)
                this._plusCount(hAddr[0], hAddr[1])
            })
            const text = ws.getText(addr.row, addr.col) ?? ''
            const newValue = typeof p.source.value === 'string' ?
                // tslint:disable-next-line: no-null-keyword
                null : p.source.value
            sourceChanged.push(new SourceChangedBuilder()
                .oldValue(oldValue)
                .newValue(newValue)
                .type(ChangedType.MODIFIED)
                .newText(text)
                .row(p.row)
                .col(p.col)
                .build(),
            )
            this._logValue(p.row, p.col, oldValue, newValue, formula)
        })
        const result = new PlaygroundResultBuilder()
            .changed(sourceChanged)
            .build()
        this.result$.next(result)
        return
    }

    private _plusCount(row: string, col: string): void {
        const id = getCellId(row, col)
        const cnt = this._changedCounter.get(id) ?? 0
        this._changedCounter.set(id, cnt + 1)
    }

    /**
     * Substract the count and return the left.
     */
    private _substractCount(row: string, col: string): number {
        const id = getCellId(row, col)
        const cnt = this._changedCounter.get(id)
        if (cnt === undefined || cnt <= 0)
            return 0
        this._changedCounter.set(id, cnt - 1)
        return cnt - 1
    }

    private _logValue(
        // tslint:disable-next-line: max-params
        row: string,
        col: string,
        oldValue: number | null,
        newValue: number | null,
        formula: string | null,
    ): void {
        const id = getCellId(row, col)
        if (this.historyStorage.get(id) === undefined) {
            const cellHist = new CellHistoryBuilder()
                .value(oldValue)
                .formula(formula)
                .build()
            this.historyStorage.set(id, cellHist)
        }
        this.modification.set(id, newValue)
    }
}

function getValues(
    wb: Workbook,
    addrs: readonly Address[],
): readonly (number | null)[] {
    return addrs.map((addr: Address): number | null => {
        const ws = wb.getSheetFromName(addr.sheetName)
        // tslint:disable-next-line: no-null-keyword
        return ws.getValue(addr.row, addr.col) ?? null
    })
}

function getTexts(wb: Workbook, addrs: readonly Address[]): readonly string[] {
    return addrs.map((addr: Address): string => {
        const ws = wb.getSheetFromName(addr.sheetName)
        return ws.getText(addr.row, addr.col) ?? ''
    })
}

function getCellId(row: string, col: string): string {
    return `${row}|${col}`
}

function splitCellId(id: string): readonly [string, string] {
    const data = id.split('|')
    return [data[0], data[1]]
}

function getAllDependents(wb: Workbook, addr: Address): readonly Address[] {
    const result: Address[] = []
    const toVisit: Address[] = [addr]
    const hasVisted = new Set<string>()
    while (toVisit.length > 0) {
        // tslint:disable-next-line: no-type-assertion
        const curr = toVisit.pop() as Address
        if (hasVisted.has(curr.uuid))
            continue
        const ws = wb.getSheetFromName(curr.sheetName)
        const dependents = ws.getDependents(curr.row, curr.col)
        const addrs = dependents.map(d => new AddressBuilder()
            .row(d.row)
            .col(d.col)
            .sheetName(d.sheetName)
            .build())
        toVisit.push(...addrs)
        if (hasVisted.size > 0) // The first value is not pushed into it.
            result.push(curr)
        hasVisted.add(curr.uuid)
    }
    return result
}

export const SOURCE_PLAYGROUND_FORM = new FormBuilder()
    .type(PluginType.SOURCE_PLAYGROUND)
    .deps([
        PluginType.HSF,
        PluginType.WORKBOOK,
    ])
    .ctor(Plugin)
    .build()
