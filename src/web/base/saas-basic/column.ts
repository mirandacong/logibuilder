import {Builder} from '@logi/base/ts/common/builder'
import {
    LogiTableFilterFn,
    LogiTableSortOrder,
    LogiTableSortOrderEnum,
} from '@logi/src/web/ui/customize-table'

import {Filter} from './filter'

export type SortFn<T> = (a: T, b: T, directions?: LogiTableSortOrder) => number
export const ACS = 'ascend'
export const DESC = 'descend'

export interface Column<T> {
    readonly key: string
    readonly name: string
    readonly sortDirections: readonly LogiTableSortOrder[]
    readonly sortOrder: LogiTableSortOrder
    readonly sortAscEnum: number
    readonly sortDescEnum: number
    readonly filter: Filter | null
    readonly isFixedLeft: boolean | string
    readonly isFixedRight: boolean | string
    readonly filterFn: LogiTableFilterFn | null
    readonly sortFn: SortFn<T> | null
    updateSortOrder(sortOrder?: LogiTableSortOrder): void
    updateSortFn(sortFn: SortFn<T>): void
}

class ColumnImpl<T> implements Column<T> {
    public key!: string
    public name!: string
    public filterFn: LogiTableFilterFn | null = null
    public sortDirections: readonly LogiTableSortOrder[] = [ACS, DESC]
    public sortOrder: LogiTableSortOrder = null
    public sortAscEnum = -1
    public sortDescEnum = -1
    public filter: Filter | null = null
    public isFixedLeft: boolean | string = false
    public isFixedRight: boolean | string = false
    // tslint:disable-next-line: no-null-keyword
    public sortFn: SortFn<T> | null = null
    public updateSortOrder(sortOrder: LogiTableSortOrder): void {
        this.sortOrder = sortOrder
    }

    public updateSortFn(sortFn: SortFn<T>): void {
        this.sortFn = sortFn
    }
}

export class ColumnBuilder<T> extends Builder<Column<T>, ColumnImpl<T>> {
    public constructor(obj?: Readonly<Column<T>>) {
        const impl = new ColumnImpl<T>()
        if (obj)
            ColumnBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public key(key: string): this {
        this.getImpl().key = key
        return this
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public sortDirections(sortDirections: readonly LogiTableSortOrder[]): this {
        this.getImpl().sortDirections = sortDirections
        return this
    }

    public sortOrder(sortOrder: LogiTableSortOrder): this {
        this.getImpl().sortOrder = sortOrder
        return this
    }

    public filter(filter: Filter): this {
        this.getImpl().filter = filter
        return this
    }

    public filterFn(filterFn: LogiTableFilterFn): this {
        this.getImpl().filterFn = filterFn
        return this
    }

    public sortAcsEnum(sortAcsEnum: number): this {
        this.getImpl().sortAscEnum = sortAcsEnum
        return this
    }

    public isFixedLeft(isFixedLeft: boolean): this {
        this.getImpl().isFixedLeft = isFixedLeft
        return this
    }

    public isFixedRight(isFixedRight: boolean): this {
        this.getImpl().isFixedRight = isFixedRight
        return this
    }

    public sortDescEnum(sortDescEnum: number): this {
        this.getImpl().sortDescEnum = sortDescEnum
        return this
    }

    /**
     * @param asc a > b
     */
    public ascFn(asc: (a: T, b: T) => boolean): this {
        this.getImpl().sortFn = (a: T, b: T, re?: LogiTableSortOrder) => {
            if (re === undefined)
                return 0
            if (re === LogiTableSortOrderEnum.ACS)
                return asc(a, b) ? 1 : -1
            if (re === LogiTableSortOrderEnum.DESC)
                return asc(a, b) ? -1 : 1
            return 0
        }
        return this
    }

    protected get daa(): readonly string[] {
        return ColumnBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'key',
        'name',
    ]
}

export function isColumn<T>(value: unknown): value is Column<T> {
    return value instanceof ColumnImpl
}

export function assertIsColumn<T>(value: unknown): asserts value is Column<T> {
    if (!(value instanceof ColumnImpl))
        throw Error('Not a Column!')
}
