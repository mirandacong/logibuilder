// tslint:disable: readonly-array
import {MatPaginatorDefaultOptions} from '@angular/material/paginator'
import {Builder} from '@logi/base/ts/common/builder'
// tslint:disable-next-line: no-magic-numbers
export const DEFAULT_PAGE_SIZE_OPTIONS = [20, 30, 40, 50]
export interface PaginatorOptions extends MatPaginatorDefaultOptions {
    readonly show?: boolean
    readonly total?: number
    readonly pageIndex?: number
    readonly logiPageNoTotal?: boolean
    readonly pageSize?: number
    readonly pageSizeOptions?: number[]
    readonly hidePageSize?: boolean
    readonly showFirstLastButtons?: boolean
}

/**
 * export only for test
 */
export class PaginatorOptionsImpl implements PaginatorOptions {
    public show?: boolean
    public total?: number
    public pageIndex?: number
    public hidePageSize?: boolean
    public pageSize?: number
    // tslint:disable-next-line: readonly-array
    public pageSizeOptions?: number[]
    public showFirstLastButtons?: boolean
    public logiPageNoTotal?: boolean
}

export class PaginatorOptionsBuilder extends
Builder<PaginatorOptions, PaginatorOptionsImpl> {
    public constructor(obj?: Readonly<PaginatorOptions>) {
        const impl = new PaginatorOptionsImpl()
        if (obj)
            PaginatorOptionsBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public show(show: boolean): this {
        this.getImpl().show = show
        return this
    }

    public total(total: number): this {
        this.getImpl().total = total
        return this
    }

    public pageIndex(pageIndex: number): this {
        this.getImpl().pageIndex = pageIndex
        return this
    }

    public logiPageNoTotal(logiPageNoTotal: boolean): this {
        this.getImpl().logiPageNoTotal = logiPageNoTotal
        return this
    }

    public pageSize(pageSize: number): this {
        this.getImpl().pageSize = pageSize
        return this
    }

    public pageSizeOptions(pageSizeOptions: number[]): this {
        this.getImpl().pageSizeOptions = pageSizeOptions
        return this
    }

    public hidePageSize(hidePageSize: boolean): this {
        this.getImpl().hidePageSize = hidePageSize
        return this
    }

    public showFirstLastButtons(showFirstLastButtons: boolean): this {
        this.getImpl().showFirstLastButtons = showFirstLastButtons
        return this
    }
}

export function isPaginatorOptions(value: unknown): value is PaginatorOptions {
    return value instanceof PaginatorOptionsImpl
}

export function assertIsPaginatorOptions(
    value: unknown,
): asserts value is PaginatorOptions {
    if (!(value instanceof PaginatorOptionsImpl))
        throw Error('Not a PaginatorOptions!')
}
