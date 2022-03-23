import {Builder} from '@logi/base/ts/common/builder'
export interface FormulaItem {
    readonly row: string
    readonly col: string
    readonly formula: string
}

class FormulaItemImpl implements FormulaItem {
    public row!: string
    public col!: string
    public formula!: string
}

export class FormulaItemBuilder extends Builder<FormulaItem, FormulaItemImpl> {
    public constructor(obj?: Readonly<FormulaItem>) {
        const impl = new FormulaItemImpl()
        if (obj)
            FormulaItemBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public col(col: string): this {
        this.getImpl().col = col
        return this
    }

    public formula(formula: string): this {
        this.getImpl().formula = formula
        return this
    }

    protected get daa(): readonly string[] {
        return FormulaItemBuilder.__DAA_PROPS__
    }

    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'col',
        'formula',
    ]
}

export function isFormulaItem(value: unknown): value is FormulaItem {
    return value instanceof FormulaItemImpl
}

export function assertIsFormulaItem(
    value: unknown
): asserts value is FormulaItem {
    if (!(value instanceof FormulaItemImpl))
        throw Error('Not a FormulaItem!')
}
