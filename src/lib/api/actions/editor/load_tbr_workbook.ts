// tslint:disable-next-line: no-import-side-effect
import '@logi/base/ts/spreadjs/spreadjs_init'
// tslint:disable-next-line: no-wildcard-import ordered-imports
import * as GC from '@grapecity/spread-sheets'
import {Builder} from '@logi/base/ts/common/builder'
import {Payload, RenderPayloadBuilder} from '@logi/src/lib/api/payloads'
import {LoaderService} from '@logi/src/lib/api/services'

import {Action as Base} from '../action'
import {getCustomSheetPayloads} from '../lib'
import {ActionType} from '../type'

type Workbook = GC.Spread.Sheets.Workbook

export interface Action extends Base {
    readonly workbook: Workbook
    readonly customSheets: readonly string[]
}

class ActionImpl implements Action {
    public workbook!: Workbook
    public customSheets: readonly string[] = []
    public actionType = ActionType.LOAD_TBR_WORKBOOK
    public getPayloads(service: LoaderService): readonly Payload[] {
        const payloads: Payload[] = []
        const sheets = this.workbook.sheets.map(s => s.name())
        sheets.forEach((sn: string): void => {
            if (this.customSheets.includes(sn))
                return
            const idx = this.workbook.getSheetIndex(sn)
            this.workbook.removeSheet(idx)
        })
        payloads.push(...getCustomSheetPayloads(this.workbook, service.book))
        const render = new RenderPayloadBuilder().build()
        payloads.push(render)
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

    public workbook(workbook: Workbook): this {
        this.getImpl().workbook = workbook
        return this
    }

    public customSheets(customSheets: readonly string[]): this {
        this.getImpl().customSheets = customSheets
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'workbook',
    ]
}
