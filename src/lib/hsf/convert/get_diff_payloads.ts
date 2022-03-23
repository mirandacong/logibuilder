// tslint:disable: limit-indent-for-method-in-class
import {Builder} from '@logi/base/ts/common/builder'
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
import {
    AddRowPayloadBuilder,
    AddSheetPayloadBuilder,
    CellRange,
    CellRangeBuilder,
    ClearDataPayloadBuilder,
    LockCellPayloadBuilder,
    MergePayloadBuilder,
    MoveSheetPayloadBuilder,
    RemoveRowPayloadBuilder,
    RemoveSheetPayloadBuilder,
    RenameSheetPayloadBuilder,
    SetBackColorPayloadBuilder,
    SetColCountPayloadBuilder,
    SetColWidthPayloadBuilder,
    SetFontColorPayloadBuilder,
    SetFontPayloadBuilder,
    SetFormulaPayloadBuilder,
    SetRowCountPayloadBuilder,
    SetRowHeightPayloadBuilder,
    SetValuePayloadBuilder,
    SpreadsheetPayload,
} from '@logi/src/lib/spreadsheet'

import {Cursor} from '../cursor'
import {DEFAULT_OPTIONS} from '../default_options'
import {getRowCount} from '../lib'
import {Options} from '../options'
import {Status} from '../status'

import {getCellStylePayloads, getValuePayloads} from './payload_lib'

export function getConvertDiffPayloads(
    // tslint:disable-next-line: max-params
    book: HsfBook,
    status: Status,
    diff: Diff,
    options = DEFAULT_OPTIONS,
): readonly SpreadsheetPayload[] {
    const converter = new Converter(options)
    return converter.convertDiff(book, status, diff)
}

class Converter {
    public constructor(
        private readonly _options: Options,
    ) {
        this._init()
    }

