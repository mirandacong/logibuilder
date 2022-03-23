import {Injectable} from '@angular/core'
// tslint:disable-next-line: ter-max-len
// tslint:disable-next-line: no-import-side-effect no-wildcard-import ordered-imports
import * as GC from '@grapecity/spread-sheets'
import {LineType, Underline} from '@logi/base/ts/common/excel'
import {Action, CustomSheetActionBuilder} from '@logi/src/lib/api'
import {
    BorderPosition,
    CellRange,
    CellRangeBuilder,
    CloneFormatPayload,
    CloneFormatPayloadBuilder,
    SetBackColorPayloadBuilder,
    SetBorderPayloadBuilder,
    SetFontBoldPayloadBuilder,
    SetFontColorPayloadBuilder,
    SetFontFamilyPayloadBuilder,
    SetFontItalicPayloadBuilder,
    SetFontSizePayloadBuilder,
    SetFormatPayloadBuilder,
    SetHorizontalAlignPayloadBuilder,
    SetUnderlinePayloadBuilder,
    SetVerticalAlignPayloadBuilder,
    SetZoomPayloadBuilder,
    SpreadsheetPayload,
} from '@logi/src/lib/spreadsheet'
import {BehaviorSubject} from 'rxjs'

import {ExcelOperator} from './excel_operator'
import {mergeCells, pointPlace, setTextIndex, wrap} from './formatter_func'
import {FormatterEnum, Operator} from './operate_enum'

import GcSpread = GC.Spread.Sheets

@Injectable()
export class OperateService {
    public setOperator(operator: ExcelOperator): void {
        this._operator$.next(operator)
    }

    public getOperator(): BehaviorSubject<ExcelOperator | undefined> {
        return this._operator$
    }

    public setSelectChanged(): void {
        this._selectChanged$.next()
    }

    public getSelectChanged(): BehaviorSubject<void> {
        return this._selectChanged$
    }

    public setZoomChanged(): void {
        this._zoomChanged$.next()
    }

    public getZoomChanged(): BehaviorSubject<void> {
        return this._zoomChanged$
    }

    public getIsFormatPaint(): boolean {
        return this._isFormatPainting
    }

    public setComponent(component: GcSpread.Workbook): void {
        this._workbook = component
    }

    public getWorkbook(): GcSpread.Workbook {
        return this._workbook
    }

