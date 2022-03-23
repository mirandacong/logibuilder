// tslint:disable: limit-indent-for-method-in-class
// tslint:disable-next-line: no-import-side-effect
import '@logi/base/ts/spreadjs/spreadjs_init'

// tslint:disable-next-line: no-wildcard-import ordered-imports
import * as GC from '@grapecity/spread-sheets'
import {Address, AddressBuilder} from '@logi/base/ts/common/excel'
import {toA1notation} from '@logi/base/ts/common/index_notation'
import {OpType} from '@logi/src/lib/compute/op'
import {
    Block,
    BlockType,
    Book as HsfBook,
    DataCell,
    isRow as isHsfRow,
    isTitle as isHsfTitle,
    Sheet as HsfSheet,
    StyleTag,
    Table as HsfTable,
    Value,
    ValueSourceType,
} from '@logi/src/lib/hsf/defs'
import {
    DeltaType,
    Diff,
    RowCntChanged,
    RowRepaint,
    SheetDiff,
    SheetDiffType,
    TableDiff,
} from '@logi/src/lib/hsf/diff'
import {Cursor} from '../cursor'
import {CustomSheet} from '../custom'
import {DEFAULT_OPTIONS} from '../default_options'
import {getCellId, getRowCount} from '../lib'
import {Options} from '../options'
import {Status} from '../status'
import {CoverData, getCoverSheet} from './cover'

import {getSpreadVertAlign, setCellStyle, setValue} from './lib'

type ExcelBook = GC.Spread.Sheets.Workbook
type ExcelSheet = GC.Spread.Sheets.Worksheet

type ExcelStyle = GC.Spread.Sheets.Style

/**
 * Convert the hsf book and the custom sheets to an excel book.
 */
export function convertToExcel(
    // tslint:disable-next-line: max-params
    book: HsfBook,
    workbook = new GC.Spread.Sheets.Workbook(),
    customSheets: readonly CustomSheet[] = [],
    styles: readonly ExcelStyle[] = [],
    options = DEFAULT_OPTIONS,
): ExcelBook {
    const converter = new Converter(options)
    converter.convert(book, workbook, customSheets, styles)
    return workbook
}

/**
 * Only convert the sheets in logi.
 */
export function convertLogi(
    book: HsfBook,
    workbook = new GC.Spread.Sheets.Workbook(),
    options = DEFAULT_OPTIONS,
): ExcelBook {
    const converter = new Converter(options)
    return converter.convertLogi(book, workbook)
}

export function convertDiff(
    // tslint:disable-next-line: max-params
    book: HsfBook,
    status: Status,
    excel: ExcelBook,
    diff: Diff,
    options = DEFAULT_OPTIONS,
): ExcelBook | void {
    const converter = new Converter(options)
    return converter.convertDiff(book, excel, status, diff)
}

/**
 * Return a mock workbook and add the cover to it.
 */
export function getDownloadExcel(
    excel: ExcelBook,
    data?: CoverData,
    mid?: string,
): GC.Spread.Sheets.Workbook {
    const book = new GC.Spread.Sheets.Workbook()
    book.suspendCalcService(false)
    book.suspendPaint()
    book.clearSheets()
    // tslint:disable-next-line: no-try
    try {
        book.fromJSON(excel.toJSON(), {doNotRecalculateAfterLoad: true})
    // tslint:disable-next-line: no-empty
    } catch {}
    /**
     * Frontend workbook display is different with download workbook.
     */
    book.options.tabStripVisible = true
    book.resumeCalcService(true)
    book.resumePaint()
    if (data === undefined || mid === undefined)
        return book
    const cover = getCoverSheet(data, mid)
    book.addSheet(0, cover)
    return book
}

class Converter {
    public constructor(
        private readonly _options: Options,
    ) {
        this._init()
    }

