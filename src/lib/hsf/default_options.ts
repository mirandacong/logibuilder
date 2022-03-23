// tslint:disable:no-magic-numbers
import {
    AlignmentBuilder,
    Border,
    BorderBuilder,
    BorderStyle,
    BorderStyleBuilder,
    FillBuilder,
    FontBuilder,
    GridlineBuilder,
    Horizontal,
    LineType,
    Style,
    StyleBuilder,
    Vertical,
    ViewBuilder,
} from '@logi/base/ts/common/excel'
import {Modifier} from '@logi/src/lib/modifier'

import {BaseStyle, StyleTag} from './defs'
import {Options} from './options'

export const DEFAULT_OPTIONS: Options = {
    cell: {
        databaseSource: 'FF757575',
        decimalFormat: '#,##0.00;(#,##0.00)',
        diffSheetFontColor: 'FF8800CC',
        directFormalu: 'FF13AC59',
        manualSource: 'FF4178B8',
        numberFormat: '#,##0.00;(#,##0.00)',
    },
    getBaseStyle,
    sheet: {
        defaultColWidth: 28.25,
        defaultRowHeight: 23.2,
        defaultVertAlign: Vertical.V_BOTTOM,
        endColCount: 20,
        endRowCount: 20,
        marginColWidth: 6,
        view: new ViewBuilder()
            .gridline(new GridlineBuilder()
                .vertical(false)
                .horizontal(false)
                .build())
            .build(),
    },
    table: {
        minColumnWidth: 97,
        rowHeight: 28.5,
        stubWidth: 220,
    },
    title: {
        intervalHeight: 27.5,
        rowHeight: 27.5,
        update: titleUpdate,
    },
    topMargin: {
        backColor: '#E5E5E5',
        content: '此工作表由逻辑式生成，只可修改标识为灰色背景的“事实”及浅蓝色背景的“假设”数据；无背景色的数据不可修改。',
        font: 'normal normal 10pt Calibri',
    },
    updateStyle,
}

export function getBaseStyle(type: BaseStyle, depth = 0): Style {
    switch (type) {
    case BaseStyle.COLUMN_BLOCK:
        return getColBlockStyle()
    case BaseStyle.TABLE_STUB:
        return getTableStubStyle()
    case BaseStyle.COLUMN:
        return getColumnStyle()
    case BaseStyle.TABLE_TITLE:
        return getTitleStyle()
    case BaseStyle.SHEET_TITLE:
        return getTopTitleStyle()
    case BaseStyle.ROW:
        return getRowStyle(depth)
    case BaseStyle.ROW_BLOCK:
        return getRowBlockStyle(depth)
    case BaseStyle.EMPTY:
        return getEmptyStyle()
    case BaseStyle.TABLE_END:
        return getTableEndStyle()
    case BaseStyle.FORMULA_CELL:
    case BaseStyle.VALUE_CELL:
    case BaseStyle.DEFAULT:
    default:
        return getDefaultStyle()
    }
}

