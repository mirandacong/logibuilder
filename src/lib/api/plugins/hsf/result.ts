// tslint:disable-next-line: no-import-side-effect
import '@logi/base/ts/spreadjs/spreadjs_init'

// tslint:disable-next-line: no-wildcard-import ordered-imports
import * as GC from '@grapecity/spread-sheets'
import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Diff, HsfBook, Status} from '@logi/src/lib/hsf'

import {Result} from '../base'

export interface RenderResult extends Result {
    readonly actionType: number
    readonly hsfBook: HsfBook
    readonly status: Status
    readonly customSheets: readonly string[]
    readonly styles: readonly GC.Spread.Sheets.Style[]
    readonly diff?: Diff
}

class RenderResultImpl implements Impl<RenderResult> {
    public actionType!: number
    public hsfBook!: HsfBook
    public status!: Status
    public customSheets: readonly string[] = []
    public styles: readonly GC.Spread.Sheets.Style[] = []
    public diff?: Diff
}

export class RenderResultBuilder extends
    Builder<RenderResult, RenderResultImpl> {
    public constructor(obj?: Readonly<RenderResult>) {
        const impl = new RenderResultImpl()
        if (obj)
            RenderResultBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public actionType(actionType: number): this {
        this.getImpl().actionType = actionType
        return this
    }

    public hsfBook(hsfBook: HsfBook): this {
        this.getImpl().hsfBook = hsfBook
        return this
    }

    public status(status: Status): this {
        this.getImpl().status = status
        return this
    }

    public diff(diff: Diff): this {
        this.getImpl().diff = diff
        return this
    }

    public customSheets(sheets: readonly string[]): this {
        this.getImpl().customSheets = sheets
        return this
    }

    public styles(styles: readonly GC.Spread.Sheets.Style[]): this {
        this.getImpl().styles = styles
        return this
    }

    protected get daa(): readonly string[] {
        return RenderResultBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'actionType',
        'hsfBook',
        'status',
    ]
}

export function isRenderResult(value: unknown): value is RenderResult {
    return value instanceof RenderResultImpl
}

export function assertIsRenderResult(
    value: unknown,
): asserts value is RenderResult {
    if (!(value instanceof RenderResultImpl))
        throw Error('Not a RenderResult!')
}
