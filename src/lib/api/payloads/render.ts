import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Payload, PayloadType} from './payload'

export interface RenderPayload extends Payload {
    /**
     * Only render hsf book, and don't render workbook.
     */
    readonly hsfOnly: boolean
    /**
     * Only render the logi sheets in workbook.
     */
    readonly logiOnly: boolean
}

// tslint:disable-next-line: no-empty-class
class RenderPayloadImpl implements Impl<RenderPayload> {
    public hsfOnly = false
    public logiOnly = false
    public payloadType = PayloadType.RENDER
}

export class RenderPayloadBuilder extends
    Builder<RenderPayload, RenderPayloadImpl> {
    public constructor(obj?: Readonly<RenderPayload>) {
        const impl = new RenderPayloadImpl()
        if (obj)
            RenderPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public hsfOnly(hsfOnly: boolean): this {
        this.getImpl().hsfOnly = hsfOnly
        return this
    }

    public logiOnly(logiOnly: boolean): this {
        this.getImpl().logiOnly = logiOnly
        return this
    }
}

export function isRenderPayload(value: unknown): value is RenderPayload {
    return value instanceof RenderPayloadImpl
}

export function assertIsRenderPayload(
    value: unknown,
): asserts value is RenderPayload {
    if (!(value instanceof RenderPayloadImpl))
        throw Error('Not a RenderPayload!')
}
