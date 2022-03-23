// tslint:disable: max-classes-per-file
import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
/**
 * The style information of an excel cell.
 */
export interface Style {
    /**
     * The content position information in a cell.
     */
    readonly alignment: Alignment
    /**
     * The fill information of a cell.
     */
    readonly fill: Fill
    /**
     * Font information.
     */
    readonly font: Font
    /**
     * The border information of a cell.
     */
    readonly border?: Border
    /*
     * The special format information for number.
     * The expression of the format use the number format codes.
     *
     * For example:
     * Number with thousand separator and double digits      ==>    #,##0.00
     * Number with percentage and double digits              ==>    0.00%
     * Number with scientific and double digits              ==>    0.00E+00
     *
     * You can get more information about the expression from website below:
     *     https://www.ablebits.com/office-addins-blog/2016/07/07/custom-excel-number-format/
     */
    readonly format: string
    /**
     * Word wrap is a feature that moves to the next line when reaching the
     * end without requiring you to press Enter.
     * Get more information about the expression from:
     * https://help.grapecity.com/spread/SpreadSheets11/webframe.html#SpreadJS~GC.Spread.Sheets.Style~wordWrap.html
     */
    readonly wordWrap: boolean

    /**
     * The number format when the number's abs number bigger than 1 or equal
     * 1.
     */
    readonly numberFormat: string
    /**
     * The number format when the number's abs number smaller than 1.
     */
    readonly decimalFormat: string
}

class StyleImpl implements Impl<Style> {
    public alignment = new AlignmentBuilder().build()
    public fill = new FillBuilder().build()
    public font = new FontBuilder().build()
    public border?: Border
    public format = ''
    public wordWrap!: boolean
    public numberFormat = ''
    public decimalFormat = ''
}

