import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {CoverData} from '@logi/src/lib/hsf'

import {Payload, PayloadType} from './payload'

export interface DownloadPayload extends Payload {
    readonly logi: boolean
    readonly excel: boolean
    readonly zip: boolean
    readonly txt: boolean
    readonly data?: CoverData
}

class DownloadPayloadImpl implements Impl<DownloadPayload> {
    public logi = false
    public excel = false
    public zip = false
    public txt = false
    public data?: CoverData
    public payloadType = PayloadType.DOWNLOAD
}

export class DownloadPayloadBuilder extends
    Builder<DownloadPayload, DownloadPayloadImpl> {
    public constructor(obj?: Readonly<DownloadPayload>) {
        const impl = new DownloadPayloadImpl()
        if (obj)
            DownloadPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public logi(logi: boolean): this {
        this.getImpl().logi = logi
        return this
    }

    public excel(excel: boolean): this {
        this.getImpl().excel = excel
        return this
    }

    public zip(zip: boolean): this {
        this.getImpl().zip = zip
        return this
    }

    public txt(txt: boolean): this {
        this.getImpl().txt = txt
        return this
    }

    public data(data?: CoverData): this {
        this.getImpl().data = data
        return this
    }
}

export function isDownloadPayload(value: unknown): value is DownloadPayload {
    return value instanceof DownloadPayloadImpl
}

export function assertIsDownloadPayload(
    value: unknown,
): asserts value is DownloadPayload {
    if (!(value instanceof DownloadPayloadImpl))
        throw Error('Not a DownloadPayload!')
}