    // tslint:disable-next-line: max-func-body-length
    public convert(
        // tslint:disable-next-line: max-params
        book: HsfBook,
        workbook: ExcelBook,
        customSheets: readonly CustomSheet[],
        styles: readonly ExcelStyle[],
    ): void {
        /**
         * Clear workbook.
         */
        this._status = this._getStatus(book)
        workbook.suspendCalcService(false)
        workbook.suspendEvent()
        workbook.suspendPaint()
        // tslint:disable-next-line: no-magic-numbers
        workbook.options.iterativeCalculationMaximumIterations = 100
        workbook.options.defaultDragFillType =
            GC.Spread.Sheets.Fill.AutoFillType.fillWithoutFormatting
        workbook.clearSheets()
        workbook.getNamedStyles().forEach((s: ExcelStyle): void => {
            if (s.name !== undefined)
                workbook.removeNamedStyle(s.name)
        })
        const sheets: ExcelSheet[] = []
        /**
         * Build empty logi sheets from hsf book.
         */
        book.sheets.forEach((s: HsfSheet, idx: number): void => {
            const excelSheet = newExcelSheet(s.name)
            workbook.addSheet(idx, excelSheet)
            sheets.push(excelSheet)
        })
        styles.forEach((s: ExcelStyle): void => {
            workbook.addNamedStyle(s)
        })
        /**
         * Add custom sheets.
         */
        customSheets.forEach((c: CustomSheet): void => {
            /**
             * custom sheet do not need to be protected.
             */
            const sheet = new GC.Spread.Sheets.Worksheet(c.name)
            workbook.addSheet(c.index, sheet)
            sheet.setRowCount(c.rowCount)
            sheet.setColumnCount(c.colCount)
        })
        customSheets.forEach((c: CustomSheet): void => {
            const sheet = workbook.getSheetFromName(c.name)
            // tslint:disable-next-line: no-try
            try {
                sheet.fromJSON(c.content)
            // tslint:disable-next-line: no-empty
            } catch {}
        })
        /**
         * Set data and styles to logi sheets.
         */
        book.sheets.forEach((s: HsfSheet): void => {
            const excelSheet = workbook.getSheetFromName(s.name)
            this._convertSheet(s, excelSheet, false)
        })
        workbook.resumeCalcService(true)
        book.sheets.forEach((s: HsfSheet, idx: number): void => {
            this._setBlockSize(sheets[idx], s.margin, true)
            this._cursor.arrive(s.margin)
            s.data.forEach((t: HsfTable): void => {
                t.getBlocks().forEach((v: Block): void => {
                    this._setBlockSize(sheets[idx], v, true)
                    this._cursor.arrive(v)
                })
            })
            this._init()
        })
        workbook.resumeEvent()
        workbook.resumePaint()
    }

    public convertLogi(
        book: HsfBook,
        workbook: ExcelBook,
        status?: Status,
    ): ExcelBook {
        this._status = status ?? this._getStatus(book)
        workbook.suspendCalcService(false)
        workbook.suspendEvent()
        workbook.suspendPaint()
        /**
         * Reset the logi sheets.
         */
        book.sheets.forEach((s: HsfSheet, idx: number): void => {
            const sheet = workbook.getSheetFromName(s.name)
            if (sheet !== null) {
                const options = JSON.stringify(sheet.options)
                sheet.reset()
                // tslint:disable-next-line: no-type-assertion
                sheet.options = JSON.parse(options) as
                    GC.Spread.Sheets.IWorksheetOptions
                return
            }
            const excelSheet = newExcelSheet(s.name)
            workbook.addSheet(idx, excelSheet)
        })
        /**
         * Set data and styles to the logi sheets.
         */
        book.sheets.forEach((s: HsfSheet): void => {
            const excelSheet = workbook.getSheetFromName(s.name)
            this._convertSheet(s, excelSheet, false)
        })
        workbook.resumeCalcService(true)
        book.sheets.forEach((s: HsfSheet): void => {
            const sheet = workbook.getSheetFromName(s.name)
            this._setBlockSize(sheet, s.margin, true)
            this._cursor.arrive(s.margin)
            s.data.forEach((t: HsfTable): void => {
                t.getBlocks().forEach((v: Block): void => {
                    this._setBlockSize(sheet, v, true)
                    this._cursor.arrive(v)
                })
            })
            this._init()
        })
        workbook.resumeEvent()
        workbook.resumePaint()
        this._status = new Status()
        return workbook
    }

