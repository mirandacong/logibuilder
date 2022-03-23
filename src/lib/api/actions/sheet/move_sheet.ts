import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {
    MoveSheetPayloadBuilder,
    Payload,
    SpreadsheetCommandPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {Sheet} from '@logi/src/lib/hierarchy/core'
import {
    MoveSheetPayloadBuilder as MoveSpreadsheetPayloadBuilder,
} from '@logi/src/lib/spreadsheet'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    readonly sheetName: string
    /**
     * The position ignores the moving sheet.
     */
    readonly position: number
}

class ActionImpl implements Impl<Action> {
    public sheetName!: string
    public position!: number
    public actionType = ActionType.MOVE_SHEET
    public getPayloads(service: EditorService): readonly Payload[] {
        const payloads: Payload[] = []

        const book = service.book
        const sheetIdx = book.sheets.findIndex((s: Readonly<Sheet>): boolean =>
            s.name === this.sheetName)
        const tabs = service.sheetTabs().sheetTabs
        const hiePos = sheetIdx < 0
            ? undefined
            : tabs
                .filter((t => t.name !== this.sheetName))
                .slice(0, this.position)
                .filter(t => !t.isCustom)
                .length
        if (hiePos === undefined) {
            payloads.push(new SpreadsheetCommandPayloadBuilder()
                .payloads([new MoveSpreadsheetPayloadBuilder()
                    .sheet(this.sheetName)
                    .newPos(this.position)
                    .build()])
                .build())
            return payloads
        }
        const oriPos = service.excel.getSheetIndex(this.sheetName)
        const moveExcel = new MoveSheetPayloadBuilder()
            .name(this.sheetName)
            .hierarchyPos(hiePos)
            .position(this.position)
            .oriPos(oriPos)
            .build()
        payloads.push(moveExcel)
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

    public position(position: number): this {
        this.getImpl().position = position
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'sheetName',
        'position',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
