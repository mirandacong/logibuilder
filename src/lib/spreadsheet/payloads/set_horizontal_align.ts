import {Horizontal} from '@logi/base/ts/common/excel'

import {Builder, CellRange, RangePayload} from './range'

export interface SetHorizontalAlignPayload extends RangePayload {
    readonly range: CellRange
    readonly horizontalAlign: Horizontal
}

class SetHorizontalAlignPayloadImpl
    extends RangePayload implements SetHorizontalAlignPayload {
    public range!: CellRange
    public horizontalAlign!: Horizontal
}

export class SetHorizontalAlignPayloadBuilder
    extends Builder<SetHorizontalAlignPayload, SetHorizontalAlignPayloadImpl> {
    public constructor(obj?: Readonly<SetHorizontalAlignPayload>) {
        const impl = new SetHorizontalAlignPayloadImpl()
        if (obj)
            SetHorizontalAlignPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public range(range: CellRange): this {
        this.getImpl().range = range
        return this
    }

    public horizontalAlign(horizontalAlign: Horizontal): this {
        this.getImpl().horizontalAlign = horizontalAlign
        return this
    }

    protected get daa(): readonly string[] {
        return SetHorizontalAlignPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'range',
        'horizontalAlign',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isSetHorizontalAlignPayload(
    value: unknown,
): value is SetHorizontalAlignPayload {
    return value instanceof SetHorizontalAlignPayloadImpl
}
