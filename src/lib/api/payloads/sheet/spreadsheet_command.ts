import {Builder} from '@logi/base/ts/common/builder'
import {SpreadsheetPayload} from '@logi/src/lib/spreadsheet'

import {PayloadType} from '../payload'

import {SheetPayload} from './payload'

export interface SpreadsheetCommandPayload extends SheetPayload {
    readonly payloads: readonly SpreadsheetPayload[]
}

class SpreadsheetCommandPayloadImpl
    extends SheetPayload implements SpreadsheetCommandPayload {
    public payloads: readonly SpreadsheetPayload[] = []
    public payloadType = PayloadType.SPREADSHEET_COMMAND
}

export class SpreadsheetCommandPayloadBuilder
    extends Builder<SpreadsheetCommandPayload, SpreadsheetCommandPayloadImpl> {
    public constructor(obj?: Readonly<SpreadsheetCommandPayload>) {
        const impl = new SpreadsheetCommandPayloadImpl()
        if (obj)
            SpreadsheetCommandPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public payloads(payloads: readonly SpreadsheetPayload[]): this {
        this.getImpl().payloads = payloads
        return this
    }
}

export function isSpreadsheetCommandPayload(
    value: unknown,
): value is SpreadsheetCommandPayload {
    return value instanceof SpreadsheetCommandPayloadImpl
}