// tslint:disable-next-line: max-func-body-length
export function updateStyle(
    // tslint:disable-next-line: max-params
    style: Style,
    tags: readonly StyleTag[],
    modifier: Modifier | undefined,
    dataCell = false,
): Style {
    let curr = style
    const positions = [
        StyleTag.FIRST_COLUMN,
        StyleTag.LAST_COLUMN,
        StyleTag.LAST_ROW,
    ]
    const scalars = [
        StyleTag.SCALAR_EXPR,
        StyleTag.SCALAR_EMPTY,
        StyleTag.OTHER_SCALAR,
    ]
    const clearBorders = [
        StyleTag.CLEAR_BOTTOM_BORDER,
        StyleTag.CLEAR_LEFT_BORDER,
        StyleTag.CLEAR_RIGHT_BORDER,
        StyleTag.CLEAR_TOP_BORDER,
    ]
    const types = [
        StyleTag.ASSUMPTION,
        StyleTag.CONSTRAINT,
        StyleTag.FACT,
        StyleTag.FX,
    ]
    const separators = [
        StyleTag.ROW_SEPARATOR,
        StyleTag.COL_SEPARATOR,
        StyleTag.CROSS_SEPARATOR,
    ]
    const ordered = [
        ...scalars,
        ...types,
        ...clearBorders,
        ...positions,
        ...separators,
    ]
    let modiferUpdate = true
    tags
        .slice()
        .sort((a: StyleTag, b: StyleTag): number =>
            ordered.indexOf(a) - ordered.indexOf(b))
        .forEach((t: StyleTag): void => {
            if (positions.includes(t))
                curr = updatePositionStyle(curr, t)
            else if (scalars.includes(t))
                curr = updateScalarStyle(curr, t)
            else if (types.includes(t))
                curr = updateTypesStyle(curr, t)
            else if (clearBorders.includes(t))
                curr = updateOtherStyle(curr, t)
            else if (separators.includes(t)) {
                curr = updateSeparatorStyle(curr, t, dataCell)
                modiferUpdate = false
            }
        })
    if (!modiferUpdate || modifier === undefined)
        return curr
    return updateWithModifer(curr, modifier, dataCell)
}

function updateSeparatorStyle(
    curr: Style,
    tag: StyleTag,
    dataCell: boolean,
): Style {
    const builder = new StyleBuilder(curr)
    if (tag === StyleTag.CROSS_SEPARATOR)
        builder.border(new BorderBuilder().build())
    else if (tag === StyleTag.ROW_SEPARATOR)
        builder.border(new BorderBuilder()
            .top(getBorderStyle())
            .bottom(getBorderStyle())
            .left(undefined)
            .right(undefined)
            .build())
    else if (tag === StyleTag.COL_SEPARATOR)
        builder.border(new BorderBuilder()
            .left(getBorderStyle())
            .right(getBorderStyle())
            .top(undefined)
            .bottom(undefined)
            .build())
    if (!dataCell && tag === StyleTag.ROW_SEPARATOR)
        builder.font(new FontBuilder().bold(true).size(10).build())
    if (tag !== StyleTag.COL_SEPARATOR || dataCell)
        builder.fill(new FillBuilder().build())
    return builder.build()
}

function updateTypesStyle(curr: Style, tag: StyleTag): Style {
    switch (tag) {
    case StyleTag.ASSUMPTION:
        const bs = new BorderStyleBuilder()
            .lineType(LineType.DASHED)
            .color('FF009FBF')
            .build()
        const newBorder = new BorderBuilder(curr.border)
            .bottom(bs)
            .top(bs)
            .left(bs)
            .right(bs)
            .build()
        const f = new FillBuilder(curr.fill).bgColor('FFE0F5FB').build()
        return new StyleBuilder(curr).border(newBorder).fill(f).build()
    case StyleTag.FACT:
        const fill = new FillBuilder(curr.fill).bgColor('FFF5F5F5').build()
        return new StyleBuilder(curr).fill(fill).build()
    case StyleTag.CONSTRAINT:
    case StyleTag.FX:
    default:
    }
    return curr
}

function updateOtherStyle(style: Style, tag: StyleTag): Style {
    let curr = style
    if (tag === StyleTag.CLEAR_TOP_BORDER) {
        const border = new BorderBuilder(style.border).top(undefined).build()
        curr = new StyleBuilder(style).border(border).build()
    } else if (tag === StyleTag.CLEAR_BOTTOM_BORDER) {
        const border = new BorderBuilder(style.border).bottom(undefined).build()
        curr = new StyleBuilder(style).border(border).build()
    } else if (tag === StyleTag.CLEAR_LEFT_BORDER) {
        const border = new BorderBuilder(style.border).left(undefined).build()
        curr = new StyleBuilder(style).border(border).build()
    } else if (tag === StyleTag.CLEAR_RIGHT_BORDER) {
        const border = new BorderBuilder(style.border).right(undefined).build()
        curr = new StyleBuilder(style).border(border).build()
    }
    return curr
}

