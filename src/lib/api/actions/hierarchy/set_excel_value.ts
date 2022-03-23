// tslint:disable-next-line: no-wildcard-import
import * as GC from '@grapecity/spread-sheets'
import {Builder} from '@logi/base/ts/common/builder'
import {isException} from '@logi/base/ts/common/exception'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {
    DryRunCommandPayloadBuilder,
    Payload,
    SetFormulaPayloadBuilder,
    SetNamePayloadBuilder,
    SetSourcePayloadBuilder,
    SpreadsheetCommandPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {isColumnBlock, isFormulaBearer} from '@logi/src/lib/hierarchy/core'
import {ManualSourceBuilder} from '@logi/src/lib/source'
import {
    CellRangeBuilder,
    SetFormulaPayloadBuilder as SetSpreadsheetFormulaBuilder,
    SetValuePayloadBuilder,
    SpreadsheetPayload,
} from '@logi/src/lib/spreadsheet'

import {ActionType} from '../type'

import {Action as Base} from './base'
import {renameReferenceNode} from './lib'

export interface Action extends Base {
    readonly sheetName: string
    readonly positions: readonly (readonly [number, number])[]
}

class ActionImpl implements Impl<Action> {
    public sheetName!: string
    public positions: readonly (readonly [number, number])[] = []
    public actionType = ActionType.SET_EXCEL_VALUE

    // tslint:disable-next-line: max-func-body-length
    public getPayloads(service: EditorService): readonly Payload[] {
        const sheet = service.excel.getSheetFromName(this.sheetName)
        if (sheet === null)
            return []
        const isHierarchy = service.book.sheets
            .find(s => s.name === this.sheetName) !== undefined
        const payloads: Payload[] = []
        payloads.push(new DryRunCommandPayloadBuilder().build())
        if (!isHierarchy) {
            const ssPayloads: SpreadsheetPayload[] = []
            this.positions.forEach((pos: readonly [number, number]): void => {
                const cell = sheet.getCell(pos[0], pos[1])
                const range = new CellRangeBuilder()
                    .row(pos[0])
                    .col(pos[1])
                    .build()
                const formula = cell.formula() ?? ''
                if (formula !== '') {
                    ssPayloads.push(new SetSpreadsheetFormulaBuilder()
                        // tslint:disable: limit-indent-for-method-in-class
                        .sheet(this.sheetName)
                        .range(range)
                        .formula(formula)
                        .build())
                    return
                }
                ssPayloads.push(new SetValuePayloadBuilder()
                    .sheet(this.sheetName)
                    .range(range)
                    .value(cell.value() ?? '')
                    .build())
            })
            payloads.push(new SpreadsheetCommandPayloadBuilder()
                .payloads(ssPayloads)
                .build())
            return payloads
        }
        this.positions.forEach((pos: readonly [number, number]): void => {
            const row = pos[0]
            const col = pos[1]
            const cell = sheet.getCell(row, col)
            const cellPos = service.hsfManager.getCell(this.sheetName, row, col)
            if (!isException(cellPos))
                payloads.push(
                    ...getSetSourcePayload(cellPos[0], cellPos[1], cell),
                )
            const uuid = service.hsfManager
                .getNode(this.sheetName, row, col, false)
            if (uuid !== undefined)
                payloads.push(...getSetNamePayload(uuid, cell, service))
        })
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

    public sheetName(sheetName: string): this {
        this.getImpl().sheetName = sheetName
        return this
    }

    public positions(positions: readonly (readonly [number, number])[]): this {
        this.getImpl().positions = positions
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'sheetName',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}

function getSetNamePayload(
    uuid: string,
    cell: GC.Spread.Sheets.CellRange,
    service: EditorService,
): readonly Payload[] {
    const payloads: Payload[] = []
    const node = service.bookMap.get(uuid)
    if (!isFormulaBearer(node) && !isColumnBlock(node))
        return []
    const value = cell.value()
    if (value === null)
        return []
    const newName = String(value)
    if (newName === node.name)
        return []
    payloads.push(new SetNamePayloadBuilder().uuid(uuid).name(newName).build())
    payloads.push(...renameReferenceNode(node, newName, service))
    return payloads
}

function getSetSourcePayload(
    row: string,
    col: string,
    cell: GC.Spread.Sheets.CellRange,
): readonly Payload[] {
    const payloads: Payload[] = []
    const formula = cell.formula() ?? ''
    const setFormula = new SetFormulaPayloadBuilder()
        .row(row)
        .col(col)
        .formula(formula)
        .build()
    payloads.push(setFormula)
    if (formula !== '')
        return payloads
    const value = cell.value() ?? ''
    const setSource = new SetSourcePayloadBuilder()
        .row(row)
        .col(col)
        .source(new ManualSourceBuilder().value(value).build())
        .build()
    payloads.push(setSource)
    return payloads
}
