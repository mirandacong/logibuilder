// tslint:disable-next-line: no-wildcard-import
import * as GC from '@grapecity/spread-sheets'
import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Result} from '../base'

export interface WorkbookResult extends Result {
    readonly actionType: number
    readonly workbook: GC.Spread.Sheets.Workbook
}

class WorkbookResultImpl implements Impl<WorkbookResult> {
    public actionType!: number
    public workbook!: GC.Spread.Sheets.Workbook
}

export class WorkbookResultBuilder
    extends Builder<WorkbookResult, WorkbookResultImpl> {
    public constructor(obj?: Readonly<WorkbookResult>) {
        const impl = new WorkbookResultImpl()
        if (obj)
            WorkbookResultBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public actionType(actionType: number): this {
        this.getImpl().actionType = actionType
        return this
    }

    public workbook(workbook: GC.Spread.Sheets.Workbook): this {
        this.getImpl().workbook = workbook
        return this
    }

    protected get daa(): readonly string[] {
        return WorkbookResultBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'actionType',
        'workbook',
    ]
}

export function isWorkbookResult(value: unknown): value is WorkbookResult {
    return value instanceof WorkbookResultImpl
}

export function assertIsWorkbookResult(
    value: unknown,
): asserts value is WorkbookResult {
    if (!(value instanceof WorkbookResultImpl))
        throw Error('Not a WorkbookResult!')
}
