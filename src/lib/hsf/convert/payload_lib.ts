import {
    Alignment,
    Border,
    Font,
    LineType,
    Style,
} from '@logi/base/ts/common/excel'
import {Value, ValueError} from '@logi/src/lib/hsf/defs'
import {
    BorderPosition,
    CellRange,
    SetBackColorPayloadBuilder,
    SetBorderPayloadBuilder,
    SetFontColorPayloadBuilder,
    SetFontPayloadBuilder,
    SetFormatPayloadBuilder,
    SetHorizontalAlignPayloadBuilder,
    SetIndentPayloadBuilder,
    SetUnderlinePayloadBuilder,
    SetValuePayloadBuilder,
    SetVerticalAlignPayloadBuilder,
    SetWordWrapPayloadBuilder,
    SpreadsheetPayload,
} from '@logi/src/lib/spreadsheet'

import {ERRORS} from './map'

export function getValuePayloads(
    sheet: string,
    range: CellRange,
    value: Value,
): readonly SpreadsheetPayload [] {
    let v: unknown
    if (value.number !== undefined)
        v = value.number
    else if (value.text !== undefined) {
        const num = Number(value.text)
        v = value.text === '' || isNaN(num) ? value.text : num
    } else if (value.boolean !== undefined)
        v = value.boolean
    else if (value.error !== undefined) {
        const error = ERROR_MAP.get(value.error)
        v = error
    } else if (value.date)
        v = value.date
    if (v === undefined)
        return []
    return [new SetValuePayloadBuilder()
        .sheet(sheet)
        .range(range)
        .value(v)
        .build()]
}

/**
 * Convert the style of CsfCell to the style of SpreadJs cell.
 */
export function getCellStylePayloads(
    sheet: string,
    range: CellRange,
    style: Style,
): readonly SpreadsheetPayload[] {
    const payloads: SpreadsheetPayload[] = []
    // covert font info.
    payloads.push(...getFontPayloads(sheet, range, style.font))
    // covert fill info.
    // Make a slice here for the color type in spread js is `RGB`,
    // but type in csf is `ARGB`.
    // tslint:disable-next-line:no-magic-numbers
    const bc = new SetBackColorPayloadBuilder()
        .sheet(sheet)
        .range(range)
        // tslint:disable-next-line: no-magic-numbers
        .color(`#${style.fill.bgColor.slice(2).toLowerCase()}`)
        .build()
    payloads.push(bc)
    // convert number format.
    if (style.format !== '') {
        const format = new SetFormatPayloadBuilder()
            .sheet(sheet)
            .range(range)
            .format(style.format)
            .build()
        payloads.push(format)
    }
    // covert border info.
    if (style.border !== undefined)
        payloads.push(...setBorder(sheet, range, style.border))
    // covert alignment info.
    payloads.push(...setAlignment(sheet, range, style.alignment))
    if (style.wordWrap)
        payloads.push(new SetWordWrapPayloadBuilder()
            .sheet(sheet)
            .range(range)
            .wordWrap(style.wordWrap)
            .build())
    return payloads
}

// tslint:disable-next-line:max-func-body-length cyclomatic-complexity
function getFontPayloads(
    sheet: string,
    range: CellRange,
    font: Font,
): readonly SpreadsheetPayload[] {
    const setFont = new SetFontPayloadBuilder()
        .sheet(sheet)
        .range(range)
        .italic(font.italic)
        .bold(font.bold)
        .size(font.size)
        .family(font.name)
        .build()
    const underline = new SetUnderlinePayloadBuilder()
        .sheet(sheet)
        .range(range)
        .underline(font.underline)
        .build()
    const fontColor = new SetFontColorPayloadBuilder()
        .sheet(sheet)
        .range(range)
        // tslint:disable-next-line: no-magic-numbers
        .color(`#${font.color.slice(2).toLowerCase()}`)
        .build()
    return [setFont, underline, fontColor]
}

function setAlignment(
    sheet: string,
    range: CellRange,
    alignment: Alignment,
): readonly SpreadsheetPayload[] {
    const indent = new SetIndentPayloadBuilder()
        .sheet(sheet)
        .range(range)
        .indent(alignment.indent)
        .build()
    const hAlign = new SetHorizontalAlignPayloadBuilder()
        .sheet(sheet)
        .range(range)
        .horizontalAlign(alignment.horizontal)
        .build()
    const vAlign = new SetVerticalAlignPayloadBuilder()
        .sheet(sheet)
        .range(range)
        .verticalAlign(alignment.vertical)
        .build()
    return [indent, hAlign, vAlign]
}

// tslint:disable-next-line: max-func-body-length
function setBorder(
    sheet: string,
    range: CellRange,
    border: Border,
): readonly SpreadsheetPayload[] {
    const payloads: SpreadsheetPayload[] = []
    const defColor = '#000000'

    const topLine = border.top !== undefined
        ? border.top.lineType
        : LineType.EMPTY
    const topColor = border.top !== undefined
        // tslint:disable-next-line: no-magic-numbers
        ? `#${border.top.color.slice(2).toLowerCase()}`
        : defColor
    payloads.push(new SetBorderPayloadBuilder()
        .sheet(sheet)
        .range(range)
        .position(BorderPosition.TOP)
        .line(topLine)
        .color(topColor)
        .build())

    const botLine = border.bottom !== undefined
        ? border.bottom.lineType
        : LineType.EMPTY
    const botColor = border.bottom !== undefined
        // tslint:disable-next-line: no-magic-numbers
        ? `#${border.bottom.color.slice(2).toLowerCase()}`
        : defColor
    payloads.push(new SetBorderPayloadBuilder()
        .sheet(sheet)
        .range(range)
        .position(BorderPosition.BOTTOM)
        .line(botLine)
        .color(botColor)
        .build())

    const leftLine = border.left !== undefined
        ? border.left.lineType
        : LineType.EMPTY
    const leftColor = border.left !== undefined
        // tslint:disable-next-line: no-magic-numbers
        ? `#${border.left.color.slice(2).toLowerCase()}`
        : defColor
    payloads.push(new SetBorderPayloadBuilder()
        .sheet(sheet)
        .range(range)
        .position(BorderPosition.LEFT)
        .line(leftLine)
        .color(leftColor)
        .build())

    const rightLine = border.right !== undefined
        ? border.right.lineType
        : LineType.EMPTY
    const rightColor = border.right !== undefined
        // tslint:disable-next-line: no-magic-numbers
        ? `#${border.right.color.slice(2).toLowerCase()}`
        : defColor
    payloads.push(new SetBorderPayloadBuilder()
        .sheet(sheet)
        .range(range)
        .position(BorderPosition.RIGHT)
        .line(rightLine)
        .color(rightColor)
        .build())

    return payloads
}

const ERROR_MAP = new Map< ValueError, string>(ERRORS)
