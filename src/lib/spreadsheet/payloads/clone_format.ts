import {Builder, SpreadsheetPayload} from './base'
import {CellRange} from './range'

export interface CloneFormatPayload extends SpreadsheetPayload {
    readonly source: CellRange
    readonly target: CellRange
}

class CloneFormatPayloadImpl
    extends SpreadsheetPayload implements CloneFormatPayload {
    public source!: CellRange
    public target!: CellRange
}

export class CloneFormatPayloadBuilder
    extends Builder<CloneFormatPayload, CloneFormatPayloadImpl> {
    public constructor(obj?: Readonly<CloneFormatPayload>) {
        const impl = new CloneFormatPayloadImpl()
        if (obj)
            CloneFormatPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public source(source: CellRange): this {
        this.getImpl().source = source
        return this
    }

    public target(target: CellRange): this {
        this.getImpl().target = target
        return this
    }

    protected get daa(): readonly string[] {
        return CloneFormatPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'source',
        'target',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isCloneFormatPayload(
    value: unknown,
): value is CloneFormatPayload {
    return value instanceof CloneFormatPayloadImpl
}
