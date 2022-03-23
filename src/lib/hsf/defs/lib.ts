import {Builder} from '@logi/base/ts/common/builder'
import {Address} from '@logi/base/ts/common/excel'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Area, BlockImpl, BlockType} from './block'
import {Cell} from './cell'

export class BaseBlockBuilder<T extends BlockImpl,
    S extends Impl<T>> extends Builder<T, S> {
    public uuid(value: string): this {
        this.getImpl().uuid = value
        return this
    }

    public type(value: BlockType): this {
        this.getImpl().type = value
        return this
    }

    public area(value: Area): this {
        this.getImpl().area = value
        return this
    }

    public merge(value: boolean): this {
        this.getImpl().merge = value
        return this
    }

    public cells(value: readonly Cell[]): this {
        this.getImpl().cells = value
        return this
    }

    public childrenCount(count: number): this {
        this.getImpl().childrenCount = count
        return this
    }
}

export interface ExcelRange {
    readonly sheetName: string
    readonly start: Address
    readonly end: Address
}

class ExcelRangeImpl implements Impl<ExcelRange> {
    public sheetName!: string
    public start!: Address
    public end!: Address
}

export class ExcelRangeBuilder extends Builder<ExcelRange, ExcelRangeImpl> {
    public constructor(obj?: Readonly<ExcelRange>) {
        const impl = new ExcelRangeImpl()
        if (obj)
            ExcelRangeBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public sheetName(sheetName: string): this {
        this.getImpl().sheetName = sheetName
        return this
    }

    public start(start: Address): this {
        this.getImpl().start = start
        return this
    }

    public end(end: Address): this {
        this.getImpl().end = end
        return this
    }

    protected get daa(): readonly string[] {
        return ExcelRangeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'start',
        'end',
        'sheetName',
    ]
}

export function isExcelRange(value: unknown): value is ExcelRange {
    return value instanceof ExcelRangeImpl
}

export function assertIsExcelRange(
    value: unknown,
): asserts value is ExcelRange {
    if (!(value instanceof ExcelRangeImpl))
        throw Error('Not a ExcelRange!')
}
