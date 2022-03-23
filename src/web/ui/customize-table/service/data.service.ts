// tslint:disable: typedef no-single-line-block-comment
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// tslint:disable: readonly-array unknown-instead-of-any
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {Injectable, OnDestroy} from '@angular/core'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs'

import {CustomSearch} from '../addon/custom_filter'
import {
    DEFAULT_PAGE_SIZE_OPTIONS,
    PaginatorOptionsBuilder
} from '../table/paginator_options'

import {
    LogiTableData,
    LogiTableFilterFn,
    LogiTableFilterValue,
    LogiTableQueryParams,
    LogiTableSortFn,
    LogiTableSortOrder,
} from './../table.type'

@Injectable()
export class LogiTableDataService implements OnDestroy {
    _paginatorOptions = new PaginatorOptionsBuilder()
        .hidePageSize(false)
        .logiPageNoTotal(false)
        .pageIndex(0)
        .pageSize(DEFAULT_PAGE_SIZE_OPTIONS[0])
        .pageSizeOptions(DEFAULT_PAGE_SIZE_OPTIONS)
        .show(true)
        .showFirstLastButtons(false)
        .total(0)
        .build()
    initSortCalc(sortOperator: SortOperator): void {
        this._setQueryParams({
            sort: [{key: sortOperator.key, value: sortOperator.sortOrder}],
        })
        this._sortOperator = sortOperator
        const data = this._calcListOfData()
        if (this._pageConf === undefined) {
            this._listOfCurrentData$.next(data)
            return
        }
        const [pageIndex, pageSize] = this._pageConf
        this._listOfCurrentData$
            .next(data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize))
    }

    initCustomSingleFilter(filterOperators: readonly FilterOperator[]): void {
        this._filterOperators = filterOperators
        const data = this._calcListOfData()
        const pageIndex = 0
        const total = data.length
        if (this._pageConf === undefined) {
            this._listOfCurrentData$.next(data)
            return
        }
        this._paginatorOptions = new PaginatorOptionsBuilder(this._paginatorOptions)
            .pageIndex(0)
            .pageSize(this._pageConf[1])
            .build()
        const listOfData = data.slice(0, this._pageConf[1])
        this._listOfCurrentData$.next(listOfData)
        this._setQueryParams({
            pageIndex,
            total,
        })
    }

    initFilterCalc(filterOperators: readonly FilterOperator[]): void {
        this._filterOperators = filterOperators
        const data = this._calcListOfData()
        if (this._pageConf === undefined) {
            this._listOfCurrentData$.next(data)
            return
        }
        const maxPageIndex = Math.ceil(data.length / this._pageConf[1]) || 1
        if (this._pageConf[0] <= maxPageIndex)
            return
        const listOfData = data.slice(
            (this._pageConf[0] - 1) * this._pageConf[1],
            this._pageConf[0] * this._pageConf[1],
        )
        this._listOfCurrentData$.next(listOfData)
    }

    initCustomFilter(customFilter: CustomSearch<any>): void {
        this._customFilter = customFilter
        this._searchkey = customFilter.searchFormControl.value ?? ''
        const data = this._calcListOfData()
        const length = data.length
        if (this._searchkey !== '') {
            this._paginatorOptions = new PaginatorOptionsBuilder(this._paginatorOptions)
                .pageIndex(0)
                .pageSize(length)
                .build()
            this._listOfCurrentData$.next(data)
            return
        }
        if (this._pageConf === undefined) {
            this._listOfCurrentData$.next(data)
            return
        }
        const [pageIndex, pageSize] = this._pageConf
        this._listOfCurrentData$
            .next(data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize))
    }

    updateSearchKey(searchKey: string): void {
        this._searchkey = searchKey
        const data = this._calcListOfData()
        const total = data.length
        this._setQueryParams({
            pageIndex: 0,
            total,
        })
        if (this._pageConf === undefined) {
            this._listOfCurrentData$.next(data)
            return
        }
        const [pageIndex, pageSize] = this._pageConf
        this._listOfCurrentData$
            .next(data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize))
    }

    public queryParams(): Observable<Impl<LogiTableQueryParams>> {
        return this._queryParams$
    }

    public listOfCurrentPageData(): Observable<any[] | readonly any[]> {
        return this._listOfCurrentData$
    }

    public updatePageConf(pageIndex: number, pageSize: number): void {
        this._paginatorOptions = new PaginatorOptionsBuilder(this._paginatorOptions)
            .pageIndex(pageIndex)
            .pageSize(pageSize)
            .build()
        const data = this._calcListOfData()
        this._listOfCurrentData$
            .next(data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize))
        this._setQueryParams({
            pageIndex,
            pageSize,
        })
    }

    public updateAllData(list: readonly LogiTableData[]): void {
        this._allData = list
        const data = this._calcListOfData()
        if (this._pageConf === undefined) {
            this._listOfCurrentData$.next(data)
            return
        }
        const [pageIndex, pageSize] = this._pageConf
        this._listOfCurrentData$
            .next(data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize))
    }

    public ngOnDestroy(): void {
        this._queryParams$.complete()
        this._listOfCurrentData$.complete()
        this._subs.unsubscribe()
    }
    private _queryParams$ = new Subject<Impl<LogiTableQueryParams>>()
    private get _pageConf(): readonly [pageIndex: number, pageSize: number] | undefined {
        if (!this._paginatorOptions.show)
            return
        const {pageIndex, pageSize} = this._paginatorOptions
        return [pageIndex ?? 0, pageSize ?? 0]
    }
    private _allData: readonly LogiTableData[] = []
    private _listOfCurrentData$ =
        new BehaviorSubject<readonly LogiTableData[]>([])
    private _sortOperator?: SortOperator
    private _filterOperators?: readonly FilterOperator[]
    private _customFilter?: CustomSearch<any>
    private _searchkey = ''
    private _subs = new Subscription()
    private _setQueryParams(p: Impl<LogiTableQueryParams>): void {
        const params = p
        if (params.filter === undefined && this._filterOperators)
            params.filter = this._filterOperators
                .map(o => ({key: o.key, value: o.filterValue}))
        if (params.sort === undefined && this._sortOperator)
            params.sort = [{key: this._sortOperator.key, value: this._sortOperator.sortOrder}]
        this._queryParams$.next(params)
    }

    // tslint:disable-next-line: max-func-body-length
    private _calcListOfData(): readonly LogiTableData[] {
        let listOfDataAfterCalc = this._allData.slice()
        if (this._customFilter)
            listOfDataAfterCalc = this._customFilterFn()
        if (this._filterOperators)
            this._filterOperators.forEach(item => {
                const {filterFn, filterValue} = item
                listOfDataAfterCalc = listOfDataAfterCalc.filter(
                    data => filterFn(filterValue, data),
                )
            })
        if (this._sortOperator)
            listOfDataAfterCalc =
                customSort(this._sortOperator, listOfDataAfterCalc)
        return listOfDataAfterCalc
    }

    private _customFilterFn(): LogiTableData[] {
        if (this._customFilter === undefined)
            // tslint:disable-next-line: no-throw-unless-asserts
            throw Error('not have custom filter')
        const filterFn = this._customFilter.filterFn
        return this._allData.filter(d => filterFn(d, this._searchkey))
    }
}
interface SortOperator {
    readonly key: string
    readonly sortFn: LogiTableSortFn
    readonly sortOrder: LogiTableSortOrder
    readonly sortPriority: number | boolean
}
interface FilterOperator {
    readonly key: string
    readonly filterFn: LogiTableFilterFn
    readonly filterValue: LogiTableFilterValue
}

function customSort(
    sort: SortOperator,
    currData: readonly LogiTableData[],
): LogiTableData[] {
    const {sortFn, sortOrder} = sort
    const func = (a: any, b: any) => sortFn(a, b, sortOrder)
    return currData.slice().sort(func)
}
