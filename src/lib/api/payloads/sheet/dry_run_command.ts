import {Builder} from '@logi/base/ts/common/builder'

import {PayloadType} from '../payload'

import {SheetPayload} from './payload'

// tslint:disable-next-line: no-empty-interface
export interface DryRunCommandPayload extends SheetPayload {}

class DryRunCommandPayloadImpl implements SheetPayload {
    public payloadType = PayloadType.DRY_RUN_COMMAND
}

export class DryRunCommandPayloadBuilder
    extends Builder<DryRunCommandPayload, DryRunCommandPayloadImpl> {
    public constructor(obj?: Readonly<DryRunCommandPayload>) {
        const impl = new DryRunCommandPayloadImpl()
        if (obj)
            DryRunCommandPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }
}

export function isDryRunCommandPayload(
    value: unknown,
): value is DryRunCommandPayload {
    return value instanceof DryRunCommandPayloadImpl
}
