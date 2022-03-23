import {Builder} from '@logi/base/ts/common/builder'
import {AddSheetPayloadBuilder, Payload} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {SheetBuilder} from '@logi/src/lib/hierarchy/core'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    readonly position?: number
}

class ActionImpl implements Action {
    public position?: number
    public actionType = ActionType.ADD_SHEET
    public getPayloads(service: EditorService): readonly Payload[] {
        let count = service.excel.sheets.length + 1
        let name = `工作表${count}`
        const names = service.excel.sheets.map(s => s.name())
        while (names.includes(name)) {
            count += 1
            name = `工作表${count}`
        }
        const payloads: Payload[] = []
        const tabs = service.sheetTabs().sheetTabs
        const pos = this.position ?? tabs.length
        const hiePos = tabs.slice(0, pos).filter(t => !t.isCustom).length
        const sheet = new SheetBuilder().name(name).build()
        const addExcelSheet = new AddSheetPayloadBuilder()
            .name(name)
            .position(pos)
            .hierarchyPos(hiePos)
            .sheet(sheet)
            .build()
        payloads.push(addExcelSheet)
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

    public position(position: number): this {
        this.getImpl().position = position
        return this
    }
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
