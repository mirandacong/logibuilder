// tslint:disable-next-line: ter-max-len
// tslint:disable-next-line: no-import-side-effect no-wildcard-import ordered-imports
import * as GC from '@grapecity/spread-sheets'
import {
    CellRange,
    CellRangeBuilder,
    MergePayloadBuilder,
    SetCellOverflowPayloadBuilder,
    SetFormatPayloadBuilder,
    SetIndentPayloadBuilder,
    SetWordWrapPayloadBuilder,
    SpreadsheetPayload,
} from '@logi/src/lib/spreadsheet'

import {ExcelOperator} from './excel_operator'
import {MergeCells, Wrap} from './operate_enum'

import GcSpread = GC.Spread.Sheets

export function setTextIndex(
    sheet: GcSpread.Worksheet,
    cellRange: CellRange,
    decrease: boolean,
): readonly SpreadsheetPayload[] {
    const p: SpreadsheetPayload[] = []
    const endRow = cellRange.row + cellRange.rowCount - 1
    const endCol = cellRange.col + cellRange.colCount - 1
    for (let startRow = cellRange.row; startRow <= endRow;
    startRow += 1)
        for (let startCol = cellRange.col; startCol <= endCol;
        startCol += 1) {
            const cell = sheet.getCell(startRow, startCol)
            const indent = cell.textIndent() > 0 ? cell.textIndent() : 1
            p.push(new SetIndentPayloadBuilder()
                .indent(decrease ? indent - 1 : indent + 1)
                .range(new CellRangeBuilder()
                    .row(startRow)
                    .rowCount(1)
                    .col(startCol)
                    .colCount(1)
                    .build())
                .sheet(sheet.name())
                .build())
        }
    return p
}

export function pointPlace(
    sheet: GcSpread.Worksheet,
    cellRange: CellRange,
    dec: boolean,
): readonly SpreadsheetPayload[] {
    const p: SpreadsheetPayload[] = []
    const formatter = sheet.getFormatter(
        cellRange.row,
        cellRange.col,
        GcSpread.SheetArea.viewport,
    )
    if (!formatter)
        return []
    const format = formatter.split(';')[0]
    let decimal = dec ? format.split('.')[1]?.replace(/[^0]/g, '').length
        : format.split('.')[1]?.replace(/[^0]/g, '').length - 2
    if (decimal === undefined)
        decimal = dec ? 0 : -1
    let newFormat = '#'
    if (decimal >= 0)
        for (let i = 0; i <= decimal; i += 1)
            newFormat = i === 0 ? newFormat + '.0' : newFormat + '0'
    const endRow = cellRange.row + cellRange.rowCount - 1
    const endCol = cellRange.col + cellRange.colCount - 1
    /**
     * Some values of Formatter of this cell should be retained,
     * such as '%' and '￥'
     */
    if (formatter.includes('￥'))
        newFormat = '￥* ' + newFormat
    if (formatter.includes('%'))
        newFormat = newFormat + '%'
    for (let startRow = cellRange.row; startRow <= endRow;
    startRow += 1)
        for (let startCol = cellRange.col; startCol <= endCol;
        startCol += 1)
            p.push(new SetFormatPayloadBuilder()
                .format(newFormat)
                .range(new CellRangeBuilder()
                    .row(startRow)
                    .rowCount(1)
                    .col(startCol)
                    .colCount(1)
                    .build())
                .sheet(sheet.name())
                .build())
    return p
}

// tslint:disable-next-line: max-func-body-length
export function mergeCells(
    sheet: string,
    range: Readonly<CellRange>,
    value: MergeCells,
): readonly SpreadsheetPayload[] {
    const p: SpreadsheetPayload[] = []
    switch (value) {
    case MergeCells.ALL:
        p.push(new MergePayloadBuilder()
            .merge(true)
            .sheet(sheet)
            .range(range)
            .build())
        break
    case MergeCells.HORIZONTALLY:
        for (let i = 0; i < range.rowCount; i += 1)
            p.push(new MergePayloadBuilder()
                .merge(true)
                .sheet(sheet)
                .range(new CellRangeBuilder()
                    .row(range.row + i)
                    .col(range.col)
                    .rowCount(1)
                    .colCount(range.colCount)
                    .build())
                .build())
        break
    case MergeCells.VERTICALLY:
        for (let i = 0; i < range.colCount; i += 1)
            p.push(new MergePayloadBuilder()
                .merge(true)
                .sheet(sheet)
                .range(new CellRangeBuilder()
                    .row(range.row)
                    .col(range.col + i)
                    .rowCount(range.rowCount)
                    .colCount(1)
                    .build())
                .build())
        break
    case MergeCells.CANCEL:
        for (let i = 0; i < range.rowCount; i += 1)
            for (let j = 0; j < range.colCount; j += 1)
                p.push(new MergePayloadBuilder()
                    .sheet(sheet)
                    .merge(false)
                    .range(new CellRangeBuilder()
                        .row(i + range.row)
                        .rowCount(1)
                        .col(j + range.col)
                        .colCount(1)
                        .build())
                    .build())
        break
    default:
    }
    return p
}

export function wrap(
    sheet: string,
    range: CellRange,
    op: ExcelOperator,
): readonly SpreadsheetPayload[] {
    switch (op.value) {
    case Wrap.WRAP:
        return [
            new SetCellOverflowPayloadBuilder()
                .sheet(sheet)
                .allow(true)
                .build(),
            new SetWordWrapPayloadBuilder()
                .range(range)
                .sheet(sheet)
                .wordWrap(false)
                .build(),
        ]
    case Wrap.OVERFLOW:
        return [
            new SetCellOverflowPayloadBuilder()
                .sheet(sheet)
                .allow(true)
                .build(),
            new SetWordWrapPayloadBuilder()
                .range(range)
                .sheet(sheet)
                .wordWrap(true)
                .build(),
        ]
    case Wrap.CLIP:
        return [
            new SetCellOverflowPayloadBuilder()
                .sheet(sheet)
                .allow(false)
                .build(),
            new SetWordWrapPayloadBuilder()
                .range(range)
                .sheet(sheet)
                .wordWrap(false)
                .build(),
        ]
    default:
        return []
    }
}
