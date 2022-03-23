import {Underline} from '@logi/base/ts/common/excel'

import {Builder, CellRange, RangePayload} from './range'

export interface SetUnderlinePayload extends RangePayload {
    readonly range: CellRange
    readonly underline: Underline
}

class SetUnderlinePayloadImpl
    extends RangePayload implements SetUnderlinePayload {
    public range!: CellRange
    public underline!: Underline
}

export class SetUnderlinePayloadBuilder
    extends Builder<SetUnderlinePayload, SetUnderlinePayloadImpl> {
    public constructor(obj?: Readonly<SetUnderlinePayload>) {
        const impl = new SetUnderlinePayloadImpl()
        if (obj)
            SetUnderlinePayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public range(range: CellRange): this {
        this.getImpl().range = range
        return this
    }

    public underline(underline: Underline): this {
        this.getImpl().underline = underline
        return this
    }

    protected get daa(): readonly string[] {
        return SetUnderlinePayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'range',
        'underline',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isSetUnderlinePayload(
    value: unknown,
): value is SetUnderlinePayload {
    return value instanceof SetUnderlinePayloadImpl
}