function updateScalarStyle(style: Style, tag: StyleTag): Style {
    const border = new BorderBuilder().build()
    switch (tag) {
    case StyleTag.SCALAR_EXPR:
        const f = new FillBuilder(style.fill).bgColor('FFFCF3E3').build()
        return new StyleBuilder(style).fill(f).border(border).build()
    case StyleTag.SCALAR_EMPTY:
        const newFill = new FillBuilder(style.fill).bgColor('FFFFEBEE').build()
        return new StyleBuilder(style).fill(newFill).border(border).build()
    case StyleTag.OTHER_SCALAR:
        const font = new FontBuilder(style.font).color('FF000000').build()
        const fill = new FillBuilder(style.fill).bgColor('FFFFFFFF').build()
        return new StyleBuilder(style)
            .font(font)
            .fill(fill)
            .border(border)
            .build()
    default:
    }
    return style
}

function updatePositionStyle(style: Style, tag: StyleTag): Style {
    switch (tag) {
    case StyleTag.FIRST_COLUMN:
        return updateFirstColumn(style)
    case StyleTag.LAST_COLUMN:
        return updateLastColumn(style)
    case StyleTag.LAST_ROW:
        return updateLastRow(style)
    default:
    }
    return style
}

function updateFirstColumn(style: Style): Style {
    const border = style.border
    const b = new BorderBuilder(border).left(getBorderStyle()).build()
    return new StyleBuilder(style).border(b).build()
}

function updateLastColumn(style: Style): Style {
    const border = style.border
    const b = new BorderBuilder(border).right(getBorderStyle()).build()
    return new StyleBuilder(style).border(b).build()
    // return new StyleBuilder(style).build()
}

function updateLastRow(style: Style): Style {
    const border = style.border
    const b = new BorderBuilder(border).bottom(getBorderStyle()).build()
    return new StyleBuilder(style).border(b).build()
}

function getEmptyStyle(): Style {
    // Default empty style
    return new StyleBuilder().build()
}

function getDefaultStyle(): Style {
    const font = new FontBuilder()
        .name('Calibri')
        .size(10)
        .color('FF000000')
        .build()
    const alignment = new AlignmentBuilder()
        .horizontal(Horizontal.H_RIGHT)
        .vertical(Vertical.V_BOTTOM)
        .build()
    const fill = new FillBuilder().bgColor('FFFFFFFF').build()
    const border = new BorderBuilder()
        .bottom(undefined)
        .top(undefined)
        .left(undefined)
        .right(undefined)
        .build()
    return new StyleBuilder()
        .alignment(alignment)
        .font(font)
        .fill(fill)
        .border(border)
        .format('#,##0.00;(#,##0.00)')
        .decimalFormat('#,##0.00;(#,##0.00)')
        .numberFormat('#,##0.00;(#,##0.00)')
        .build()
}

function getColBlockStyle(): Style {
    const font = new FontBuilder()
        .name('Calibri')
        .size(12)
        .bold(true)
        .color('FFFFFFFF')
        .build()
    const border = getColBlockBorder()
    const fill = new FillBuilder().bgColor('FF4178B8').build()
    const alignment = new AlignmentBuilder()
        .horizontal(Horizontal.H_CENTER)
        .vertical(Vertical.V_MIDDLE)
        .build()

    return new StyleBuilder()
        .font(font)
        .alignment(alignment)
        .border(border)
        .fill(fill)
        .build()
}

function getColBlockBorder(): Border {
    return new BorderBuilder()
        .left(getBorderStyle())
        .right(getBorderStyle())
        .build()
}

function getBorderStyle(): BorderStyle {
    return new BorderStyleBuilder()
        .lineType(LineType.MEDIUM)
        .color('FFE0E0E0')
        .build()
}

