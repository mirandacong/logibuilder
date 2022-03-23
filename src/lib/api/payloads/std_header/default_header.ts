import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {PayloadType} from '../payload'

import {Payload as Base} from './payload'

export interface Payload extends Base {
    /**
     * When user cancel setting default header, this field should be undefined.
     */
    readonly defaultHeader: string | undefined
}

class PayloadImpl extends Base implements Impl<Payload> {
    public defaultHeader: string | undefined
    public payloadType = PayloadType.DEFAULT_HEADER
}

export class PayloadBuilder extends Builder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    // tslint:disable-next-line: no-optional-parameter
    public defaultHeader(defaultHeader: string | undefined): this {
        this.getImpl().defaultHeader = defaultHeader
        return this
    }
}

export function isPayload(obj: unknown): obj is Payload {
    return obj instanceof PayloadImpl
}
