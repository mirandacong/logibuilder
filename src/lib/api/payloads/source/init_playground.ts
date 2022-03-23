import {Builder} from '@logi/base/ts/common/builder'

import {Payload as Base, PayloadType} from '../payload'

// tslint:disable-next-line: no-empty-interface
export interface Payload extends Base {}

class PayloadImpl implements Payload {
    public payloadType = PayloadType.INIT_PLAYGROUND
}

export class PayloadBuilder extends Builder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}
