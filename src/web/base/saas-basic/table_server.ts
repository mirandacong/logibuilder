import {LogiTableQueryParams} from '@logi/src/web/ui/customize-table'
import {debounceTime} from 'rxjs/operators'
import {FormControl} from '@angular/forms'

import {ACS, Column, DESC} from './column'
import {TableDef} from './table_def'

export abstract class TableServerDef<T> extends TableDef<T> {
    // tslint:disable-next-line: max-func-body-length
    public constructor() {
        super()
        const debounce = 300
        this.add(this.searchFormControl.valueChanges
            .pipe(debounceTime(debounce))
            .subscribe(() => {
                if (this.queryParams)
                    this.queryParams.pageIndex = 0
                this.initList()
            }))
    }

    /**
     * sort, search and split defined in frontend.
     */
    public manualUpdate = false
    public options: readonly string[] = []
    searchFormControl = new FormControl()
    queryParams?: LogiTableQueryParams

    public onQueryParamsChange(e: LogiTableQueryParams): void {
        this.queryParams = e
        this.initList()
    }
}

export function getSortOrder<T>(
    queryParams: LogiTableQueryParams | undefined,
    columns: readonly Column<T>[],
): number | undefined {
    const sortCol = queryParams?.sort[0]
    if (sortCol === undefined)
        return
    const col = columns.find(c => c.key === sortCol.key)
    if (col === undefined)
        return
    if (sortCol.value === ACS)
        return col.sortAscEnum
    if (sortCol.value === DESC)
        return col.sortDescEnum
    return
}
