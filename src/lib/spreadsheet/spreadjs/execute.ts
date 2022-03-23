// tslint:disable-next-line: no-wildcard-import
import * as GC from '@grapecity/spread-sheets'
import {
    Horizontal,
    LineType,
    Underline,
    Vertical,
} from '@logi/base/ts/common/excel'
import {
    AddColPayload,
    AddRowPayload,
    AddSheetPayload,
    BorderPosition,
    CellRange,
    ClearDataPayload,
    CloneFormatPayload,
    isAddColPayload,
    isAddRowPayload,
    isAddSheetPayload,
    isClearDataPayload,
    isCloneFormatPayload,
    isLockCellPayload,
    isMergePayload,
    isMoveSheetPayload,
    isRemoveColPayload,
    isRemoveRowPayload,
    isRemoveSheetPayload,
    isRenameSheetPayload,
    isSetBackColorPayload,
    isSetBorderPayload,
    isSetCellOverflowPayload,
    isSetColCountPayload,
    isSetColWidthPayload,
    isSetFontBoldPayload,
    isSetFontColorPayload,
    isSetFontFamilyPayload,
    isSetFontItalicPayload,
    isSetFontPayload,
    isSetFontSizePayload,
    isSetFormatPayload,
    isSetFormulaPayload,
    isSetHorizontalAlignPayload,
    isSetIndentPayload,
    isSetRowCountPayload,
    isSetRowHeightPayload,
    isSetUnderlinePayload,
    isSetValuePayload,
    isSetVerticalAlignPayload,
    isSetWordWrapPayload,
    isSetZoomPayload,
    LockCellPayload,
    MergePayload,
    MoveSheetPayload,
    RemoveColPayload,
    RemoveRowPayload,
    RemoveSheetPayload,
    RenameSheetPayload,
    SetBackColorPayload,
    SetBorderPayload,
    SetCellOverflowPayload,
    SetColCountPayload,
    SetColWidthPayload,
    SetFontBoldPayload,
    SetFontColorPayload,
    SetFontFamilyPayload,
    SetFontItalicPayload,
    SetFontPayload,
    SetFontSizePayload,
    SetFormatPayload,
    SetFormulaPayload,
    SetHorizontalAlignPayload,
    SetIndentPayload,
    SetRowCountPayload,
    SetRowHeightPayload,
    SetUnderlinePayload,
    SetValuePayload,
    SetVerticalAlignPayload,
    SetWordWrapPayload,
    SetZoomPayload,
    SpreadsheetPayload,
} from '@logi/src/lib/spreadsheet/payloads'

import {BORDERS, HORIZONTALS, UNDERLINES, VERTICALS} from './map'
import {FontBuilder, parseFont, stringifyFont} from './parse_font'

type Workbook = GC.Spread.Sheets.Workbook
type Worksheet = GC.Spread.Sheets.Worksheet

export function executeSpreadjsCommand(
    workbook: Workbook,
    payloads: readonly SpreadsheetPayload[],
): void {
    const cm = workbook.commandManager()
    const sheetNames = new Set<string>()
    payloads.forEach(p => {
        sheetNames.add(p.sheet)
    })
    payloads.forEach(p => {
        if (isAddSheetPayload(p) || isRemoveSheetPayload(p) ||
            isMoveSheetPayload(p))
            sheetNames.delete(p.sheet)
    })
    cm.register('executePayloads', COMMAND)
    cm.execute({
        cmd: 'executePayloads',
        payloads,
        sheetName: Array.from(sheetNames),
    })
}

interface Option {
    readonly payloads: readonly SpreadsheetPayload[]
    // tslint:disable-next-line: readonly-keyword
    sheetName: readonly string[]
}

const COMMAND = {
    canUndo: true,
    execute: (workbook: Workbook, option: Option, isUndo: boolean): boolean => {
        const commands = GC.Spread.Sheets.Commands
        if (isUndo) {
            commands.undoTransaction(workbook, option)
            return true
        }

        // tslint:disable-next-line: no-try
        try {
            commands.startTransaction(workbook, option)
            workbook.suspendCalcService()
            workbook.suspendEvent()
            workbook.suspendPaint()

            executePayloads(workbook, option.payloads)

            workbook.resumeCalcService()
            workbook.resumePaint()
            workbook.resumeEvent()
            commands.endTransaction(workbook, option)
        // tslint:disable-next-line: no-empty
        } catch {}

        return true
    },
}

