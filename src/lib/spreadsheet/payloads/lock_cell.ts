import {Builder, CellRange, RangePayload} from './range'

export interface LockCellPayload extends RangePayload {
    readonly range: CellRange
    readonly lock: boolean
}

class LockCellPayloadImpl
    extends RangePayload implements LockCellPayload {
    public range!: CellRange
    public lock!: boolean
}

export class LockCellPayloadBuilder
    extends Builder<LockCellPayload, LockCellPayloadImpl> {
    public constructor(obj?: Readonly<LockCellPayload>) {
        const impl = new LockCellPayloadImpl()
        if (obj)
            LockCellPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public range(range: CellRange): this {
        this.getImpl().range = range
        return this
    }

    public lock(lock: boolean): this {
        this.getImpl().lock = lock
        return this
    }

    protected get daa(): readonly string[] {
        return LockCellPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'range',
        'lock',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isLockCellPayload(value: unknown): value is LockCellPayload {
    return value instanceof LockCellPayloadImpl
}