function getTableStubStyle(): Style {
    const font = new FontBuilder()
        .name('Calibri')
        .size(12)
        .bold(true)
        .color('FFFFFFFF')
        .build()
    const fill = new FillBuilder().bgColor('FF4178B8').build()
    const alignment = new AlignmentBuilder()
        .horizontal(Horizontal.H_LEFT)
        .vertical(Vertical.V_MIDDLE)
        .build()

    return new StyleBuilder().font(font).fill(fill).alignment(alignment).build()
}

function getColumnStyle(): Style {
    const font = new FontBuilder()
        .name('Calibri')
        .size(12)
        .bold(true)
        .color('FFFFFFFF')
        .build()
    const fill = new FillBuilder().bgColor('FF4178B8').build()
    const alignment = new AlignmentBuilder()
        .horizontal(Horizontal.H_CENTER)
        .vertical(Vertical.V_MIDDLE)
        .build()

    return new StyleBuilder().alignment(alignment).font(font).fill(fill).build()
}

function getTitleStyle(): Style {
    const font = new FontBuilder()
        .name('Calibri')
        .size(14)
        .color('FF4178B8')
        .bold(true)
        .build()
    const alignment = new AlignmentBuilder()
        .horizontal(Horizontal.H_LEFT)
        .build()
    const fill = new FillBuilder().bgColor('FFFFFFFF').build()

    return new StyleBuilder().font(font).alignment(alignment).fill(fill).build()
}

function getTopTitleStyle(): Style {
    const base = getTitleStyle()
    const font = base.font
    const newFont = new FontBuilder(font).bold(true).build()
    return new StyleBuilder(base).font(newFont).build()
}

function getRowBlockStyle(depth = 0): Style {
    const indent = depth * 1
    const font = new FontBuilder()
        .name('Calibri')
        .size(10)
        .color('FF000000')
        .build()
    const fill = new FillBuilder().bgColor('FFFFFFFF').build()
    const alignment = new AlignmentBuilder()
        .indent(indent)
        .horizontal(Horizontal.H_LEFT)
        .vertical(Vertical.V_BOTTOM)
        .build()
    const border = new BorderBuilder().right(getBorderStyle()).build()

    return new StyleBuilder()
        .font(font)
        .fill(fill)
        .alignment(alignment)
        .wordWrap(true)
        .border(border)
        .build()
}

function getRowStyle(depth = 0): Style {
    const indent = depth * 1
    const font = new FontBuilder()
        .name('Calibri')
        .size(10)
        .color('FF000000')
        .build()
    const fill = new FillBuilder().bgColor('FFFFFFFF').build()
    const alignment = new AlignmentBuilder()
        .indent(indent)
        .horizontal(Horizontal.H_LEFT)
        .vertical(Vertical.V_BOTTOM)
        .build()
    const border = new BorderBuilder().right(getBorderStyle()).build()

    return new StyleBuilder()
        .font(font)
        .fill(fill)
        .alignment(alignment)
        .border(border)
        .build()
}

function getTableEndStyle(): Style {
    const b = new BorderBuilder().top(getBorderStyle()).build()
    return new StyleBuilder().border(b).build()
}

function titleUpdate(base: Style, depth: number): Style {
    const baseSize = 12
    const delta = 2
    const currSize = baseSize + delta * (depth - 1)
    const newFont = new FontBuilder(base.font).size(currSize).build()
    return new StyleBuilder(base).font(newFont).build()
}

function updateWithModifer(
    style: Style,
    modifier: Modifier,
    dataCell = false,
): Style {
    const font = new FontBuilder(style.font)
        .name(modifier.font.family)
        .italic(modifier.font.italic)
        .bold(modifier.font.bold)
        .size(modifier.font.size)
        .underline(modifier.font.line)
        .build()
    if (dataCell)
        return new StyleBuilder(style)
            .font(font)
            .format(modifier.format.getFormatter())
            .build()
    const alignment = new AlignmentBuilder(style.alignment)
        .indent(modifier.font.indent)
        .build()
    return new StyleBuilder(style).font(font).alignment(alignment).build()
}
// tslint:disable-next-line: max-file-line-count
