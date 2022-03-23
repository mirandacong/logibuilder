import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

/**
 * When loading a custom sheet, we should check all the formula in this sheet.
 * Because error formula will panic when we call the fromJSON.
 */
export interface IgnoredFormula {
    readonly sheet: string
    readonly row: number
    readonly col: number
}

class IgnoredFormulaImpl implements Impl<IgnoredFormula> {
    public sheet!: string
    public row!: number
    public col!: number
}

export class IgnoredFormulaBuilder extends
    Builder<IgnoredFormula, IgnoredFormulaImpl> {
    public constructor(obj?: Readonly<IgnoredFormula>) {
        const impl = new IgnoredFormulaImpl()
        if (obj)
            IgnoredFormulaBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public sheet(sheet: string): this {
        this.getImpl().sheet = sheet
        return this
    }

    public row(row: number): this {
        this.getImpl().row = row
        return this
    }

    public col(col: number): this {
        this.getImpl().col = col
        return this
    }

    protected get daa(): readonly string[] {
        return IgnoredFormulaBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'col',
        'row',
        'sheet',
    ]
}

export function isIgnoredFormula(value: unknown): value is IgnoredFormula {
    return value instanceof IgnoredFormulaImpl
}

export function assertIsIgnoredFormula(
    value: unknown,
): asserts value is IgnoredFormula {
    if (!(value instanceof IgnoredFormulaImpl))
        throw Error('Not a IgnoredFormula!')
}

export interface CustomSheet {
    readonly name: string
    readonly content: object
    readonly index: number
    readonly rowCount: number
    readonly colCount: number
}

class CustomSheetImpl implements Impl<CustomSheet> {
    public name!: string
    public content!: object
    public index!: number
    public rowCount!: number
    public colCount!: number
}

export class CustomSheetBuilder extends Builder<CustomSheet, CustomSheetImpl> {
    public constructor(obj?: Readonly<CustomSheet>) {
        const impl = new CustomSheetImpl()
        if (obj)
            CustomSheetBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public content(content: object): this {
        this.getImpl().content = content
        return this
    }

    public index(index: number): this {
        this.getImpl().index = index
        return this
    }

    public rowCount(rowCount: number): this {
        this.getImpl().rowCount = rowCount
        return this
    }

    public colCount(colCount: number): this {
        this.getImpl().colCount = colCount
        return this
    }

    protected get daa(): readonly string[] {
        return CustomSheetBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'name',
        'content',
        'index',
        'rowCount',
        'colCount',
    ]
}

export function isCustomSheet(value: unknown): value is CustomSheet {
    return value instanceof CustomSheetImpl
}

export function assertIsCustomSheet(
    value: unknown,
): asserts value is CustomSheet {
    if (!(value instanceof CustomSheetImpl))
        throw Error('Not a CustomSheet!')
}