    // tslint:disable-next-line: max-func-body-length
    public convertDiff(
        // tslint:disable-next-line: max-params
        book: HsfBook,
        excel: ExcelBook,
        status: Status,
        diff: Diff,
    ): ExcelBook | void {
        this._status = status
        excel.suspendCalcService(false)
        excel.suspendPaint()
        excel.suspendEvent()
        const moveSheet = diff.sheets.filter((sd: SheetDiff): boolean =>
            sd.type === SheetDiffType.MOVE)
        moveSheet.forEach((sd: SheetDiff): void => {
            if (sd.idx === undefined)
                return
            const activeSheet = excel.getActiveSheet()?.name()
            const sheet = excel.getSheetFromName(sd.name)
            const sheetIdx = excel.getSheetIndex(sd.name)
            excel.sheets.splice(sheetIdx, 1)
            excel.sheets.splice(sd.idx, 0, sheet)
            /**
             * The active index doesn't changed and will cause some strange bug
             * such as two canvas in frontend.
             */
            if (activeSheet === sd.name)
                excel.setActiveSheetIndex(sd.idx)
        })
        const adds = diff.getSheetAdd()
        // excel.sheets.forEach(s => s.suspendCalcService(false))
        // Add new sheet.
        adds.forEach((add: readonly [string, number]): void => {
            const sheet = newExcelSheet(add[0])
            excel.addSheet(add[1], sheet)
            const hsfSheet = book.sheets.find((s: HsfSheet) =>
                s.name === add[0])
            if (hsfSheet === undefined)
                return
            this._convertSheet(hsfSheet, sheet, true)
        })
        // Rename sheet.
        book.sheets.forEach((s: HsfSheet): void => {
            const sheetDiff = diff.getSheetDiff(s.uuid)
            if (sheetDiff === undefined || sheetDiff.oldName === undefined ||
                sheetDiff.type !== SheetDiffType.RENAME)
                return
            const worksheet = excel.getSheetFromName(sheetDiff.oldName)
            if (worksheet === null)
                return
            worksheet.name(sheetDiff.name)
        })
        const removeSheet = diff.sheets.filter(s =>
            s.type === SheetDiffType.REMOVE)
        removeSheet.forEach((remove: SheetDiff): void => {
            const idx = excel.getSheetIndex(remove.name)
            excel.removeSheet(idx)
        })
        // Add or delete rows.
        diff.rowCntChanged
            .filter(r => r.type === DeltaType.REMOVE)
            .sort((a: RowCntChanged, b: RowCntChanged): number =>
                b.row - a.row)
            .forEach((r: RowCntChanged): void => {
                const s = excel.getSheetFromName(r.sheetName)
                s.deleteRows(r.row, r.cnt)
            })
        diff.rowCntChanged
            .filter(r => r.type === DeltaType.ADD)
            .sort((a: RowCntChanged, b: RowCntChanged): number =>
                a.row - b.row)
            .forEach((r: RowCntChanged): void => {
                const s = excel.getSheetFromName(r.sheetName)
                s.addRows(r.row, r.cnt)
            })
        book.sheets.forEach((s: HsfSheet): void => {
            const tableDiffs = diff.getTableDiff(s.name)
            if (tableDiffs.length === 0)
                return
            this._init()
            this._cursor.arrive(s.margin)
            const ws = excel.getSheetFromName(s.name)
            const sheetSize = this._getSheetSize(s)
            ws.setColumnCount(sheetSize[1])
            s.data.forEach((t: HsfTable): void => {
                const d = tableDiffs.find((td: TableDiff) =>
                    td.table === t.stub.uuid)
                if (d === undefined) {
                    this._cursor.arriveTable(t)
                    return
                }
                if (d.headerRowsChanged > 0)
                    ws.addRows(this._cursor.getRow(), d.headerRowsChanged)
                else if (d.headerRowsChanged < 0)
                    ws.deleteRows(this._cursor.getRow(), -d.headerRowsChanged)
                const size = getTableSize(t)
                const range = new GC.Spread.Sheets.Range(
                    this._cursor.getRow(),
                    this._cursor.getCol(),
                    size[0] + d.headerRowsChanged,
                    size[1] + d.colsRemoved,
                )
                const spans = ws.getSpans(range)
                if (spans.length > 0)
                    spans.forEach((r: GC.Spread.Sheets.Range): void =>
                    ws.removeSpan(r.row, r.col))
                ws.clear(
                    this._cursor.getRow(),
                    this._cursor.getCol(),
                    size[0],
                    size[1] + d.colsRemoved,
                    GC.Spread.Sheets.SheetArea.viewport,
                    // tslint:disable-next-line: no-magic-numbers
                    511,
                )
                this._paintTable(ws, t, true)
                return
            })
        })
        book.sheets.forEach((s: HsfSheet): void => {
            const rowDiffs = diff.getRowDiff(s.name)
            const valueDiffs = diff.getValueDiff(s.name)
            if (rowDiffs.size === 0 && valueDiffs.size === 0)
                return
            this._init()
            this._cursor.arrive(s.margin)
            const ws = excel.getSheetFromName(s.name)
            s.data.forEach((t: HsfTable): void => {
                const rs = rowDiffs.get(t.stub.uuid)
                const blocks = t.getBlocks()
                blocks.forEach((b: Block): void => {
                    if (!isHsfRow(b) && valueDiffs.has(b.uuid)) {
                        this._paintBlock(ws, b)
                        this._cursor.arrive(b)
                        return
                    }
                    if (rs === undefined) {
                        this._cursor.arrive(b)
                        return
                    }
                    const target = rs.find((v: RowRepaint) => v.row === b.uuid)
                    if (target === undefined) {
                        this._cursor.arrive(b)
                        return
                    }
                    this._paintBlock(ws, b)
                    this._setBlockSize(ws, b, false)
                    this._cursor.arrive(b)
                    return
                })
            })
        })
        excel.resumeCalcService(true)
        excel.resumePaint()
        excel.resumeEvent()
        return excel
    }
    private _columnWidth = this._options.table.minColumnWidth
    private _columnSet = new Set<number>()

