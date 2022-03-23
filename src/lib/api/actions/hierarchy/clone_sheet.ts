import {Builder} from '@logi/base/ts/common/builder'
import {Impl, Writable} from '@logi/base/ts/common/mapped_types'
import {AddSheetPayloadBuilder, Payload} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {isBook, isSheet, Sheet} from '@logi/src/lib/hierarchy/core'
import {getCloneResult} from '@logi/src/lib/model'

import {ActionType} from '../type'

import {Action as Base} from './base'
import {getPayloadsFromCloneResult} from './lib'

export interface Action extends Base {
    readonly sheet: string
}

class ActionImpl implements Impl<Action> {
    public sheet!: string

    public actionType = ActionType.CLONE_SHEET

    public getPayloads(service: Readonly<EditorService>): readonly Payload[] {
        const nodesMap = service.bookMap
        const payloads: Payload[] = []
        const sheet = nodesMap.get(this.sheet)
        const book = sheet?.parent
        if (!isSheet(sheet) || !isBook(book))
            return []
        let count = 1
        let name = `${sheet.name} (${count})`
        const names = service.excel.sheets.map(s => s.name())
        while (names.includes(name)) {
            count += 1
            name = `${sheet.name} (${count})`
        }
        const res = getCloneResult(
            sheet,
            service.modifierManager,
            service.sourceManager,
            service.formulaManager,
        )
        const clonePs = getPayloadsFromCloneResult(res)
        // tslint:disable-next-line: no-type-assertion
        const cloned = res.clonedNode as Writable<Sheet>
        payloads.push(...clonePs)
        cloned.name = name
        const excelPos = service.excel.getSheetIndex(sheet.name)
        const addExcelSheet = new AddSheetPayloadBuilder()
            .name(name)
            .position(excelPos + 1)
            .hierarchyPos(book.sheets.indexOf(sheet) + 1)
            .sheet(cloned)
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

    public sheet(sheet: string): this {
        this.getImpl().sheet = sheet
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'sheet',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
