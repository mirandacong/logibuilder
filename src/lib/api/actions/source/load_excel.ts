// tslint:disable-next-line: no-import-side-effect
import '@logi/base/ts/spreadjs/spreadjs_init'

// tslint:disable-next-line: no-wildcard-import ordered-imports
import * as GC from '@grapecity/spread-sheets'
import {Builder} from '@logi/base/ts/common/builder'
import {Address} from '@logi/base/ts/common/excel'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {LoadExcelNoticeBuilder} from '@logi/src/lib/api/notice'
import {
    Payload,
    RenderPayloadBuilder,
    SetFormulaPayloadBuilder,
    SetSourcePayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {DataCell, HsfManager, StyleTag} from '@logi/src/lib/hsf'
import {ManualSourceBuilder, SourceManager} from '@logi/src/lib/source'
import {Observable, of} from 'rxjs'
import {catchError, map} from 'rxjs/operators'

import {Action as Base} from '../action'
import {getCustomSheetPayloads, openExcel} from '../lib'
import {ActionType} from '../type'

type Worksheet = GC.Spread.Sheets.Worksheet

/**
 * Indicating that updating the sources by loading an excel file.
 * Besides, this action will add custom sheets which should be shown after
 * rendering.
 */
export interface Action extends Base {
    readonly excel: ArrayBuffer
}

class ActionImpl implements Impl<Action> {
    public excel!: ArrayBuffer
    public actionType = ActionType.LOAD_EXCEL

    public getPayloads(service: EditorService): Observable<readonly Payload[]> {
        return openExcel(this.excel).pipe(
            map(wb => {
                const payloads: Payload[] = []
                payloads.push(...getSourcePayloads(service, wb))
                payloads.push(...getCustomSheetPayloads(wb, service.book))
                const render = new RenderPayloadBuilder().build()
                payloads.push(render)
                return payloads
            }),
            catchError((): Observable<readonly Payload[]> => {
                const notice = new LoadExcelNoticeBuilder()
                    .msg('读取失败，该文件或已损坏')
                    .actionType(ActionType.LOAD_EXCEL)
                    .success(false)
                    .build()
                service.noticeEmitter$.next(notice)
                return of([])
            }),
        )
    }
}

export class ActionBuilder extends Builder<Action, ActionImpl> {
    public constructor(obj?: Readonly<Action>) {
        const impl = new ActionImpl()
        if (obj)
            ActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public excel(excel: ArrayBuffer): this {
        this.getImpl().excel = excel
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'excel',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}

export function getSourcePayloads(
    service: EditorService,
    wb: GC.Spread.Sheets.Workbook,
): readonly Payload[] {
    const payloads: Payload[] = []
    const book = service.book
    wb.sheets.forEach((ws: Worksheet): void => {
        const hierarchySheet = book.sheets.find(s => s.name === ws.name())
        if (hierarchySheet === undefined)
            return
        const sps = getSheetSourcePayloads(
            service.sourceManager,
            service.hsfManager,
            ws,
        )
        payloads.push(...sps)
    })
    return payloads
}

/**
 * Export this function only for test.
 */
export function getSheetSourcePayloads(
    sm: SourceManager,
    hsf: HsfManager,
    ws: Worksheet,
): readonly Payload[] {
    const filter = (dc: DataCell): boolean =>
        dc.tags.includes(StyleTag.ASSUMPTION) ||
        dc.tags.includes(StyleTag.FACT)
    const dataCellInfos = hsf.findDataCells(ws.name(), filter)
    const payloads: Payload[] = []
    dataCellInfos.forEach((info: readonly [DataCell, Address]): void => {
        const dc = info[0]
        const addr = info[1]
        const formula = ws.getFormula(addr.row, addr.col)
        if (formula !== null) {
            const setFormula = new SetFormulaPayloadBuilder()
                .row(dc.row)
                .col(dc.col)
                .formula(formula)
                .build()
            payloads.push(setFormula)
            return
        }
        const v1 = ws.getValue(addr.row, addr.col)
        if (v1 === null)
            return
        const v2 = sm.getSource(dc.row, dc.col)?.value
        if (v1 === v2)
            return
        const source = new ManualSourceBuilder().value(v1).build()
        const payload = new SetSourcePayloadBuilder()
            .row(dc.row)
            .col(dc.col)
            .source(source)
            .build()
        payloads.push(payload)
    })
    return payloads
}