function executePayloads(
    workbook: Workbook,
    payloads: readonly SpreadsheetPayload[],
): void {
    // tslint:disable-next-line: max-func-body-length  cyclomatic-complexity
    payloads.forEach((p: SpreadsheetPayload): void => {
        if (isAddSheetPayload(p))
            addSheet(p, workbook)
        else if (isMoveSheetPayload(p))
            moveSheet(p, workbook)
        else if (isRenameSheetPayload(p))
            renameSheet(p, workbook)
        else if (isRemoveSheetPayload(p))
            removeSheet(p, workbook)
        const sheet = workbook.getSheetFromName(p.sheet)
        if (sheet === null)
            return
        if (isAddColPayload(p))
            addCol(p, sheet)
        else if (isAddRowPayload(p))
            addRow(p, sheet)
        else if (isSetBackColorPayload(p))
            setBackColor(p, sheet)
        else if (isSetCellOverflowPayload(p))
            setCellOverflow(p, sheet)
        else if (isClearDataPayload(p))
            clearData(p, sheet)
        else if (isCloneFormatPayload(p))
            cloneFormat(p, sheet)
        else if (isSetColCountPayload(p))
            setColCount(p, sheet)
        else if (isSetColWidthPayload(p))
            setColWidth(p, sheet)
        else if (isSetFontBoldPayload(p))
            setFontBold(p, sheet)
        else if (isSetFontColorPayload(p))
            setFontColor(p, sheet)
        else if (isSetFontFamilyPayload(p))
            setFontFamily(p, sheet)
        else if (isSetFontItalicPayload(p))
            setFontItalic(p, sheet)
        else if (isSetFontSizePayload(p))
            setFontSize(p, sheet)
        else if (isSetHorizontalAlignPayload(p))
            setHorizontalAlign(p, sheet)
        else if (isSetIndentPayload(p))
            setIndent(p, sheet)
        else if (isLockCellPayload(p))
            setLock(p, sheet)
        else if (isMergePayload(p))
            merge(p, sheet)
        else if (isRemoveColPayload(p))
            removeCol(p, sheet)
        else if (isRemoveRowPayload(p))
            removeRow(p, sheet)
        else if (isSetRowCountPayload(p))
            setRowCount(p, sheet)
        else if (isSetRowHeightPayload(p))
            setRowHeight(p, sheet)
        else if (isSetBorderPayload(p))
            setBorder(p, sheet)
        else if (isSetFontPayload(p))
            setFont(p, sheet)
        else if (isSetFormatPayload(p))
            setFormat(p, sheet)
        else if (isSetFormulaPayload(p))
            setFormula(p, sheet)
        else if (isSetValuePayload(p))
            setValue(p, sheet)
        else if (isSetUnderlinePayload(p))
            setUnderline(p, sheet)
        else if (isSetVerticalAlignPayload(p))
            setVerticalAlign(p, sheet)
        else if (isSetWordWrapPayload(p))
            setWordWrap(p, sheet)
        else if (isSetZoomPayload(p))
            setZoom(p, sheet)
    })
}

function addSheet(p: AddSheetPayload, workbook: Workbook): void {
    const sheet = new GC.Spread.Sheets.Worksheet(p.sheet)
    sheet.options.isProtected = true
    sheet.options.protectionOptions.allowEditObjects = true
    sheet.options.protectionOptions.allowResizeColumns = true
    // tslint:disable: no-magic-numbers
    sheet.defaults.rowHeight = 23.2
    sheet.defaults.colWidth = 28.25
    const defaultStyle = new GC.Spread.Sheets.Style()
    defaultStyle.font = '12pt Calibri'
    const vAlign = Vertical.V_BOTTOM
    defaultStyle.vAlign = VERTICAL_MAP.get(vAlign)
    sheet.setDefaultStyle(defaultStyle)
    sheet.options.gridline.showHorizontalGridline = false
    sheet.options.gridline.showVerticalGridline = false
    workbook.addSheet(p.position, sheet)
}

function moveSheet(p: MoveSheetPayload, workbook: Workbook): void {
    const oldPos = workbook.getSheetIndex(p.sheet)
    const sheet = workbook.getSheet(oldPos)
    workbook.sheets.splice(oldPos, 1)
    workbook.sheets.splice(p.newPos, 0, sheet)
    /**
     * The active index doesn't changed and will cause some strange bug
     * such as two canvas in frontend.
     */
    const activeSheet = workbook.getActiveSheet()?.name()
    if (activeSheet === p.sheet)
        workbook.setActiveSheetIndex(p.newPos)
}