    private _cursor = new Cursor(0, 0)

    private _status = new Status()

    private _getStatus(hsf: HsfBook): Status {
        const status = new Status()
        hsf.sheets.forEach((s: HsfSheet): void => {
            this._init()
            this._cursor.arrive(s.margin)
            s.data.forEach((t: HsfTable): void => {
                status.addTableData(t.stub.uuid, t.data)
                t.getBlocks().forEach((b: Block): void => {
                    if (!isHsfRow(b)) {
                        this._cursor.arrive(b)
                        return
                    }
                    b.dataCells.forEach((dc: DataCell): void => {
                        const id = getCellId(dc.row, dc.col)
                        status.addDataCell(id, dc)
                    })
                    this._cursor.arrive(b)
                })
            })
        })
        this._init()
        return status
    }

    private _init(): void {
        this._columnWidth = this._options.table.minColumnWidth
        this._columnSet = new Set<number>()
        this._cursor = new Cursor(0, 0)
    }

    private _getSheetSize(sheet: HsfSheet): readonly [number, number] {
        let rows = 0
        let cols = 0
        let lastEnd = 0
        sheet.data.forEach((t: HsfTable, idx: number): void => {
            const size = getTableSize(t)
            rows += size[0]
            if (size[1] > cols)
                cols = size[1]
            if (idx === sheet.data.length - 1)
                lastEnd = t.end.area.row
        })
        const leftMargin = sheet.margin.area.col
        return [
            rows + this._options.sheet.endRowCount - lastEnd,
            cols + this._options.sheet.endColCount + leftMargin,
        ]
    }

