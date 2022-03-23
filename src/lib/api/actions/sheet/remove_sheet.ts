import {Builder} from '@logi/base/ts/common/builder'
import {
    Payload,
    RemoveSheetPayloadBuilder,
    SpreadsheetCommandPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {
    RemoveSheetPayloadBuilder as RemoveSpreadsheetPayloadBuilder,
} from '@logi/src/lib/spreadsheet'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    readonly name: string
}

class ActionImpl implements Action {
    public name!: string
    public actionType = ActionType.REMOVE_SHEET
    public getPayloads(service: EditorService): readonly Payload[] {
        const payloads: Payload[] = []
        const index = service.excel.getSheetIndex(this.name)
        if (service.book.sheets.find(s => s.name === this.name) === undefined) {
            payloads.push(new SpreadsheetCommandPayloadBuilder()
                .payloads([new RemoveSpreadsheetPayloadBuilder()
                    .sheet(this.name)
                    .build()])
                .build())
            return payloads
        }
        const removeExcel = new RemoveSheetPayloadBuilder()
            .name(this.name)
            .index(index)
            .build()
        payloads.push(removeExcel)
        return payloads
    }
}

export class ActionBuilder extends Builder<Action, ActionImpl> {
    public constructor(obj?: Readonly<Action>) {
        const impl = new ActionImpl()
        if (obj)
            ActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'name',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
