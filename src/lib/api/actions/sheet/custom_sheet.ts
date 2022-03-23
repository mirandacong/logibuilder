import {Builder} from '@logi/base/ts/common/builder'
import {
    Payload,
    SpreadsheetCommandPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {SpreadsheetPayload} from '@logi/src/lib/spreadsheet'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface CustomSheetAction extends Base {
    readonly payloads: readonly SpreadsheetPayload[]
}

class CustomSheetActionImpl implements CustomSheetAction {
    public payloads: readonly SpreadsheetPayload[] = []
    public actionType = ActionType.CUSTOM_SHEET
    public getPayloads(): readonly Payload[] {
        return [new SpreadsheetCommandPayloadBuilder()
            .payloads(this.payloads)
            .build()]
    }
}

export class CustomSheetActionBuilder
    extends Builder<CustomSheetAction, CustomSheetActionImpl> {
    public constructor(obj?: Readonly<CustomSheetAction>) {
        const impl = new CustomSheetActionImpl()
        if (obj)
            CustomSheetActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public payloads(payloads: readonly SpreadsheetPayload[]): this {
        this.getImpl().payloads = payloads
        return this
    }
}
