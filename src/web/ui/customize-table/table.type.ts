/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
// tslint:disable-next-line: unknown-instead-of-any
export type LogiSafeAny = any

export type LogiTableData =
  | LogiSafeAny
  | {
      readonly [key: string]: LogiTableData;
  }
export type LogiTableLayout = 'fixed' | 'auto'
export type LogiTablePaginationPosition = 'top' | 'bottom' | 'both'
export type LogiTableSize = 'middle' | 'default' | 'small'
export type LogiTableFilterList = readonly { readonly text: string; readonly value: LogiSafeAny; readonly byDefault?: boolean }[]
export type LogiTableSortOrder = string | 'ascend' | 'descend' | null
export const enum LogiTableSortOrderEnum {
    ACS = 'ascend',
    DESC = 'descend',
}
export type LogiTableSortFn = (a: LogiTableData, b: LogiTableData, sortOrder?: LogiTableSortOrder) => number
export type LogiTableFilterValue = readonly LogiSafeAny[] | LogiSafeAny
export type LogiTableFilterFn = (value: LogiTableFilterValue, data: LogiTableData) => boolean

export interface LogiTableQueryParams {
    pageIndex: number
    readonly pageSize: number
    // tslint:disable-next-line: readonly-array
    readonly pageOptions: number[]
    readonly total: number
    readonly sort: readonly { readonly key: string; readonly value: LogiTableSortOrder }[]
    readonly filter: readonly { readonly key: string; readonly value: LogiTableFilterValue }[]
}