    // tslint:disable-next-line: max-func-body-length
    public convertDiff(
        // tslint:disable-next-line: max-params
        book: HsfBook,
        status: Status,
        diff: Diff,
    ): readonly SpreadsheetPayload[] {
        this._status = status
        const payloads: SpreadsheetPayload[] = []
        const moveSheet = diff.sheets.filter((sd: SheetDiff): boolean =>
            sd.type === SheetDiffType.MOVE)
        moveSheet.forEach((sd: SheetDiff): void => {
            if (sd.idx === undefined)
                return
            const move = new MoveSheetPayloadBuilder()
                .sheet(sd.name)
                .newPos(sd.idx)
                .build()
            payloads.push(move)
        })
        const adds = diff.getSheetAdd()
        // Add new sheet.
        adds.forEach((add: readonly [string, number]): void => {
            const sheetName = add[0]
            const hsfSheet = book.sheets.find((s: HsfSheet) =>
                s.name === sheetName)
            if (hsfSheet === undefined)
                return
            const addSheet = new AddSheetPayloadBuilder()
                .sheet(sheetName)
                .position(add[1])
                .build()
            payloads.push(addSheet)
            payloads.push(...this._convertSheet(hsfSheet, sheetName, true))
        })
        // Rename sheet.
        book.sheets.forEach((s: HsfSheet): void => {
            const sheetDiff = diff.getSheetDiff(s.uuid)
            if (sheetDiff === undefined || sheetDiff.oldName === undefined ||
                sheetDiff.type !== SheetDiffType.RENAME)
                return
            const rename = new RenameSheetPayloadBuilder()
                .sheet(sheetDiff.oldName)
                .newName(sheetDiff.name)
                .build()
            payloads.push(rename)
        })
        const removeSheet = diff.sheets.filter(s =>
            s.type === SheetDiffType.REMOVE)
        removeSheet.forEach((remove: SheetDiff): void => {
            const p = new RemoveSheetPayloadBuilder().sheet(remove.name).build()
            payloads.push(p)
        })
        // Add or delete rows.
        diff.rowCntChanged
            .filter(r => r.type === DeltaType.REMOVE)
            .sort((a: RowCntChanged, b: RowCntChanged): number =>
                b.row - a.row)
            .forEach((r: RowCntChanged): void => {
                const removeRow = new RemoveRowPayloadBuilder()
                    .sheet(r.sheetName)
                    .row(r.row)
                    .count(r.cnt)
                    .build()
                payloads.push(removeRow)
            })
        diff.rowCntChanged
            .filter(r => r.type === DeltaType.ADD)
            .sort((a: RowCntChanged, b: RowCntChanged): number =>
                a.row - b.row)
            .forEach((r: RowCntChanged): void => {
                const addRow = new AddRowPayloadBuilder()
                    .sheet(r.sheetName)
                    .row(r.row)
                    .count(r.cnt)
                    .build()
                payloads.push(addRow)
            })
        book.sheets.forEach((s: HsfSheet): void => {
            const tableDiffs = diff.getTableDiff(s.name)
            if (tableDiffs.length === 0)
                return
            this._init()
            this._cursor.arrive(s.margin)
            const sheetSize = this._getSheetSize(s)
            const setColCnt = new SetColCountPayloadBuilder()
                .sheet(s.name)
                .count(sheetSize[1])
                .build()
            payloads.push(setColCnt)
            // tslint:disable-next-line: max-func-body-length
            s.data.forEach((t: HsfTable): void => {
                const d = tableDiffs.find((td: TableDiff) =>
                    td.table === t.stub.uuid)
                if (d === undefined) {
                    this._cursor.arriveTable(t)
                    return
                }
                if (d.headerRowsChanged > 0) {
                    const addRow = new AddRowPayloadBuilder()
                        .sheet(s.name)
                        .row(this._cursor.getRow())
                        .count(d.headerRowsChanged)
                        .build()
                    payloads.push(addRow)
                } else if (d.headerRowsChanged < 0) {
                    const removeRow = new RemoveRowPayloadBuilder()
                        .sheet(s.name)
                        .row(this._cursor.getRow())
                        .count(-d.headerRowsChanged)
                        .build()
                    payloads.push(removeRow)
                }
                const size = getTableSize(t)
                const rs = this._cursor.getRow()
                const cs = this._cursor.getCol()
                for (let i = 0; i < size[0] + d.headerRowsChanged; i += 1)
                    for (let k = 0; k < size[1] + d.colsRemoved; k += 1)
                        payloads.push(new MergePayloadBuilder()
                            .sheet(s.name)
                            .range(new CellRangeBuilder()
                                .row(rs + i)
                                .col(cs + k)
                                .build())
                            .merge(false)
                            .build())
                const clearData = new ClearDataPayloadBuilder()
                    .sheet(s.name)
                    .range(new CellRangeBuilder()
                        .row(this._cursor.getRow())
                        .col(this._cursor.getCol())
                        .rowCount(size[0])
                        .colCount(size[1] + d.colsRemoved)
                        .build())
                    .build()
                payloads.push(clearData)
                payloads.push(...this._paintTable(s.name, t, true))
            })
        })
        book.sheets.forEach((s: HsfSheet): void => {
            const rowDiffs = diff.getRowDiff(s.name)
            const valueDiffs = diff.getValueDiff(s.name)
            if (rowDiffs.size === 0 && valueDiffs.size === 0)
                return
            this._init()
            this._cursor.arrive(s.margin)
            // const ws = excel.getSheetFromName(s.name)
            s.data.forEach((t: HsfTable): void => {
                const rs = rowDiffs.get(t.stub.uuid)
                const blocks = t.getBlocks()
                blocks.forEach((b: Block): void => {
                    if (!isHsfRow(b) && valueDiffs.has(b.uuid)) {
                        payloads.push(...this._paintBlock(s.name, b))
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
                    payloads.push(...this._paintBlock(s.name, b))
                    payloads.push(...this._setBlockSize(s.name, b, false))
                    this._cursor.arrive(b)
                    return
                })
            })
        })
        return payloads
    }
    private _columnWidth = this._options.table.minColumnWidth
    private _columnSet = new Set<number>()

    private _cursor = new Cursor(0, 0)

    private _status = new Status()

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
        sheetName: string,
        setSize: boolean,
    ): readonly SpreadsheetPayload[] {
        const payloads: SpreadsheetPayload[] = []
        const size = this._getSheetSize(sheet)
        const rowCount = new SetRowCountPayloadBuilder()
            .sheet(sheetName)
            .count(size[0])
            .build()
        const colCount = new SetColCountPayloadBuilder()
            .sheet(sheetName)
            .count(size[1])
            .build()
        payloads.push(rowCount, colCount)
        this._init()
        payloads.push(...this._paintBlock(sheetName, sheet.margin))
        payloads.push(...this._setBlockSize(sheetName, sheet.margin, false))
        this._cursor.arrive(sheet.margin)
        payloads.push(...this._setTopMargin(sheetName))
        sheet.data.forEach((t: HsfTable): void => {
            payloads.push(...this._paintTable(sheetName, t, setSize))
        })
        this._init()
        return payloads
    }

