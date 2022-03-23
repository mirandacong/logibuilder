import {Builder, SpreadsheetPayload} from './base'

export interface RemoveRowPayload extends SpreadsheetPayload {
    readonly row: number
    readonly count: number
}

class RemoveRowPayloadImpl
    extends SpreadsheetPayload implements RemoveRowPayload {
    public row!: number
    public count!: number
}

export class RemoveRowPayloadBuilder
    extends Builder<RemoveRowPayload, RemoveRowPayloadImpl> {
    public constructor(obj?: Readonly<RemoveRowPayload>) {
        const impl = new RemoveRowPayloadImpl()
        if (obj)
            RemoveRowPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: number): this {
        this.getImpl().row = row
        return this
    }

    public count(count: number): this {
        this.getImpl().count = count
        return this
    }

    protected get daa(): readonly string[] {
        return RemoveRowPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'count',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isRemoveRowPayload(value: unknown): value is RemoveRowPayload {
    return value instanceof RemoveRowPayloadImpl
}
