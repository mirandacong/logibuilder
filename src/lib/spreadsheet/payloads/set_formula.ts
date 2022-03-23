import {Builder, CellRange, RangePayload} from './range'

export interface SetFormulaPayload extends RangePayload {
    readonly range: CellRange
    readonly formula: string
}

class SetFormulaPayloadImpl
    extends RangePayload implements SetFormulaPayload {
    public range!: CellRange
    public formula!: string
}

export class SetFormulaPayloadBuilder
    extends Builder<SetFormulaPayload, SetFormulaPayloadImpl> {
    public constructor(obj?: Readonly<SetFormulaPayload>) {
        const impl = new SetFormulaPayloadImpl()
        if (obj)
            SetFormulaPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public range(range: CellRange): this {
        this.getImpl().range = range
        return this
    }

    public formula(formula: string): this {
        this.getImpl().formula = formula
        return this
    }

    protected get daa(): readonly string[] {
        return SetFormulaPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'range',
        'formula',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isSetFormulaPayload(
    value: unknown,
): value is SetFormulaPayload {
    return value instanceof SetFormulaPayloadImpl
}
