import {Builder, SpreadsheetPayload} from './base'

export interface AddColPayload extends SpreadsheetPayload {
    readonly col: number
    readonly count: number
}

class AddColPayloadImpl extends SpreadsheetPayload implements AddColPayload {
    public col!: number
    public count!: number
}

export class AddColPayloadBuilder
    extends Builder<AddColPayload, AddColPayloadImpl> {
    public constructor(obj?: Readonly<AddColPayload>) {
        const impl = new AddColPayloadImpl()
        if (obj)
            AddColPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public col(col: number): this {
        this.getImpl().col = col
        return this
    }

    public count(count: number): this {
        this.getImpl().count = count
        return this
    }

    protected get daa(): readonly string[] {
        return AddColPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'col',
        'count',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isAddColPayload(value: unknown): value is AddColPayload {
    return value instanceof AddColPayloadImpl
}
