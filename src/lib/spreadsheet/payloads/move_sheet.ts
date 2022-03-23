import {Builder, SpreadsheetPayload} from './base'

export interface MoveSheetPayload extends SpreadsheetPayload {
    readonly newPos: number
}

class MoveSheetPayloadImpl
    extends SpreadsheetPayload implements MoveSheetPayload {
    public newPos!: number
}

export class MoveSheetPayloadBuilder
    extends Builder<MoveSheetPayload, MoveSheetPayloadImpl> {
    public constructor(obj?: Readonly<MoveSheetPayload>) {
        const impl = new MoveSheetPayloadImpl()
        if (obj)
            MoveSheetPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public newPos(newPos: number): this {
        this.getImpl().newPos = newPos
        return this
    }

    protected get daa(): readonly string[] {
        return MoveSheetPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'newPos',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isMoveSheetPayload(value: unknown): value is MoveSheetPayload {
    return value instanceof MoveSheetPayloadImpl
}
