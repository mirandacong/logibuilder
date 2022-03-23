// tslint:disable-next-line: no-import-side-effect
import '@logi/base/ts/spreadjs/spreadjs_init'

// tslint:disable-next-line: no-wildcard-import ordered-imports
import * as GC from '@grapecity/spread-sheets'
import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {PayloadType} from '../payload'
import {Payload as Base} from './payload'

/**
 * Indicating adding custom sheets.
 */
export interface Payload extends Base {
    readonly sheets: readonly CustomSheetInfo[]
    readonly styles: readonly GC.Spread.Sheets.Style[]
    readonly workbook: GC.Spread.Sheets.Workbook
}

class PayloadImpl implements Impl<Payload> {
    public sheets: readonly CustomSheetInfo[] = []
    public styles: readonly GC.Spread.Sheets.Style[] = []
    public workbook!: GC.Spread.Sheets.Workbook
    public payloadType = PayloadType.LOAD_CUSTOM_SHEETS
}

export class PayloadBuilder extends Builder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public sheets(sheets: readonly CustomSheetInfo[]): this {
        this.getImpl().sheets = sheets
        return this
    }

    public styles(styles: readonly GC.Spread.Sheets.Style[]): this {
        this.getImpl().styles = styles
        return this
    }

    public workbook(workbook: GC.Spread.Sheets.Workbook): this {
        this.getImpl().workbook = workbook
        return this
    }

    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'workbook',
    ]
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}

export function assertIsPayload(value: unknown): asserts value is Payload {
    if (!(value instanceof PayloadImpl))
        throw Error('Not a Payload!')
}

export interface CustomSheetInfo {
    readonly sheet: GC.Spread.Sheets.Worksheet
    readonly index: number
}

class CustomSheetInfoImpl implements CustomSheetInfo {
    public sheet!: GC.Spread.Sheets.Worksheet
    public index!: number
}

export class CustomSheetInfoBuilder extends
    Builder<CustomSheetInfo, CustomSheetInfoImpl> {
    public constructor(obj?: Readonly<CustomSheetInfo>) {
        const impl = new CustomSheetInfoImpl()
        if (obj)
            CustomSheetInfoBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public sheet(sheet: GC.Spread.Sheets.Worksheet): this {
        this.getImpl().sheet = sheet
        return this
    }

    public index(index: number): this {
        this.getImpl().index = index
        return this
    }

    protected get daa(): readonly string[] {
        return CustomSheetInfoBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'sheet',
        'index',
    ]
}