function renameSheet(p: RenameSheetPayload, workbook: Workbook): void {
    const sheet = workbook.getSheetFromName(p.sheet)
    if (sheet === null)
        return
    sheet.name(p.newName)
}

function removeSheet(p: RemoveSheetPayload, workbook: Workbook): void {
    const pos = workbook.getSheetIndex(p.sheet)
    workbook.removeSheet(pos)
}

function addCol(p: AddColPayload, sheet: Worksheet): void {
    sheet.addColumns(p.col, p.count)
}

function addRow(p: AddRowPayload, sheet: Worksheet): void {
    sheet.addRows(p.row, p.count)
}

function setBackColor(p: SetBackColorPayload, sheet: Worksheet): void {
    const range = getCellRange(sheet, p.range)
    range.backColor(p.color)
}

function getBorderOption(
    p: BorderPosition,
): GC.Spread.Sheets.ISetBorderOptions {
    return {
        all: p === BorderPosition.ALL,
        bottom: p === BorderPosition.BOTTOM,
        diagonalDown: p === BorderPosition.DIAGONAL_DOWN,
        diagonalUp: p === BorderPosition.DIAGONAL_UP,
        innerHorizontal: p === BorderPosition.INNER_HORIZONTAL,
        innerVertical: p === BorderPosition.INNER_VERTICAL,
        inside: p === BorderPosition.INSIDE,
        left: p === BorderPosition.LEFT,
        outline: p === BorderPosition.OUTLINE,
        right: p === BorderPosition.RIGHT,
        top: p === BorderPosition.TOP,
    }
}

function setCellOverflow(p: SetCellOverflowPayload, sheet: Worksheet): void {
    sheet.options.allowCellOverflow = p.allow
}

function clearData(p: ClearDataPayload, sheet: Worksheet): void {
    const range = p.range
    sheet.clear(
        range.row,
        range.col,
        range.rowCount,
        range.colCount,
        GC.Spread.Sheets.SheetArea.viewport,
        // tslint:disable-next-line: no-magic-numbers
        511,
    )
}

function cloneFormat(p: CloneFormatPayload, sheet: Worksheet): void {
    const options = GC.Spread.Sheets.CopyToOptions
    sheet.copyTo(
        p.source.row,
        p.source.col,
        p.target.row,
        p.target.col,
        p.target.rowCount,
        p.target.colCount,
        options.style | options.span,
    )
}

function setColCount(p: SetColCountPayload, sheet: Worksheet): void {
    sheet.setColumnCount(p.count)
}

function setColWidth(p: SetColWidthPayload, sheet: Worksheet): void {
    sheet.setColumnWidth(p.col, p.width)
}

function setFontBold(p: SetFontBoldPayload, sheet: Worksheet): void {
    const range = p.range
    for (let i = 0; i < range.rowCount; i += 1)
        for (let k = 0; k < range.colCount; k += 1) {
            const cell = sheet.getCell(range.row + i, range.col + k)
            const font = parseFont(cell.font())
            const newFont = new FontBuilder(font).bold(p.bold).build()
            cell.font(stringifyFont(newFont))
        }
}

function setFontColor(p: SetFontColorPayload, sheet: Worksheet): void {
    const range = getCellRange(sheet, p.range)
    range.foreColor(p.color)
}

function setFontFamily(p: SetFontFamilyPayload, sheet: Worksheet): void {
    const range = p.range
    for (let i = 0; i < range.rowCount; i += 1)
        for (let k = 0; k < range.colCount; k += 1) {
            const cell = sheet.getCell(range.row + i, range.col + k)
            const font = parseFont(cell.font())
            const newFont = new FontBuilder(font).family(p.family).build()
            cell.font(stringifyFont(newFont))
        }
}

function setFontItalic(p: SetFontItalicPayload, sheet: Worksheet): void {
    const range = p.range
    for (let i = 0; i < range.rowCount; i += 1)
        for (let k = 0; k < range.colCount; k += 1) {
            const cell = sheet.getCell(range.row + i, range.col + k)
            const font = parseFont(cell.font())
            const newFont = new FontBuilder(font).italic(p.italic).build()
            cell.font(stringifyFont(newFont))
        }
}