    private _convertSheet(
        sheet: HsfSheet,
        excelSheet: ExcelSheet,
        setSize: boolean,
    ): ExcelSheet {
        excelSheet.suspendCalcService((false))
        excelSheet.defaults.rowHeight = this._options.sheet.defaultRowHeight
        excelSheet.defaults.colWidth = this._options.sheet.defaultColWidth
        const defaultStyle = new GC.Spread.Sheets.Style()
        defaultStyle.font = '12pt Calibri'
        const vAlign = this._options.sheet.defaultVertAlign
        defaultStyle.vAlign = getSpreadVertAlign(vAlign)
        excelSheet.setDefaultStyle(defaultStyle)
        const size = this._getSheetSize(sheet)
        excelSheet.setRowCount(size[0])
        excelSheet.setColumnCount(size[1])
        const view = this._options.sheet.view
        excelSheet.options.gridline.showHorizontalGridline =
            view.gridline?.horizontal
        excelSheet.options.gridline.showVerticalGridline =
            view.gridline?.vertical
        excelSheet.frozenColumnCount(view.frozen?.columnCount)
        excelSheet.frozenRowCount(view.frozen?.rowCount)
        this._init()
        this._paintBlock(excelSheet, sheet.margin)
        this._setBlockSize(excelSheet, sheet.margin, false)
        this._cursor.arrive(sheet.margin)
        this._setTopMargin(excelSheet)
        sheet.data.forEach((t: HsfTable): void => {
            this._paintTable(excelSheet, t, setSize)
        })
        this._init()
        excelSheet.resumeCalcService(true)
        return excelSheet
    }

    private _setTopMargin(excelSheet: ExcelSheet): void {
        const opt = this._options.topMargin
        excelSheet.getRange(0, -1).backColor(opt.backColor)
        const cell = excelSheet.getCell(0, 0)
        cell.value(opt.content)
        cell.font(opt.font)
    }

    private _paintTable(
        es: ExcelSheet,
        table: HsfTable,
        setSize: boolean,
    ): void {
        const blocks = table.getBlocks()
        blocks.forEach((b: Block): void => {
            this._paintBlock(es, b)
            if (setSize)
                this._setBlockSize(es, b, false)
            this._cursor.arrive(b)
        })
    }

    // tslint:disable-next-line: max-func-body-length
    private _setBlockSize(sheet: ExcelSheet, b: Block, calc: boolean): void {
        if (isHsfRow(b) && calc) {
            const ranges = this._cursor.getAddress(b)
            for (let idx = 0; idx < b.dataCells.length; idx += 1) {
                const address = ranges[idx + 1]
                const ec = getExcelCell(sheet, address)
                const style = sheet.getStyle(address.row, address.col)
                const autoWidth = GC.Spread.Sheets.CellTypes.Base.prototype
                    .getAutoFitWidth(ec.value(), ec.text(), style, 1, ec)
                const padding = 20
                if (autoWidth > this._columnWidth + padding)
                    this._columnWidth = autoWidth + padding
            }
        }
        switch (b.type) {
        case BlockType.LEFT_MARGIN:
            for (let i = 0; i < b.area.col; i += 1) {
                const marginWidth = this._options.sheet.marginColWidth
                sheet.setColumnWidth(i, marginWidth)
            }
            break
        case BlockType.TABLE:
            const width = this._options.table.stubWidth
            sheet.setColumnWidth(this._cursor.getCol(), width)
            break
        case BlockType.COLUMN:
            const rowHeight = this._options.table.rowHeight
            sheet.setRowHeight(this._cursor.getRow(), rowHeight)
            this._columnSet.add(this._cursor.getCol())
            break
        case BlockType.COLUMN_BLOCK:
            const tableHeight = this._options.table.rowHeight
            sheet.setRowHeight(this._cursor.getRow(), tableHeight)
            break
        case BlockType.ROW:
            const h = this._options.table.rowHeight
            sheet.setRowHeight(this._cursor.getRow(), h)
            break
        case BlockType.TITLE:
            const titleHeight = this._options.title.rowHeight
            sheet.setRowHeight(this._cursor.getRow(), titleHeight)
            break
        case BlockType.TABLE_END:
            this._columnSet.forEach((n: number): void => {
                sheet.setColumnWidth(n, this._columnWidth)
            })
            break
        default:
        }
    }

