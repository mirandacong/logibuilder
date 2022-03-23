// tslint:disable-next-line: no-wildcard-import
import * as GCExcel from '@grapecity/spread-excelio'
// tslint:disable-next-line: no-wildcard-import ordered-imports
import * as GC from '@grapecity/spread-sheets'
import {
    CustomSheetInfo,
    CustomSheetInfoBuilder,
    LoadCustomSheetsPayloadBuilder,
    Payload,
    RenderPayloadBuilder,
    SetBookPayloadBuilder,
    SetFormulaManagerPayloadBuilder,
    SetModifierManagerPayloadBuilder,
    SetSourceManagerPayloadBuilder,
    SetStdHeaderSetPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {Book, Sheet} from '@logi/src/lib/hierarchy/core'
import {
    COVER_NAME,
    getVersionCell,
    HSF_VERSION,
    parseHsfVersion,
} from '@logi/src/lib/hsf'
import {Model} from '@logi/src/lib/model'
import {Observable, Subject} from 'rxjs'

/**
 * Not all styles in spreadjs workbook(wb.getNamedStyles()) are needed.
 * But spreadjs isn't able to get the styles in custom sheets only.
 * So we should get the style names in custom sheets by this strange way.
 */
export function getCustomStyleNames(
    ws: GC.Spread.Sheets.Worksheet,
): readonly string[] {
    const reg = /"style":"(.*?)"/gm
    const sheetStr = JSON.stringify(ws.toJSON())
    const res = sheetStr.match(reg)
    if (res === null)
        return []
    return res.map((style: string): string =>
        style.slice('"style":"'.length, style.length - 1))
}

/**
 * Get the target styles and its parent styles according to the names.
 */
function getCustomStyles(
    names: Set<string>,
    styles: readonly GC.Spread.Sheets.Style[],
): readonly GC.Spread.Sheets.Style[] {
    const res = new Set<GC.Spread.Sheets.Style>()

    const styleMap = new Map<string, GC.Spread.Sheets.Style>()
    styles.forEach((s: GC.Spread.Sheets.Style): void => {
        if (s.name !== undefined)
            styleMap.set(s.name, s)
    })

    names.forEach((sn: string): void => {
        let s = styleMap.get(sn)
        while (s !== undefined) {
            res.add(s)
            s = s.parentName === undefined
                ? undefined
                : styleMap.get(s.parentName)
        }
    })

    return Array.from(res)
}

/**
 * The outer formula makes spreadjs load failed. Clear them.
 */
function replaceFormula(obj: object): void {
    // tslint:disable-next-line: no-type-assertion readonly-keyword
    const ssjson = obj as {sheets: object, names?: readonly object[]}
    replaceSheet(ssjson.sheets)
    replaceCustomNames(ssjson)
    const names = ssjson.names?.filter((name: object): boolean => {
        const expr = Reflect.get(name, 'formula')
        if (typeof expr !== 'string')
            return true
        return !isExternalFormula(expr)
    })
    ssjson.names = names
}

function replaceSheet(sheets: object): void {
    Reflect.ownKeys(sheets).forEach(k => {
        const sheet = Reflect.get(sheets, k)
        replaceSheetFormula(sheet)
        replaceCustomNames(sheet)
    })
}

function replaceSheetFormula(obj: object): void {
    if (typeof obj !== 'object' || obj === null)
        return
    Reflect.ownKeys(obj).forEach(k => {
        const v = Reflect.get(obj, k)
        if (typeof v === 'object') {
            replaceSheetFormula(v)
            return
        }
        if (k !== 'formula' || typeof v !== 'string')
            return
        if (isExternalFormula(v))
            Reflect.set(obj, k, '')
    })
}

// tslint:disable-next-line: readonly-keyword
function replaceCustomNames(obj: {names?: readonly object[]}): void {
    const names = obj.names?.filter((name: object): boolean => {
        const expr = Reflect.get(name, 'formula')
        if (typeof expr !== 'string')
            return true
        return !isExternalFormula(expr)
    })
    obj.names = names
}

function isExternalFormula(expr: string): boolean {
    if (expr[0] === '[')
        return true
    const parts = expr.split('"')
    for (let i = 0; i < parts.length; i += 1) {
        /**
         * Ignore the '[' in string "...".
         */
        // tslint:disable-next-line: no-magic-numbers
        if (i % 2 !== 0)
            continue
        const p = parts[i]
        if (p.indexOf('[') >= 0)
            return true
    }
    return false
}

export function openExcel(
    buffer: ArrayBuffer,
    wb = new GC.Spread.Sheets.Workbook(),
): Observable<GC.Spread.Sheets.Workbook> {
    const result$ = new Subject<GC.Spread.Sheets.Workbook>()
    const excelIo = new GCExcel.IO()
    const successCallback = (buf: object): void => {
        try {
            replaceFormula(buf)
            // tslint:disable-next-line: no-try
            try {
                wb.fromJSON(buf, {doNotRecalculateAfterLoad: true})
            // tslint:disable-next-line: no-empty
            } catch {}
            wb.options.tabStripVisible = false
            wb.options.allowContextMenu = false
            result$.next(wb)
            result$.complete()
        } catch (e) {
            result$.error(e)
            result$.complete()
        }
    }
    const failedCallback = (e: unknown): void => {
        result$.error(e)
        result$.complete()
    }
    // @ts-ignore
    excelIo.open(buffer, successCallback, failedCallback)
    return result$
}

export function getCustomSheetPayloads(
    wb: GC.Spread.Sheets.Workbook,
    book: Readonly<Book>,
): readonly Payload[] {
    const customSheets: CustomSheetInfo[] = []
    const stylesNames = new Set<string>()
    let index = -1
    const worksheetNames = wb.sheets.map(s => s.name())
    if (book.sheets.every(s => !worksheetNames.includes(s.name)))
        index = book.sheets.length - 1
    wb.sheets.forEach((ws: GC.Spread.Sheets.Worksheet): void => {
        if (ws.name() === COVER_NAME)
            return
        index += 1
        const hierarchySheet = book.sheets.find((
            sheet: Readonly<Sheet>,
        ): boolean => sheet.name === ws.name())
        if (hierarchySheet !== undefined)
            return
        const cs = new CustomSheetInfoBuilder().sheet(ws).index(index).build()
        customSheets.push(cs)
        const names = getCustomStyleNames(ws)
        names.forEach(n => stylesNames.add(n))
    })
    const styles = getCustomStyles(stylesNames, wb.getNamedStyles())
    const customPayload = new LoadCustomSheetsPayloadBuilder()
        .sheets(customSheets)
        .styles(styles)
        .workbook(wb)
        .build()
    return [customPayload]
}

export function getFastLoadPayloads(
    wb: GC.Spread.Sheets.Workbook,
): readonly Payload[] {
    const idx = wb.getSheetIndex(COVER_NAME)
    if (idx < 0 || idx === null)
        return [new RenderPayloadBuilder().build()]
    const cover = wb.sheets[idx]
    const cell = getVersionCell(cover)
    const excelVersion = parseHsfVersion(cell.value() ?? '')
    wb.removeSheet(idx)
    if (excelVersion !== HSF_VERSION)
        return [new RenderPayloadBuilder().logiOnly(true).build()]
    return [new RenderPayloadBuilder().hsfOnly(true).build()]
}

export function getSetModelPayloads(
    model: Readonly<Model>,
): readonly Payload[] {
    const bookPayload = new SetBookPayloadBuilder().book(model.book).build()
    const smPayload = new SetSourceManagerPayloadBuilder()
        .sourceManager(model.sourceManager)
        .build()
    const cfmPayload = new SetFormulaManagerPayloadBuilder()
        .formulaManager(model.formulaManager)
        .build()
    const mmPayload = new SetModifierManagerPayloadBuilder()
        .modifierManager(model.modifierManager)
        .build()
    const shPayload = new SetStdHeaderSetPayloadBuilder()
        .templateSet(model.stdHeaderSet)
        .build()
    return [
        bookPayload,
        smPayload,
        cfmPayload,
        mmPayload,
        shPayload,
    ]
}