    private _setTopMargin(sheetName: string): readonly SpreadsheetPayload[] {
        const opt = this._options.topMargin
        const bc = new SetBackColorPayloadBuilder()
            .sheet(sheetName)
            .range(new CellRangeBuilder().row(0).col(-1).build())
            .color(opt.backColor)
            .build()
        const range0 = new CellRangeBuilder().row(0).col(0).build()
        const value = new SetValuePayloadBuilder()
            .sheet(sheetName)
            .range(range0)
            .value(opt.content)
            .build()
        // TODO: Get font option from topMargin option.
        const font = new SetFontPayloadBuilder()
            .sheet(sheetName)
            .range(range0)
            // tslint:disable-next-line: no-magic-numbers
            .size(10)
            .family('Calibri')
            .build()
        return [bc, value, font]
    }

    private _paintTable(
        sheetName: string,
        table: HsfTable,
        setSize: boolean,
    ): readonly SpreadsheetPayload[] {
        const payloads: SpreadsheetPayload[] = []
        const blocks = table.getBlocks()
        blocks.forEach((b: Block): void => {
            payloads.push(...this._paintBlock(sheetName, b))
            if (setSize)
                payloads.push(...this._setBlockSize(sheetName, b, false))
            this._cursor.arrive(b)
        })
        return payloads
    }

    // tslint:disable-next-line: max-func-body-length
    private _setBlockSize(
        sheet: string,
        b: Block,
        calc: boolean,
    ): readonly SpreadsheetPayload[] {
        const payloads: SpreadsheetPayload[] = []
        if (isHsfRow(b) && calc) {
            // const ranges = this._cursor.getAddress(b)
            // for (let idx = 0; idx < b.dataCells.length; idx += 1) {
            //     const address = ranges[idx + 1]
            //     const ec = getCellRange(sheet, address)
            //     const style = sheet.getStyle(address.row, address.col)
            //     const autoWidth = GC.Spread.Sheets.CellTypes.Base.prototype
            //         .getAutoFitWidth(ec.value(), ec.text(), style, 1, ec)
            //     const padding = 20
            //     if (autoWidth > this._columnWidth + padding)
            //         this._columnWidth = autoWidth + padding
            // }
        }
        switch (b.type) {
        case BlockType.LEFT_MARGIN:
            for (let i = 0; i < b.area.col; i += 1) {
                const marginWidth = this._options.sheet.marginColWidth
                payloads.push(new SetColWidthPayloadBuilder()
                    .sheet(sheet)
                    .col(i)
                    .width(marginWidth)
                    .build())
            }
            break
        case BlockType.TABLE:
            const width = this._options.table.stubWidth
            payloads.push(new SetColWidthPayloadBuilder()
                .sheet(sheet)
                .col(this._cursor.getCol())
                .width(width)
                .build())
            break
        case BlockType.COLUMN:
            const rowHeight = this._options.table.rowHeight
            this._columnSet.add(this._cursor.getCol())
            payloads.push(new SetRowHeightPayloadBuilder()
                .sheet(sheet)
                .rol(this._cursor.getRow())
                .height(rowHeight)
                .build())
            break
        case BlockType.COLUMN_BLOCK:
            const tableHeight = this._options.table.rowHeight
            payloads.push(new SetRowHeightPayloadBuilder()
                .sheet(sheet)
                .rol(this._cursor.getRow())
                .height(tableHeight)
                .build())
            break
        case BlockType.ROW:
            const h = this._options.table.rowHeight
            payloads.push(new SetRowHeightPayloadBuilder()
                .sheet(sheet)
                .rol(this._cursor.getRow())
                .height(h)
                .build())
            break
        case BlockType.TITLE:
            const titleHeight = this._options.title.rowHeight
            payloads.push(new SetRowHeightPayloadBuilder()
                .sheet(sheet)
                .rol(this._cursor.getRow())
                .height(titleHeight)
                .build())
            break
        case BlockType.TABLE_END:
            this._columnSet.forEach((n: number): void => {
                payloads.push(new SetColWidthPayloadBuilder()
                    .sheet(sheet)
                    .col(n)
                    .width(this._columnWidth)
                    .build())
            })
            break
        default:
        }
        return payloads
    }

