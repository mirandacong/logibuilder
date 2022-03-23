// tslint:disable-next-line: no-wildcard-import
import * as GC from '@grapecity/spread-sheets'
import {
    Alignment,
    Border,
    Font,
    Horizontal,
    LineType,
    Style,
    Underline,
    Vertical,
} from '@logi/base/ts/common/excel'
import {Value, ValueError} from '@logi/src/lib/hsf/defs'

import {BORDERS, ERRORS, HORIZONTALS, UNDERLINES, VERTICALS} from './map'

export function setValue(ec: GC.Spread.Sheets.CellRange, value: Value): void {
    if (value.number !== undefined) {
        ec.value(value.number)
        return
    }
    if (value.text !== undefined) {
        const num = Number(value.text)
        ec.value(value.text === '' || isNaN(num) ? value.text : num)
        return
    }
    if (value.boolean !== undefined) {
        ec.value(value.boolean)
        return
    }
    if (value.error !== undefined) {
        const error = ERROR_MAP.get(value.error)
        if (error !== undefined)
            ec.value(error)
        return
    }
    if (value.stub)
        return
    if (value.date) {
        ec.value(value.date)
        return
    }
}

/**
 * Convert the style of CsfCell to the style of SpreadJs cell.
 */
export function setCellStyle(
    sCell: GC.Spread.Sheets.CellRange,
    style: Style,
): void {
    // covert font info.
    setFont(sCell, style.font)
    // covert fill info.
    // Make a slice here for the color type in spread js is `RGB`,
    // but type in csf is `ARGB`.
    // tslint:disable-next-line:no-magic-numbers
    sCell.backColor(`#${style.fill.bgColor.slice(2).toLowerCase()}`)
    // convert number format.
    if (style.format !== '')
        sCell.formatter(style.format)
    // covert border info.
    if (style.border !== undefined)
        setBorder(sCell, style.border)
    // covert alignment info.
    setAlignment(sCell, style.alignment)
    if (style.wordWrap)
        sCell.wordWrap(style.wordWrap)
}

export function getSpreadVertAlign(
    v: Vertical,
): GC.Spread.Sheets.VerticalAlign {
    return VERTICAL_MAP.get(v) ?? GC.Spread.Sheets.VerticalAlign.center
}

// tslint:disable-next-line:max-func-body-length cyclomatic-complexity
function setFont(sCell: GC.Spread.Sheets.CellRange, font: Font): void {
    const fontStrs: string[] = []
    fontStrs.push(font.italic ? 'italic' : 'normal')
    fontStrs.push(font.bold ? 'bold' : 'normal')
    // convert points font size to pixels font size. You can get more
    // information from the website below:
    //   https://www.joomlasrilanka.com/web-design-development-blog/web-design-font-size-measurements-convert-points-pixelsems-percentages-web-designing/
    // tslint:disable-next-line:no-magic-numbers
    fontStrs.push(`${font.size.toString()}pt`)
    fontStrs.push(font.name)
    sCell.font(fontStrs.join(' '))
    const underlineType = UNDERLINE_MAP.get(font.underline)
    sCell.textDecoration(underlineType)
    // Make a slice here for the color type in spread js is `RGB`,
    // but type in csf is `ARGB`.
    // tslint:disable-next-line:no-magic-numbers
    sCell.foreColor(`#${font.color.slice(2).toLowerCase()}`)
}

function setAlignment(
    sCell: GC.Spread.Sheets.CellRange,
    alignment: Alignment,
): void {
    sCell.textIndent(alignment.indent)
    const horizontalType = HORIZONTAL_MAP.get(alignment.horizontal)
    sCell.hAlign(horizontalType)
    const verticalType = VERTICAL_MAP.get(alignment.vertical)
    sCell.vAlign(verticalType)
    return
}

function setBorder(sCell: GC.Spread.Sheets.CellRange, border: Border): void {
    if (border.top) {
        const lineType = BORDER_MAP.get(border.top.lineType)
        const borderLine = new GC.Spread.Sheets.LineBorder(
            // Make a slice here for the color type in spread js is `RGB`,
            // but type in csf is `ARGB`.
            // tslint:disable-next-line:no-magic-numbers
            `#${border.top.color.slice(2).toLowerCase()}`, lineType)
        sCell.borderTop(borderLine)
    } else
        sCell.borderTop(undefined)
    if (border.bottom) {
        const lineType = BORDER_MAP.get(border.bottom.lineType)
        const borderLine = new GC.Spread.Sheets.LineBorder(
            // Make a slice here for the color type in spread js is `RGB`,
            // but type in csf is `ARGB`.
            // tslint:disable-next-line:no-magic-numbers
            `#${border.bottom.color.slice(2).toLowerCase()}`, lineType)
        sCell.borderBottom(borderLine)
    } else
        sCell.borderBottom(undefined)
    if (border.left) {
        const lineType = BORDER_MAP.get(border.left.lineType)
        const borderLine = new GC.Spread.Sheets.LineBorder(
            // Make a slice here for the color type in spread js is `RGB`,
            // but type in csf is `ARGB`.
            // tslint:disable-next-line:no-magic-numbers
            `#${border.left.color.slice(2).toLowerCase()}`, lineType)
        sCell.borderLeft(borderLine)
    } else
        sCell.borderLeft(undefined)
    if (border.right) {
        const lineType = BORDER_MAP.get(border.right.lineType)
        const borderLine = new GC.Spread.Sheets.LineBorder(
            // Make a slice here for the color type in spread js is `RGB`,
            // but type in csf is `ARGB`.
            // tslint:disable-next-line:no-magic-numbers
            `#${border.right.color.slice(2).toLowerCase()}`, lineType)
        sCell.borderRight(borderLine)
    } else
        sCell.borderRight(undefined)
    return
}

const UNDERLINE_MAP = new Map< Underline,
    GC.Spread.Sheets.TextDecorationType>(UNDERLINES)

const HORIZONTAL_MAP = new Map< Horizontal,
    GC.Spread.Sheets.HorizontalAlign>(HORIZONTALS)

const VERTICAL_MAP = new Map< Vertical,
    GC.Spread.Sheets.VerticalAlign>(VERTICALS)

const BORDER_MAP = new Map< LineType, GC.Spread.Sheets.LineStyle>(BORDERS)

const ERROR_MAP = new Map< ValueError, string>(ERRORS)
