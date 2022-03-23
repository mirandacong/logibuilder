import {Builder} from '@logi/base/ts/common/builder'

export interface CellValue {
    readonly row: string
    readonly col: string
    readonly value: number | null
}

class CellValueImpl implements CellValue {
    public row!: string
    public col!: string
    public value!: number | null
}

export class CellValueBuilder extends Builder<CellValue, CellValueImpl> {
    public constructor(obj?: Readonly<CellValue>) {
        const impl = new CellValueImpl()
        if (obj)
            CellValueBuilder.shallowCopy(impl, obj)
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

    public value(value: number | null): this {
        this.getImpl().value = value
        return this
    }

    protected get daa(): readonly string[] {
        return CellValueBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'col',
        'value',
    ]
}

export function isCellValue(value: unknown): value is CellValue {
    return value instanceof CellValueImpl
}

export interface CellHistory {
    readonly value: number | null
    readonly formula: string | null
}

class CellHistoryImpl implements CellHistory {
    public value!: number | null
    public formula!: string | null
}

export class CellHistoryBuilder extends Builder<CellHistory, CellHistoryImpl> {
    public constructor(obj?: Readonly<CellHistory>) {
        const impl = new CellHistoryImpl()
        if (obj)
            CellHistoryBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public value(value: number | null): this {
        this.getImpl().value = value
        return this
    }

    public formula(formula: string | null): this {
        this.getImpl().formula = formula
        return this
    }

    protected get daa(): readonly string[] {
        return CellHistoryBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'value',
        'formula',
    ]
}
