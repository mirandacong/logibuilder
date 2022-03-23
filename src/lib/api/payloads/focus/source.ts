import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Payload as Base, PayloadType} from '../payload'

export interface FocusSourcePayload extends Base {
    readonly row: string
    readonly col: string
}

class FocusSourcePayloadImpl implements Impl<FocusSourcePayload> {
    public row!: string
    public col!: string
    public payloadType = PayloadType.FOCUS_SOURCE
}

export class FocusSourcePayloadBuilder extends
    Builder<FocusSourcePayload, FocusSourcePayloadImpl> {
    public constructor(obj?: Readonly<FocusSourcePayload>) {
        const impl = new FocusSourcePayloadImpl()
        if (obj)
            FocusSourcePayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public col(col: string): this {
        this.getImpl().col = col
        return this
    }

    protected get daa(): readonly string[] {
        return FocusSourcePayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'col',
    ]
}

export function isFocusSourcePayload(
    value: unknown,
): value is FocusSourcePayload {
    return value instanceof FocusSourcePayloadImpl
}

export function assertIsFocusSourcePayload(
    value: unknown,
): asserts value is FocusSourcePayload {
    if (!(value instanceof FocusSourcePayloadImpl))
        throw Error('Not a FocusSourcePayload!')
}
