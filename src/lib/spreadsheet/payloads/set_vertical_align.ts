import {Vertical} from '@logi/base/ts/common/excel'

import {Builder, CellRange, RangePayload} from './range'

export interface SetVerticalAlignPayload extends RangePayload {
    readonly range: CellRange
    readonly verticalAlign: Vertical
}

class SetVerticalAlignPayloadImpl
    extends RangePayload implements SetVerticalAlignPayload {
    public range!: CellRange
    public verticalAlign!: Vertical
}

export class SetVerticalAlignPayloadBuilder
    extends Builder<SetVerticalAlignPayload, SetVerticalAlignPayloadImpl> {
    public constructor(obj?: Readonly<SetVerticalAlignPayload>) {
        const impl = new SetVerticalAlignPayloadImpl()
        if (obj)
            SetVerticalAlignPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public range(range: CellRange): this {
        this.getImpl().range = range
        return this
    }

    public verticalAlign(verticalAlign: Vertical): this {
        this.getImpl().verticalAlign = verticalAlign
        return this
    }

    protected get daa(): readonly string[] {
        return SetVerticalAlignPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'range',
        'verticalAlign',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isSetVerticalAlignPayload(
    value: unknown,
): value is SetVerticalAlignPayload {
    return value instanceof SetVerticalAlignPayloadImpl
}