    public getOperatorAction(
        workBook: GcSpread.Workbook,
        op: ExcelOperator,
    ): Action {
        const sheet = workBook.getActiveSheet()
        const sheetName = sheet.name()
        let payloads: SpreadsheetPayload[] = []
        // tslint:disable-next-line: max-func-body-length cyclomatic-complexity
        sheet.getSelections().forEach((selectRange: GcSpread.Range): void => {
            const cellRange = new CellRangeBuilder()
                .row(selectRange.row)
                .col(selectRange.col)
                .rowCount(selectRange.rowCount)
                .colCount(selectRange.colCount)
                .build()
            // tslint:disable-next-line: no-duplicate-case
            switch (op.operator) {
            case Operator.PAINTFORMAT:
                this._paintformat(cellRange)
                break
            case Operator.BACKGROUND_COLOR:
                payloads.push(new SetBackColorPayloadBuilder()
                    .range(cellRange)
                    .sheet(sheetName)
                    .color(String(op.value))
                    .build())
                break
            case Operator.FONT_COLOR:
                payloads.push(new SetFontColorPayloadBuilder()
                    .range(cellRange)
                    .sheet(sheetName)
                    .color(String(op.value))
                    .build())
                break
            case Operator.UNDERLINE:
                payloads.push(new SetUnderlinePayloadBuilder()
                    .range(cellRange)
                    .sheet(sheetName)
                    .underline(op.value ? Underline.SINGLE : Underline.NONE)
                    .build())
                break
            case Operator.STRIKETHROUGH:
                payloads.push(new SetUnderlinePayloadBuilder()
                    .range(cellRange)
                    .sheet(sheetName)
                    .underline(
                        op.value ? Underline.SINGLE_ACCOUNTING : Underline.NONE,
                    )
                    .build())
                break
            case Operator.ZOOM:
                payloads.push(new SetZoomPayloadBuilder()
                    .sheet(sheetName)
                    .zoom(op.value)
                    .build())
                break
            case Operator.BOLD:
                payloads.push(new SetFontBoldPayloadBuilder()
                    .sheet(sheetName)
                    .bold(op.value)
                    .range(cellRange)
                    .build())
                break
            case Operator.ITALIC:
                payloads.push(new SetFontItalicPayloadBuilder()
                    .sheet(sheetName)
                    .italic(op.value)
                    .range(cellRange)
                    .build())
                break
            case Operator.MERGE:
                payloads = payloads
                    .concat(mergeCells(sheetName, cellRange, op.value))
                break
            case Operator.VALIGN:
                payloads.push(new SetVerticalAlignPayloadBuilder()
                    .verticalAlign(op.value)
                    .range(cellRange)
                    .sheet(sheetName)
                    .build())
                break
            case Operator.HALIGN:
                payloads.push(new SetHorizontalAlignPayloadBuilder()
                    .horizontalAlign(op.value)
                    .range(cellRange)
                    .sheet(sheetName)
                    .build())
                break
            case Operator.CONVENTION:
                payloads.push(new SetFormatPayloadBuilder()
                    .range(cellRange)
                    .sheet(sheetName)
                    .format(FormatterEnum.TEXT)
                    .build())
                break
            case Operator.TEXT:
                payloads.push(new SetFormatPayloadBuilder()
                    .range(cellRange)
                    .sheet(sheetName)
                    .format(FormatterEnum.TEXT)
                    .build())
                break
            case Operator.ACCOUNTING:
                payloads.push(new SetFormatPayloadBuilder()
                    .range(cellRange)
                    .sheet(sheetName)
                    .format(FormatterEnum.ACCOUNTING)
                    .build())
                break
            case Operator.NUMBER:
                payloads.push(new SetFormatPayloadBuilder()
                    .range(cellRange)
                    .sheet(sheetName)
                    .format(FormatterEnum.NUMBER)
                    .build())
                break
            case Operator.CURRENCY:
                payloads.push(new SetFormatPayloadBuilder()
                    .range(cellRange)
                    .sheet(sheetName)
                    .format(FormatterEnum.CURRENCY)
                    .build())
                break
            case Operator.PERCENT:
                payloads.push(new SetFormatPayloadBuilder()
                    .range(cellRange)
                    .sheet(sheetName)
                    .format(FormatterEnum.PERCENT)
                    .build())
                break
            case Operator.SEPARATOR:
                payloads.push(new SetFormatPayloadBuilder()
                    .range(cellRange)
                    .sheet(sheetName)
                    .format(FormatterEnum.SEPARATOR)
                    .build())
                break
            case Operator.DATE:
                payloads.push(new SetFormatPayloadBuilder()
                    .range(cellRange)
                    .sheet(sheetName)
                    .format(FormatterEnum.DATE)
                    .build())
                break
            case Operator.TIME:
                payloads.push(new SetFormatPayloadBuilder()
                    .range(cellRange)
                    .sheet(sheetName)
                    .format(FormatterEnum.TIME)
                    .build())
                break
            case Operator.DATE_TIME:
                payloads.push(new SetFormatPayloadBuilder()
                    .range(cellRange)
                    .sheet(sheetName)
                    .format(FormatterEnum.DATE_TIME)
                    .build())
                break
            case Operator.TEXTWRAP:
                payloads = payloads.concat(wrap(sheetName, cellRange, op))
                break
            case Operator.DECREASE:
                payloads = payloads.concat(setTextIndex(sheet, cellRange, true))
                break
            case Operator.INCREASE:
                payloads = payloads
                    .concat(setTextIndex(sheet, cellRange, false))
                break
            case Operator.POINT_INC:
                payloads = payloads.concat(pointPlace(sheet, cellRange, false))
                break
            case Operator.POINT_DEC:
                payloads = payloads.concat(pointPlace(sheet, cellRange, true))
                break
            case Operator.FONT_SIZE:
                payloads.push(new SetFontSizePayloadBuilder()
                    .range(cellRange)
                    .size(op.value)
                    .sheet(sheetName)
                    .build())
                break
            case Operator.FONT_FAMILY:
                payloads.push(new SetFontFamilyPayloadBuilder()
                    .range(cellRange)
                    .family(op.value)
                    .sheet(sheetName)
                    .build())
                break
            case Operator.BORDER_COLOR:
                this._borderColor = op.value
                payloads.push(new SetBorderPayloadBuilder()
                    .color(this._borderColor)
                    .line(this._borderLineType)
                    .position(this._borderPosition)
                    .range(cellRange)
                    .sheet(sheetName)
                    .build())
                break
            case Operator.BORDER:
                this._borderPosition = op.value
                if (op.value === undefined)
                    break
                payloads.push(new SetBorderPayloadBuilder()
                    .line(this._borderLineType)
                    .position(this._borderPosition)
                    .color(this._borderColor)
                    .range(cellRange)
                    .sheet(sheetName)
                    .build())
                break
            case Operator.BORDER_LINE:
                this._borderLineType = op.value
                payloads.push(new SetBorderPayloadBuilder()
                    .line(this._borderLineType)
                    .color(this._borderColor)
                    .position(this._borderPosition)
                    .range(cellRange)
                    .sheet(sheetName)
                    .build())
                break
            default:
            }
        })
        return new CustomSheetActionBuilder().payloads(payloads).build()
    }

    public formatPaintingPayload(
        toRange: GcSpread.Range,
        sheet: string,
    ): Readonly<CloneFormatPayload> {
        this._isFormatPainting = false
        return new CloneFormatPayloadBuilder()
            .source(this._cloneSourceCell)
            .target(new CellRangeBuilder()
                .row(toRange.row)
                .rowCount(toRange.rowCount)
                .col(toRange.col)
                .colCount(toRange.colCount)
                .build())
            .sheet(sheet)
            .build()
    }
    private _borderColor = '#000000'
    private _borderPosition = BorderPosition.ALL
    private _borderLineType = LineType.THIN
    private _operator$ =
        new BehaviorSubject<ExcelOperator | undefined>(undefined)
    private _workbook!: GcSpread.Workbook
    private _selectChanged$ =
        new BehaviorSubject<void>(undefined)
    private _zoomChanged$ =
        new BehaviorSubject<void>(undefined)
    private _cloneSourceCell =
        new CellRangeBuilder().row(0).col(0).colCount(0).rowCount(0).build()

    private _isFormatPainting = false

    private _paintformat(selectRange: Readonly<CellRange>): void {
        this._cloneSourceCell = new CellRangeBuilder()
            .row(selectRange.row)
            .col(selectRange.col)
            .rowCount(selectRange.rowCount)
            .colCount(selectRange.colCount)
            .build()
        if (this._isFormatPainting) {
            this._isFormatPainting = false
            return
        }
        this._isFormatPainting = true
    }
}