    // tslint:disable-next-line: max-func-body-length
    private _paintBlock(sheet: ExcelSheet, b: Block): void {
        const ranges = this._cursor.getAddress(b)
        if (b.merge && ranges.length === 1)
            sheet.addSpan(ranges[0].row, ranges[0].col, b.area.row, b.area.col)
        if (ranges.length === 0)
            return
        setNameCellLocked(b, sheet, ranges[0])
        if (isHsfRow(b)) {
            const baseStyle = this._options
                .getBaseStyle(b.nameCell.baseStyle, b.depth)
            const nameCellStyle = this._options
                .updateStyle(baseStyle, b.nameCell.tags, b.modifier, false)
            const cell = getExcelCell(sheet, ranges[0])
            setCellStyle(cell, nameCellStyle)
            if (b.nameCell.value !== undefined)
                setValue(cell, b.nameCell.value)
            b.dataCells.forEach((c: DataCell, idx: number): void => {
                const excelCell = getExcelCell(sheet, ranges[idx + 1])
                const unlocked = c.tags.find(t =>
                    t === StyleTag.ASSUMPTION || t === StyleTag.FACT)
                if (unlocked)
                    excelCell.locked(false)
                if (unlocked === undefined && !excelCell.locked())
                    excelCell.locked(true)
                const base = this._options.getBaseStyle(c.baseStyle)
                const style = this._options
                    .updateStyle(base, c.tags, b.modifier, true)
                if (excelCell.value() !== null)
                    excelCell.clear(GC.Spread.Sheets.StorageType.data)
                setCellStyle(excelCell, style)
                const findSeparator = c.tags
                    .find(t => t === StyleTag.ROW_SEPARATOR ||
                        t === StyleTag.COL_SEPARATOR)
                if (findSeparator !== undefined)
                    return
                if (useFormula(c))
                    this._setFormula(c, excelCell)
                if (c.value !== undefined && excelCell.formula() === null)
                    this._setCellValue(excelCell, c.value)
            })
            return
        }
        if (isHsfTitle(b)) {
            const base = this._options.getBaseStyle(b.cells[0].baseStyle)
            const s = this._options.title.update(base, b.depth)
            const style = this._options.updateStyle(s, b.cells[0].tags)
            const cell = getExcelCell(sheet, ranges[0])
            setCellStyle(cell, style)
            const value = b.cells[0].value
            if (value !== undefined)
                setValue(cell, value)
            return
        }
        ranges.forEach((range: Address, idx: number): void => {
            const cell = getExcelCell(sheet, range)
            const base = this._options.getBaseStyle(b.cells[idx].baseStyle)
            const style = this._options.updateStyle(base, b.cells[idx].tags)
            if (!b.merge)
                setCellStyle(cell, style)
            else
                /**
                 * Set style for every cells beacause spreadjs only set border
                 * of the first cell for merged cells.
                 */
                for (let i = 0; i < b.area.row; i += 1)
                    for (let k = 0; k < b.area.col; k += 1) {
                        const r = new AddressBuilder()
                            .sheetName(range.sheetName)
                            .row(range.row + i)
                            .col(range.col + k)
                            .build()
                        const c = getExcelCell(sheet, r)
                        setCellStyle(c, style)
                    }
            const value = b.cells[idx].value
            if (value !== undefined)
                setValue(cell, value)
        })
    }

