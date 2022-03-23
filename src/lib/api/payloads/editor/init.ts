import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Payload, PayloadType} from '../payload'

/**
 * A payload indicating some plugins to init.
 */
// tslint:disable-next-line: no-empty-interface
export interface InitPayload extends Payload {}

class InitPayloadImpl implements Impl<InitPayload> {
    public payloadType = PayloadType.INIT
}

export class InitPayloadBuilder extends Builder<InitPayload, InitPayloadImpl> {
    public constructor(obj?: Readonly<InitPayload>) {
        const impl = new InitPayloadImpl()
        if (obj)
            InitPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }
}

export function isInitPayload(value: unknown): value is InitPayload {
    return value instanceof InitPayloadImpl
}

export function assertIsInitPayload(
    value: unknown,
): asserts value is InitPayload {
    if (!(value instanceof InitPayloadImpl))
        throw Error('Not a InitPayload!')
}