    // tslint:disable-next-line: max-func-body-length
    private _paintBlock(
        sheet: string,
        b: Block,
    ): readonly SpreadsheetPayload[] {
        const payloads: SpreadsheetPayload[] = []
        const ranges = this._cursor.getAddress(b)
        if (b.merge && ranges.length === 1) {
            const merge = new MergePayloadBuilder()
                .sheet(sheet)
                .range(new CellRangeBuilder()
                    .row(ranges[0].row)
                    .col(ranges[0].col)
                    .rowCount(b.area.row)
                    .colCount(b.area.col)
                    .build())
                .merge(true)
                .build()
            payloads.push(merge)
        }
        if (ranges.length === 0)
            return payloads
        payloads.push(...setNameCellLocked(b, sheet, ranges[0]))
        if (isHsfRow(b)) {
            const baseStyle = this._options
                .getBaseStyle(b.nameCell.baseStyle, b.depth)
            const nameCellStyle = this._options
                .updateStyle(baseStyle, b.nameCell.tags, b.modifier, false)
            const rowRange = getCellRange(ranges[0])
            payloads.push(...getCellStylePayloads(
                sheet,
                rowRange,
                nameCellStyle,
            ))
            if (b.nameCell.value !== undefined)
                payloads.push(...getValuePayloads(
                    sheet,
                    rowRange,
                    b.nameCell.value,
                ))
            b.dataCells.forEach((c: DataCell, idx: number): void => {
                const range = getCellRange(ranges[idx + 1])
                payloads.push(new ClearDataPayloadBuilder()
                    .sheet(sheet)
                    .range(range)
                    .build())
                const unlocked = c.tags.find(t =>
                    t === StyleTag.ASSUMPTION || t === StyleTag.FACT)
                payloads.push(new LockCellPayloadBuilder()
                    .sheet(sheet)
                    .range(range)
                    .lock(unlocked === undefined)
                    .build())
                const base = this._options.getBaseStyle(c.baseStyle)
                const style = this._options
                    .updateStyle(base, c.tags, b.modifier, true)
                payloads.push(...getCellStylePayloads(sheet, range, style))
                const findSeparator = c.tags
                    .find(t => t === StyleTag.ROW_SEPARATOR ||
                        t === StyleTag.COL_SEPARATOR)
                if (findSeparator !== undefined)
                    return
                payloads.push(...this._setFormulaAndValue(sheet, range, c))
            })
            return payloads
        }
        if (isHsfTitle(b)) {
            const base = this._options.getBaseStyle(b.cells[0].baseStyle)
            const s = this._options.title.update(base, b.depth)
            const style = this._options.updateStyle(s, b.cells[0].tags)
            const range = getCellRange(ranges[0])
            payloads.push(...getCellStylePayloads(sheet, range, style))
            const value = b.cells[0].value
            if (value !== undefined)
                payloads.push(...getValuePayloads(sheet, range, value))
            return payloads
        }
        ranges.forEach((address: Address, idx: number): void => {
            const range = getCellRange(address)
            const base = this._options.getBaseStyle(b.cells[idx].baseStyle)
            const style = this._options.updateStyle(base, b.cells[idx].tags)
            if (!b.merge)
                payloads.push(...getCellStylePayloads(sheet, range, style))
            else
                /**
                 * Set style for every cells beacause spreadjs only set border
                 * of the first cell for merged cells.
                 */
                for (let i = 0; i < b.area.row; i += 1)
                    for (let k = 0; k < b.area.col; k += 1) {
                        const r = new AddressBuilder()
                            .sheetName(address.sheetName)
                            .row(address.row + i)
                            .col(address.col + k)
                            .build()
                        const c = getCellRange(r)
                        payloads.push(...getCellStylePayloads(sheet, c, style))
                    }
            const value = b.cells[idx].value
            if (value !== undefined)
                payloads.push(...getValuePayloads(sheet, range, value))
        })
        return payloads
    }