    // tslint:disable-next-line: max-func-body-length
    private _setFormula(dc: DataCell, ec: GC.Spread.Sheets.CellRange): void {
        /**
         * The custom formula has the highest priority.
         */
        if (dc.customFormula !== '') {
            // tslint:disable-next-line: no-try
            try {
                ec.formula(dc.customFormula)
            // tslint:disable-next-line: no-empty
            } catch {}
            return
        }
        const otherSheetColor = this._options.cell.diffSheetFontColor
        const formulaInfo = dc.formula
        const currTable = this._status.getTableData(dc.table)
        if (formulaInfo === undefined || currTable === undefined)
            return
        const sheetName = currTable.sheetName
        const inNodes: string[] = []
        let otherSheet = false
        formulaInfo.inNodes.forEach((uuid: string): void => {
            const node = this._status.getDataCell(uuid)
            if (node === undefined)
                return
            const addr = node.getAddress(this._status.getTableDataMap())
            const corrd = `${toA1notation(addr.col)}${addr.row + 1}`
            const nodeTable = this._status.getTableData(node.table)
            if (nodeTable === undefined)
                return
            const name = nodeTable.sheetName
            if (sheetName === name) {
                inNodes.push(corrd)
                return
            }
            otherSheet = true
            if (name.match(/[^\u4E00-\u9FA5\w]/))
                inNodes.push(`'${name}'!${corrd}`)
            else
                inNodes.push(`${name}!${corrd}`)
        })
        const op = formulaInfo.op
        const formula = `=${op.excelFormula(...inNodes)}`
        const f = formula.slice(1) // remove '='.
        // tslint:disable-next-line: no-try
        try {
            ec.formula(f)
        // tslint:disable-next-line: no-empty
        } catch {}
        if (otherSheet)
            // tslint:disable-next-line: no-magic-numbers
            ec.foreColor(`#${otherSheetColor.slice(2).toLowerCase()}`)
        if (op.optype === OpType.ATOMIC && op.name === 'id')
            ec.foreColor(`#${this._options.cell.directFormalu
                // tslint:disable-next-line: no-magic-numbers
                .slice(2)
                .toLowerCase()}`)
    }

    private _setCellValue(ec: GC.Spread.Sheets.CellRange, value: Value): void {
        setValue(ec, value)
        let color: string
        switch (value.sourceType) {
        case ValueSourceType.DATABASE:
            color = this._options.cell.databaseSource
            break
        case ValueSourceType.MANUAL:
        default:
            color = this._options.cell.manualSource
        }
        // tslint:disable-next-line: no-magic-numbers
        ec.foreColor(`#${color.slice(2).toLowerCase()}`)
    }
}

function getExcelCell(
    sheet: ExcelSheet,
    address: Address,
): GC.Spread.Sheets.CellRange {
    return sheet.getCell(address.row, address.col)
}

function getTableSize(table: HsfTable): readonly [number, number] {
    const rows = getRowCount(table.getBlocks())
    const cols = table.data.leafCols.length + 1
    return [rows, cols]
}

function useFormula(dc: DataCell): boolean {
    if (dc.customFormula !== '')
        return true
    if (dc.value === undefined)
        return true
    /**
     * The assumption and fact sources has a higher priority than formula.
     */
    const valueTags = [StyleTag.ASSUMPTION, StyleTag.FACT]
    return dc.tags.every(t => !valueTags.includes(t))
}

function newExcelSheet(name: string): ExcelSheet {
    /**
     * Only specific cell can edit.
     * https://www.grapecity.com/spreadjs/docs/v13/online/celllock.html
     */
    const sheet = new GC.Spread.Sheets.Worksheet(name)
    sheet.options.isProtected = true
    sheet.options.protectionOptions.allowEditObjects = true
    sheet.options.protectionOptions.allowResizeColumns = true
    return sheet
}

function setNameCellLocked(
    block: Block,
    sheet: ExcelSheet,
    address: Address,
): void {
    const cell = getExcelCell(sheet, address)
    switch (block.type) {
    case BlockType.COLUMN:
    case BlockType.COLUMN_BLOCK:
    case BlockType.ROW:
    case BlockType.ROW_BLOCK:
    case BlockType.TITLE:
    case BlockType.TABLE_NAME:
        cell.locked(true)
        break
    default:
    }
}
// tslint:disable-next-line: max-file-line-count
