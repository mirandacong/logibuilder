import {Builder, SpreadsheetPayload} from './base'

export interface RemoveColPayload extends SpreadsheetPayload {
    readonly col: number
    readonly count: number
}

class RemoveColPayloadImpl
    extends SpreadsheetPayload implements RemoveColPayload {
    public col!: number
    public count!: number
}

export class RemoveColPayloadBuilder
    extends Builder<RemoveColPayload, RemoveColPayloadImpl> {
    public constructor(obj?: Readonly<RemoveColPayload>) {
        const impl = new RemoveColPayloadImpl()
        if (obj)
            RemoveColPayloadBuilder.shallowCopy(impl, obj)
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
        return RemoveColPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'col',
        'count',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isRemoveColPayload(value: unknown): value is RemoveColPayload {
    return value instanceof RemoveColPayloadImpl
}
