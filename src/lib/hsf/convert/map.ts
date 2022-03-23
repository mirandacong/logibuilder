/**
 * This file includes the point to point map of the the excel related attrs
 * such as underline types between `spreadjs` workbook and `CSF` workbook.
 *
 * For example:
 *  the double underline in `spreadjs` is
 *  `GC.Spread.Sheets.TextDecorationType.doubleUnderline`, enum number is `8`.
 *  the double underline in `CSF` is `CsfUnderline.DOUBLE`,enum number is `2`.
 *
 * You use this map information to convert these information between `CSF`
 * and `Spreadjs`.
 * Current map is `CSF` point to `Spreadjs`. You need to reverser the map when
 * you want to `Spreadjs` point tot `CSF`.
 */

// tslint:disable-next-line: no-wildcard-import
import * as GC from '@grapecity/spread-sheets'
import {
    Horizontal,
    LineType,
    Underline,
    Vertical,
} from '@logi/base/ts/common/excel'
import {ValueError} from '@logi/src/lib/hsf/defs'

/**
 * The underline type enum map via the csf and spreadjs.
 */
export const UNDERLINES:
    readonly (readonly [
        Underline,
        GC.Spread.Sheets.TextDecorationType,
    ])[] = [
        [Underline.NONE, GC.Spread.Sheets.TextDecorationType.none],
        [Underline.UNDERLINE_UNSPECIFIED,
            GC.Spread.Sheets.TextDecorationType.none],
        [Underline.SINGLE, GC.Spread.Sheets.TextDecorationType.underline],
        [Underline.DOUBLE,
            GC.Spread.Sheets.TextDecorationType.doubleUnderline],
        [Underline.SINGLE_ACCOUNTING,
            GC.Spread.Sheets.TextDecorationType.lineThrough],
        [Underline.DOUBLE_ACCOUNTING,
            GC.Spread.Sheets.TextDecorationType.overline],
    ]
Object.freeze(UNDERLINES)

/**
 * The horizontal type enum map via the csf and spreadjs.
 */
export const HORIZONTALS:
    readonly (readonly [Horizontal, GC.Spread.Sheets.HorizontalAlign])[] = [
        [Horizontal.H_LEFT, GC.Spread.Sheets.HorizontalAlign.left],
        [Horizontal.H_CENTER, GC.Spread.Sheets.HorizontalAlign.center],
        [Horizontal.H_RIGHT, GC.Spread.Sheets.HorizontalAlign.right],
        [Horizontal.H_GENERAL, GC.Spread.Sheets.HorizontalAlign.general],
    ]
Object.freeze(HORIZONTALS)

/**
 * The vertical type enum map via the csf and spreadjs.
 */
export const VERTICALS: readonly (readonly [Vertical, GC.Spread.Sheets.VerticalAlign])[] = [
    [Vertical.V_TOP, GC.Spread.Sheets.VerticalAlign.top],
    [Vertical.V_MIDDLE, GC.Spread.Sheets.VerticalAlign.center],
    [Vertical.V_BOTTOM, GC.Spread.Sheets.VerticalAlign.bottom],
]
Object.freeze(VERTICALS)

/**
 * The border line type enum map via the csf and spreadjs.
 */
export const BORDERS: readonly (readonly [LineType, GC.Spread.Sheets.LineStyle])[] = [
    [LineType.EMPTY, GC.Spread.Sheets.LineStyle.empty],
    [LineType.THIN, GC.Spread.Sheets.LineStyle.thin],
    [LineType.MEDIUM, GC.Spread.Sheets.LineStyle.medium],
    [LineType.DASHED, GC.Spread.Sheets.LineStyle.dashed],
    [LineType.DOTTED, GC.Spread.Sheets.LineStyle.dotted],
    [LineType.THICK, GC.Spread.Sheets.LineStyle.thick],
    [LineType.DOUBLE, GC.Spread.Sheets.LineStyle.double],
    [LineType.HAIR, GC.Spread.Sheets.LineStyle.hair],
    [LineType.MEDIUM_DASHED, GC.Spread.Sheets.LineStyle.mediumDashed],
    [LineType.DASH_DOT, GC.Spread.Sheets.LineStyle.dashDot],
    [LineType.MEDIUM_DASH_DOT, GC.Spread.Sheets.LineStyle.mediumDashDot],
    [LineType.DASH_DOT_DOT, GC.Spread.Sheets.LineStyle.dashDotDot],
    [LineType.MEDIUM_DASH_DOT_DOT,
        GC.Spread.Sheets.LineStyle.mediumDashDotDot],
    [LineType.SLANTED_DASH_DOT, GC.Spread.Sheets.LineStyle.slantedDashDot],
]
Object.freeze(BORDERS)

/**
 * The error type enum map via the csf and spreadjs.
 */
export const ERRORS: readonly (readonly [ValueError, string])[] = [
    [ValueError.E_NULL, '#NULL!'],
    [ValueError.E_DIV0, '#DIV/0!'],
    [ValueError.E_VALUE, '#VALUE!'],
    [ValueError.E_REF, '#REF!'],
    [ValueError.E_NAME, '#NAME?'],
    [ValueError.E_NUM, '#NUM!'],
    [ValueError.E_NA, '#N/A'],
    [ValueError.E_GETTING_DATA, '#GETTING_DATA!'],
]
Object.freeze(ERRORS)
