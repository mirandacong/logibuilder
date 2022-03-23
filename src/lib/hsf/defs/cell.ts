import {Builder} from '@logi/base/ts/common/builder'
import {Op} from '@logi/src/lib/compute/op'

import {Value} from './value'

export interface Cell {
    readonly value?: Value
    readonly formattedText: string
    readonly formula?: FormulaInfo
    readonly baseStyle: BaseStyle
    readonly tags: readonly StyleTag[]
    readonly props?: CellProps
    readonly comment?: Comment
    readonly hyperlink?: Hyperlink
    readonly customFormula: string
}

export class CellImpl implements Cell {
    public value?: Value
    public formattedText = ''
    public formula?: FormulaInfo
    public baseStyle = BaseStyle.BASE_STYLE_UNSPECIFIED
    public tags: readonly StyleTag[] = []
    public props?: CellProps
    public comment?: Comment
    public hyperlink?: Hyperlink
    public customFormula = ''
}

export class CellBuilder extends Builder<Cell, CellImpl> {
    public constructor(obj?: Readonly<Cell>) {
        const impl = new CellImpl()
        if (obj)
            CellBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public value(value: Value): this {
        this.getImpl().value = value
        return this
    }

    public formattedText(formattedText: string): this {
        this.getImpl().formattedText = formattedText
        return this
    }

    public formula(formula: FormulaInfo): this {
        this.getImpl().formula = formula
        return this
    }

    public baseStyle(baseStyle: BaseStyle): this {
        this.getImpl().baseStyle = baseStyle
        return this
    }

    public tags(tags: readonly StyleTag[]): this {
        this.getImpl().tags = tags
        return this
    }

    public props(props: CellProps): this {
        this.getImpl().props = props
        return this
    }

    public comment(comment: Comment): this {
        this.getImpl().comment = comment
        return this
    }

    public hyperlink(hyperlink: Hyperlink): this {
        this.getImpl().hyperlink = hyperlink
        return this
    }

    public customFormula(customFormula: string): this {
        this.getImpl().customFormula = customFormula
        return this
    }
}
export interface CellProps {
    readonly tableUuid: string
    readonly rowUuid: string
    readonly colUuid: string
}

class CellPropsImpl implements CellProps {
    public tableUuid!: string
    public rowUuid!: string
    public colUuid!: string
}

export class CellPropsBuilder extends Builder<CellProps, CellPropsImpl> {
    public constructor(obj?: Readonly<CellProps>) {
        const impl = new CellPropsImpl()
        if (obj)
            CellPropsBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public tableUuid(tableUuid: string): this {
        this.getImpl().tableUuid = tableUuid
        return this
    }

    public rowUuid(rowUuid: string): this {
        this.getImpl().rowUuid = rowUuid
        return this
    }

    public colUuid(colUuid: string): this {
        this.getImpl().colUuid = colUuid
        return this
    }

    protected get daa(): readonly string[] {
        return CellPropsBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'tableUuid',
        'rowUuid',
        'colUuid',
    ]
}

export interface Hyperlink {
    readonly target: string
    readonly tooltip: string
}

class HyperlinkImpl implements Hyperlink {
    public target!: string
    public tooltip!: string
}

// tslint:disable: max-classes-per-file
export class HyperlinkBuilder extends Builder<Hyperlink, HyperlinkImpl> {
    public constructor(obj?: Readonly<Hyperlink>) {
        const impl = new HyperlinkImpl()
        if (obj)
            HyperlinkBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public target(target: string): this {
        this.getImpl().target = target
        return this
    }

    public tooltip(tooltip: string): this {
        this.getImpl().tooltip = tooltip
        return this
    }

    protected get daa(): readonly string[] {
        return HyperlinkBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'target',
        'tooltip',
    ]
}

export interface Comment {
    /**
     * the 'a' field
     */
    readonly author: string
    /**
     * the 't' field
     */
    readonly text: string
}

class CommentImpl implements Comment {
    public author!: string
    public text!: string
}

export class CommentBuilder extends Builder<Comment, CommentImpl> {
    public constructor(obj?: Readonly<Comment>) {
        const impl = new CommentImpl()
        if (obj)
            CommentBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public author(author: string): this {
        this.getImpl().author = author
        return this
    }

    public text(text: string): this {
        this.getImpl().text = text
        return this
    }

    protected get daa(): readonly string[] {
        return CommentBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'author',
        'text',
    ]
}

export interface FormulaInfo {
    readonly op: Op
    /**
     * The uuid. Composed by its row id and column id.
     * (api-linter: core::0140::prepositions=disabled)
     */
    readonly inNodes: readonly string[]
    readonly priority: number
}

class FormulaInfoImpl implements FormulaInfo {
    public op!: Op
    public inNodes: readonly string[] = []
    public priority!: number
}

export class FormulaInfoBuilder extends Builder<FormulaInfo, FormulaInfoImpl> {
    public constructor(obj?: Readonly<FormulaInfo>) {
        const impl = new FormulaInfoImpl()
        if (obj)
            FormulaInfoBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public op(op: Op): this {
        this.getImpl().op = op
        return this
    }

    public inNodes(inNodes: readonly string[]): this {
        this.getImpl().inNodes = inNodes
        return this
    }

    public priority(priority: number): this {
        this.getImpl().priority = priority
        return this
    }

    protected get daa(): readonly string[] {
        return FormulaInfoBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'op',
        'priority',
    ]
}

export const enum BaseStyle {
    BASE_STYLE_UNSPECIFIED = 0,
    COLUMN = 1,
    COLUMN_BLOCK = 2,
    ROW = 3,
    ROW_BLOCK = 4,
    TABLE_STUB = 5,
    TABLE_TITLE = 6,
    SHEET_TITLE = 7,
    FORMULA_CELL = 8,
    VALUE_CELL = 9,
    TABLE_END = 10,
    DEFAULT = 11,
    EMPTY = 12,
}

export const enum StyleTag {
    STYLE_TAG_UNSPECIFIED = 0,
    /**
     * The last row of a table.
     */
    LAST_ROW = 1,
    /**
     * The last column of a table.
     */
    LAST_COLUMN = 2,
    FIRST_COLUMN = 3,
    LAST_INTERVAL = 4,
    SCALAR_EXPR = 5,
    SCALAR_EMPTY = 6,
    OTHER_SCALAR = 7,
    /**
     * Remove the top border in this style.
     */
    CLEAR_TOP_BORDER = 20,
    /**
     * Remove the bottom border in this style.
     */
    CLEAR_BOTTOM_BORDER = 21,
    /**
     * Remove the left border in this style.
     */
    CLEAR_LEFT_BORDER = 22,
    /**
     * Remove the right border in this style.
     */
    CLEAR_RIGHT_BORDER = 23,
    ASSUMPTION = 24,
    FACT = 25,
    FX = 26,
    CONSTRAINT = 27,
    ROW_SEPARATOR = 28,
    COL_SEPARATOR = 29,
    CROSS_SEPARATOR = 30,
}
