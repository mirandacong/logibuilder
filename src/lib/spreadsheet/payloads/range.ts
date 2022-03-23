import {Builder as BaseBuilder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Builder as SsBuilder, SpreadsheetPayload} from './base'

export interface CellRange {
    readonly row: number
    readonly col: number
    readonly rowCount: number
    readonly colCount: number
}

class CellRangeImpl implements CellRange {
    public row!: number
    public col!: number
    public rowCount = 1
    public colCount = 1
}

export class CellRangeBuilder extends BaseBuilder<CellRange, CellRangeImpl> {
    public constructor(obj?: Readonly<CellRange>) {
        const impl = new CellRangeImpl()
        if (obj)
            CellRangeBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: number): this {
        this.getImpl().row = row
        return this
    }

    public col(col: number): this {
        this.getImpl().col = col
        return this
    }

    public rowCount(rowCount: number): this {
        this.getImpl().rowCount = rowCount
        return this
    }

    public colCount(colCount: number): this {
        this.getImpl().colCount = colCount
        return this
    }

    protected get daa(): readonly string[] {
        return CellRangeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'col',
        'rowCount',
        'colCount',
    ]
}

export abstract class RangePayload extends SpreadsheetPayload {
    public range!: CellRange
}

export class Builder<T extends RangePayload, S extends Impl<T>>
    extends SsBuilder<T, S> {
    public range(range: CellRange): this {
        this.getImpl().range = range
        return this
    }

    protected get daa(): readonly string[] {
        return SsBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'range',
        ...SsBuilder.__DAA_PROPS__,
    ]
}

export function isRangePayload(value: unknown): value is RangePayload {
    return value instanceof RangePayload
}