    private _setFormulaAndValue(
        sheet: string,
        range: CellRange,
        dc: DataCell,
    ): readonly SpreadsheetPayload[] {
        /**
         * The custom formula has the highest priority.
         */
        if (dc.customFormula !== '')
            return [new SetFormulaPayloadBuilder()
                .sheet(sheet)
                .range(range)
                .formula(dc.customFormula)
                .build()]
        /**
         * The assumption and fact sources has a higher priority than formula.
         */
        const valueTags = [StyleTag.ASSUMPTION, StyleTag.FACT]
        if (dc.value !== undefined &&
            dc.tags.find(t => valueTags.includes(t)) !== undefined)
            return this._setCellValue(sheet, range, dc.value)

        const formula = this._getFormula(dc)
        if (formula !== undefined) {
            const payloads: SpreadsheetPayload[] = []
            payloads.push(new SetFormulaPayloadBuilder()
                .sheet(sheet)
                .range(range)
                .formula(formula.formula)
                .build())
            if (formula.otherSheet)
                payloads.push(new SetFontColorPayloadBuilder()
                    .sheet(sheet)
                    .range(range)
                    .color(`#${this._options.cell.diffSheetFontColor
                        // tslint:disable-next-line: no-magic-numbers
                        .slice(2)
                        .toLowerCase()}`)
                    .build())
            if (formula.direct)
                payloads.push(new SetFontColorPayloadBuilder()
                    .sheet(sheet)
                    .range(range)
                    .color(`#${this._options.cell.directFormalu
                        // tslint:disable-next-line: no-magic-numbers
                        .slice(2)
                        .toLowerCase()}`)
                    .build())
            return payloads
        }
        if (dc.value !== undefined)
            return this._setCellValue(sheet, range, dc.value)
        return []
    }

    private _getFormula(dc: DataCell): FormulaResult | undefined {
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
        const formula = `${op.excelFormula(...inNodes)}`
        if (formula === '')
            return
        const direct = op.optype === OpType.ATOMIC && op.name === 'id'
        return new FormulaResultBuilder()
            .formula(formula)
            .otherSheet(otherSheet)
            .direct(direct)
            .build()
    }

    private _setCellValue(
        sheet: string,
        range: CellRange,
        value: Value,
    ): readonly SpreadsheetPayload[] {
        const payloads: SpreadsheetPayload[] = []
        payloads.push(...getValuePayloads(sheet, range, value))
        let color: string
        switch (value.sourceType) {
        case ValueSourceType.DATABASE:
            color = this._options.cell.databaseSource
            break
        case ValueSourceType.MANUAL:
        default:
            color = this._options.cell.manualSource
        }
        const fontColor = new SetFontColorPayloadBuilder()
            .sheet(sheet)
            .range(range)
            // tslint:disable-next-line: no-magic-numbers
            .color(`#${color.slice(2).toLowerCase()}`)
            .build()
        payloads.push(fontColor)
        return payloads
    }
}

function getCellRange(address: Address): CellRange {
    return new CellRangeBuilder().row(address.row).col(address.col).build()
}

function getTableSize(table: HsfTable): readonly [number, number] {
    const rows = getRowCount(table.getBlocks())
    const cols = table.data.leafCols.length + 1
    return [rows, cols]
}

function setNameCellLocked(
    block: Block,
    sheet: string,
    address: Address,
): readonly SpreadsheetPayload[] {
    switch (block.type) {
    case BlockType.COLUMN:
    case BlockType.COLUMN_BLOCK:
    case BlockType.ROW:
    case BlockType.ROW_BLOCK:
    case BlockType.TITLE:
    case BlockType.TABLE_NAME:
        const range = getCellRange(address)
        const lock = new LockCellPayloadBuilder()
            .sheet(sheet)
            .range(range)
            .lock(true)
            .build()
        return [lock]
    default:
        return []
    }
}

interface FormulaResult {
    readonly formula: string
    readonly otherSheet: boolean
    readonly direct: boolean
}

class FormulaResultImpl implements FormulaResult {
    public formula!: string
    public otherSheet = false
    public direct = false
}

export class FormulaResultBuilder
    extends Builder<FormulaResult, FormulaResultImpl> {
    public constructor(obj?: Readonly<FormulaResult>) {
        const impl = new FormulaResultImpl()
        if (obj)
            FormulaResultBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public formula(formula: string): this {
        this.getImpl().formula = formula
        return this
    }

    public otherSheet(otherSheet: boolean): this {
        this.getImpl().otherSheet = otherSheet
        return this
    }

    public direct(direct: boolean): this {
        this.getImpl().direct = direct
        return this
    }

    protected get daa(): readonly string[] {
        return FormulaResultBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'formula',
        'otherSheet',
        'direct',
    ]
}
// tslint:disable-next-line: max-file-line-count