export class StyleBuilder extends Builder<Style, StyleImpl> {
    public constructor(obj?: Readonly<Style>) {
        const impl = new StyleImpl()
        if (obj)
            StyleBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public alignment(alignment: Alignment): this {
        this.getImpl().alignment = alignment
        return this
    }

    public fill(fill: Fill): this {
        this.getImpl().fill = fill
        return this
    }

    public font(font: Font): this {
        this.getImpl().font = font
        return this
    }

    public border(border: Border): this {
        this.getImpl().border = border
        return this
    }

    public format(format: string): this {
        this.getImpl().format = format
        return this
    }

    public wordWrap(wordWrap: boolean): this {
        this.getImpl().wordWrap = wordWrap
        return this
    }

    public numberFormat(nf: string): this {
        this.getImpl().numberFormat = nf
        return this
    }

    public decimalFormat(df: string): this {
        this.getImpl().decimalFormat = df
        return this
    }
}

export interface Alignment {
    readonly indent: number
    readonly horizontal: Horizontal
    readonly vertical: Vertical
}

class AlignmentImpl implements Impl<Alignment> {
    public indent = 0
    public horizontal = Horizontal.H_GENERAL
    public vertical = Vertical.V_BOTTOM
}

export class AlignmentBuilder extends Builder<Alignment, AlignmentImpl> {
    public constructor(obj?: Readonly<Alignment>) {
        const impl = new AlignmentImpl()
        if (obj)
            AlignmentBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public indent(indent: number): this {
        this.getImpl().indent = indent
        return this
    }

    public horizontal(horizontal: Horizontal): this {
        this.getImpl().horizontal = horizontal
        return this
    }

    public vertical(vertical: Vertical): this {
        this.getImpl().vertical = vertical
        return this
    }
}

export interface Fill {
    /**
     * Backgroud color.
     * ARGB color format. It consist of 8 Hex numbers, e.g.,'80FFFF00'.
     */
    readonly bgColor: string
    /**
     * Backgroud color.
     * ARGB color format. It consist of 8 Hex numbers, e.g.,'80FFFF00'.
     */
    readonly fgColor: string
}

class FillImpl implements Impl<Fill> {
    public bgColor = 'FFFFFFFF'
    public fgColor = 'FFFFFFFF'
}

export class FillBuilder extends Builder<Fill, FillImpl> {
    public constructor(obj?: Readonly<Fill>) {
        const impl = new FillImpl()
        if (obj)
            FillBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public bgColor(bgColor: string): this {
        this.getImpl().bgColor = bgColor
        return this
    }

    public fgColor(fgColor: string): this {
        this.getImpl().fgColor = fgColor
        return this
    }
}

export interface Font {
    /**
     * Font weight.
     */
    readonly bold: boolean
    /**
     * Font slope.
     */
    readonly italic: boolean
    /**
     * Font size.
     */
    readonly size: number
    /**
     * Font color description.
     * ARGB color format. It consist of 8 Hex numbers, e.g., '80FFFF00'.
     */
    readonly color: string
    /**
     * Font name, like `HeiTi`.
     */
    readonly name: string
    /**
     * Font underline style.
     */
    readonly underline: Underline
}

class FontImpl implements Impl<Font> {
    public bold = false
    public italic = false
    public size = 12
    public color = 'FF000000'
    public name = 'Calibri'
    public underline = Underline.NONE
}

export class FontBuilder extends Builder<Font, FontImpl> {
    public constructor(obj?: Readonly<Font>) {
        const impl = new FontImpl()
        if (obj)
            FontBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public bold(bold: boolean): this {
        this.getImpl().bold = bold
        return this
    }

    public italic(italic: boolean): this {
        this.getImpl().italic = italic
        return this
    }

    public size(size: number): this {
        this.getImpl().size = size
        return this
    }

    public color(color: string): this {
        this.getImpl().color = color
        return this
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public underline(underline: Underline): this {
        this.getImpl().underline = underline
        return this
    }
}

export interface Border {
    readonly bottom?: BorderStyle
    readonly left?: BorderStyle
    readonly right?: BorderStyle
    readonly top?: BorderStyle
}

class BorderImpl implements Impl<Border> {
    public bottom?: BorderStyle
    public left?: BorderStyle
    public right?: BorderStyle
    public top?: BorderStyle
}

export class BorderBuilder extends Builder<Border, BorderImpl> {
    public constructor(obj?: Readonly<Border>) {
        const impl = new BorderImpl()
        if (obj)
            BorderBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public bottom(bottom: BorderStyle | undefined): this {
        this.getImpl().bottom = bottom
        return this
    }

    public left(left: BorderStyle | undefined): this {
        this.getImpl().left = left
        return this
    }

    public right(right: BorderStyle | undefined): this {
        this.getImpl().right = right
        return this
    }

    public top(top: BorderStyle | undefined): this {
        this.getImpl().top = top
        return this
    }
}

export interface BorderStyle {
    /**
     * The line type of the border.
     */
    readonly lineType: LineType
    /**
     * Font color description.
     * ARGB color format. It consist of 8 Hex numbers, e.g., '80FFFF00'.
     */
    readonly color: string
}

class BorderStyleImpl implements Impl<BorderStyle> {
    public lineType = LineType.EMPTY
    public color = 'FF000000'
}

export class BorderStyleBuilder extends Builder<BorderStyle, BorderStyleImpl> {
    public constructor(obj?: Readonly<BorderStyle>) {
        const impl = new BorderStyleImpl()
        if (obj)
            BorderStyleBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public lineType(lineType: LineType): this {
        this.getImpl().lineType = lineType
        return this
    }

    public color(color: string): this {
        this.getImpl().color = color
        return this
    }
}

export const enum LineType {
    /**
     * Meaningless enum type.
     */
    LINE_TYPE_UNSPECIFIED = 0,
    /**
     * Indicates a border line without a style.
     */
    EMPTY = 1,
    /**
     *  Indicates a border line with a solid thin line.
     */
    THIN = 2,
    /**
     *  Indicates a medium border line with a solid line.
     */
    MEDIUM = 3,
    /**
     *  Indicates a border line with dashes.
     */
    DASHED = 4,
    /**
     *  Indicates a border line with dots.
     */
    DOTTED = 5,
    /**
     *  Indicates a thick border line with a solid line.
     */
    THICK = 6,
    /**
     *  Indicates a double border line.
     */
    DOUBLE = 7,
    /**
     *  Indicates a border line with all dots.
     */
    HAIR = 8,
    /**
     *  Indicates a medium border line with dashes.
     */
    MEDIUM_DASHED = 9,
    /**
     *  Indicates a border line with dash-dot.
     */
    DASH_DOT = 10,
    /**
     *  Indicates a medium border line with dash-dot-dot.
     */
    MEDIUM_DASH_DOT = 11,
    /**
     *  Indicates a border line with dash-dot-dot.
     */
    DASH_DOT_DOT = 12,
    /**
     *  Indicates a medium border line with dash-dot-dot.
     */
    MEDIUM_DASH_DOT_DOT = 13,
    /**
     *  Indicates a slanted border line with dash-dot.
     */
    SLANTED_DASH_DOT = 14,

}

export const enum Underline {
    UNDERLINE_UNSPECIFIED = 0,
    NONE = 1,
    SINGLE = 2,
    DOUBLE = 3,
    SINGLE_ACCOUNTING = 4,
    DOUBLE_ACCOUNTING = 5,
}

export const enum Horizontal {
    HORIZONTAL_UNSPECIFIED = 0,
    H_LEFT = 1,
    H_CENTER = 2,
    H_RIGHT = 3,
    H_FILL = 4,
    H_JUSTIFY = 5,
    H_CENTER_CONTINUOUS = 6,
    H_DISTRIBUTED = 7,
    H_GENERAL = 8,
}
/**
 * The prefix V_ is needed for the reason that solve the repeated
 * definition at `Horizontal`, such as `JUSTIFY`.
 */
export const enum Vertical {
    VERTICAL_UNSPECIFIED = 0,
    V_TOP = 1,
    V_MIDDLE = 2,
    V_BOTTOM = 3,
    V_DISTRIBUTED = 4,
    V_JUSTIFY = 5,
// tslint:disable-next-line: max-file-line-count
}