function setFontSize(p: SetFontSizePayload, sheet: Worksheet): void {
    const range = p.range
    for (let i = 0; i < range.rowCount; i += 1)
        for (let k = 0; k < range.colCount; k += 1) {
            const cell = sheet.getCell(range.row + i, range.col + k)
            const font = parseFont(cell.font())
            const newFont = new FontBuilder(font).size(`${p.size}pt`).build()
            cell.font(stringifyFont(newFont))
        }
}

function setHorizontalAlign(
    p: SetHorizontalAlignPayload,
    sheet: Worksheet,
): void {
    const range = getCellRange(sheet, p.range)
    range.hAlign(HORIZONTAL_MAP.get(p.horizontalAlign))
}

function setIndent(p: SetIndentPayload, sheet: Worksheet): void {
    const range = getCellRange(sheet, p.range)
    range.textIndent(p.indent)
}

function setLock(p: LockCellPayload, sheet: Worksheet): void {
    const range = getCellRange(sheet, p.range)
    range.locked(p.lock)
}

function merge(p: MergePayload, sheet: Worksheet): void {
    const range = p.range
    if (p.merge)
        sheet.addSpan(range.row, range.col, range.rowCount, range.colCount)
    else
        sheet.removeSpan(range.row, range.col)
}

function removeCol(p: RemoveColPayload, sheet: Worksheet): void {
    sheet.deleteColumns(p.col, p.count)
}

function removeRow(p: RemoveRowPayload, sheet: Worksheet): void {
    sheet.deleteRows(p.row, p.count)
}

function setRowCount(p: SetRowCountPayload, sheet: Worksheet): void {
    sheet.setRowCount(p.count)
}

function setRowHeight(p: SetRowHeightPayload, sheet: Worksheet): void {
    sheet.setRowHeight(p.rol, p.height)
}

function setBorder(p: SetBorderPayload, sheet: Worksheet): void {
    const range = getCellRange(sheet, p.range)
    const lineBorder = new GC.Spread.Sheets.LineBorder(
        p.color,
        BORDER_MAP.get(p.line),
    )
    range.setBorder(lineBorder, getBorderOption(p.position))
}

function setFont(p: SetFontPayload, sheet: Worksheet): void {
    const range = getCellRange(sheet, p.range)
    const font = new FontBuilder()
        .bold(p.bold)
        .italic(p.italic)
        .size(`${p.size.toString()}pt`)
        .family(p.family)
        .build()
    range.font(stringifyFont(font))
}

function setFormat(p: SetFormatPayload, sheet: Worksheet): void {
    const range = getCellRange(sheet, p.range)
    range.formatter(p.format)
}

function setFormula(p: SetFormulaPayload, sheet: Worksheet): void {
    const range = getCellRange(sheet, p.range)
    // tslint:disable-next-line: no-try
    try {
        range.formula(p.formula)
    // tslint:disable-next-line: no-empty
    } catch {}
}

function setValue(p: SetValuePayload, sheet: Worksheet): void {
    const range = getCellRange(sheet, p.range)
    range.value(p.value)
}

function setUnderline(p: SetUnderlinePayload, sheet: Worksheet): void {
    const range = getCellRange(sheet, p.range)
    range.textDecoration(UNDERLINE_MAP.get(p.underline))
}

function setVerticalAlign(p: SetVerticalAlignPayload, sheet: Worksheet): void {
    const range = getCellRange(sheet, p.range)
    range.vAlign(VERTICAL_MAP.get(p.verticalAlign))
}

function setWordWrap(p: SetWordWrapPayload, sheet: Worksheet): void {
    const range = getCellRange(sheet, p.range)
    range.wordWrap(p.wordWrap)
}

function setZoom(p: SetZoomPayload, sheet: Worksheet): void {
    sheet.zoom(p.zoom)
}

function getCellRange(
    sheet: Worksheet,
    range: CellRange,
): GC.Spread.Sheets.CellRange {
    return sheet.getRange(range.row, range.col, range.rowCount, range.colCount)
}

const BORDER_MAP = new Map< LineType, GC.Spread.Sheets.LineStyle>(BORDERS)
const HORIZONTAL_MAP =
    new Map<Horizontal, GC.Spread.Sheets.HorizontalAlign>(HORIZONTALS)
const VERTICAL_MAP =
    new Map<Vertical, GC.Spread.Sheets.VerticalAlign>(VERTICALS)
const UNDERLINE_MAP =
    new Map<Underline, GC.Spread.Sheets.TextDecorationType>(UNDERLINES)
// tslint:disable-next-line: max-file-line-count
