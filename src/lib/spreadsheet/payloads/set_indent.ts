import {Builder, CellRange, RangePayload} from './range'

export interface SetIndentPayload extends RangePayload {
    readonly range: CellRange
    readonly indent: number
}

class SetIndentPayloadImpl
    extends RangePayload implements SetIndentPayload {
    public range!: CellRange
    public indent!: number
}

export class SetIndentPayloadBuilder
    extends Builder<SetIndentPayload, SetIndentPayloadImpl> {
    public constructor(obj?: Readonly<SetIndentPayload>) {
        const impl = new SetIndentPayloadImpl()
        if (obj)
            SetIndentPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public range(range: CellRange): this {
        this.getImpl().range = range
        return this
    }

    public indent(indent: number): this {
        this.getImpl().indent = indent
        return this
    }

    protected get daa(): readonly string[] {
        return SetIndentPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'range',
        'indent',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isSetIndentPayload(value: unknown): value is SetIndentPayload {
    return value instanceof SetIndentPayloadImpl
}
