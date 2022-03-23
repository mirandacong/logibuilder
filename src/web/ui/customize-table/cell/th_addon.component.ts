/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/* tslint:disable:component-selector */
import {BooleanInput} from '@angular/cdk/coercion'
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChange,
    SimpleChanges,
    ViewEncapsulation,
} from '@angular/core'
import {InputBoolean} from '@logi/src/web/ui/common/utils'
import {Subject} from 'rxjs'
import {takeUntil} from 'rxjs/operators'

import {
    LogiTableFilterFn,
    LogiTableFilterList,
    LogiTableFilterValue,
    LogiTableSortFn,
    LogiTableSortOrder,
} from '../table.type'

@Component({
    selector: 'th[logiColumnKey], th[logiSortFn], th[logiSortOrder], th[logiFilters], th[logiShowSort], th[logiShowFilter], th[logiCustomFilter]',
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './th_addon.template.html',
    host: {
        '[class.logi-table-column-has-sorters]': 'logiShowSort',
        '[class.logi-table-column-sort]': 'sortOrder === \'descend\' || sortOrder === \'ascend\'',
        '(click)': 'emitNextSortValue()',
    },
})
export class LogiThAddOnComponent implements OnChanges, OnInit, OnDestroy {
    public constructor(private readonly _cd: ChangeDetectorRef) {}
    public static ngAcceptInputType_logiShowSort: BooleanInput
    public static ngAcceptInputType_logiShowFilter: BooleanInput
    public static ngAcceptInputType_logiCustomFilter: BooleanInput

    public manualClickOrder$ = new Subject<LogiThAddOnComponent>()
    public filterChanged$ = new Subject<LogiThAddOnComponent>()
    public customFilterValue$ = new Subject<LogiThAddOnComponent>()
    public logiFilterValue: LogiTableFilterValue = null
    public sortOrder: LogiTableSortOrder = null
    public sortDirections: readonly LogiTableSortOrder[] = ['ascend', 'descend', null]
    @Input() public filterValue: LogiTableFilterValue = null
    @Input() public logiColumnKey = ''
    @Input() public logiFilterMultiple = true
    @Input() public logiSortOrder: LogiTableSortOrder = null
    @Input() public logiSortPriority: number | boolean = false
    @Input() public logiSortDirections: readonly LogiTableSortOrder[] = ['ascend', 'descend', null]
    @Input() public logiFilters: LogiTableFilterList = []
    @Input() public logiSortFn: LogiTableSortFn | null = null
    @Input() public logiFilterFn: LogiTableFilterFn | null = null
    @Input() @InputBoolean() public logiShowSort = false
    @Input() @InputBoolean() public logiShowFilter = false
    @Input() @InputBoolean() public logiCustomFilter = false
    @Output() public readonly logiCheckedChange = new EventEmitter<boolean>()
    @Output() public readonly logiSortOrderChange = new EventEmitter<string | null>()
    @Output() public readonly logiFilterChange = new EventEmitter<LogiTableFilterValue>()

    public getNextSortDirection(
        sortDirections: readonly LogiTableSortOrder[],
        current: LogiTableSortOrder,
    ): LogiTableSortOrder {
        const index = sortDirections.indexOf(current)
        if (index === sortDirections.length - 1)
            return sortDirections[0]

        return sortDirections[index + 1]
    }

    public emitNextSortValue(): void {
        if (this.logiShowSort) {
            const nextOrder = this
                .getNextSortDirection(this.sortDirections, this.sortOrder!)
            this.setSortOrder(nextOrder)
            this.manualClickOrder$.next(this)
        }
    }

    public setSortOrder(order: LogiTableSortOrder): void {
        this.sortOrderChange$.next(order)
    }

    public clearSortOrder(): void {
        if (this.sortOrder !== null)
            this.setSortOrder(null)
    }

    public onFilterValueChange(value: LogiTableFilterValue): void {
        this.logiFilterChange.emit(value)
        this.filterChanged$.next(this)
    }

    public ngOnInit(): void {
        this.sortOrderChange$
            .pipe(takeUntil(this.destroy$))
            .subscribe(order => {
                if (this.sortOrder !== order) {
                    this.sortOrder = order
                    this.logiSortOrderChange.emit(order)
                }
                this._cd.markForCheck()
            })
    }

    // tslint:disable-next-line: cyclomatic-complexity
    public ngOnChanges(changes: SimpleChanges): void {
        const logiSortDirections = changes.logiSortDirections
        const logiFilters = changes.logiFilters
        const logiSortOrder = changes.logiSortOrder
        const logiSortFn = changes.logiSortFn
        const logiFilterMultiple = changes.logiFilterMultiple
        const logiShowSort = changes.logiShowSort
        const logiShowFilter = changes.logiShowFilter
        const logiFilterValue = changes.filterValue
        if (logiFilterValue && !logiFilterValue.isFirstChange()) {
            this.logiFilterValue = logiFilterValue.currentValue
            this.customFilterValue$.next(this)
        }
        if (logiSortDirections &&
            this.logiSortDirections && this.logiSortDirections.length)
            this.sortDirections = this.logiSortDirections
        if (logiSortOrder) {
            this.sortOrder = this.logiSortOrder
            this.setSortOrder(this.logiSortOrder)
        }
        if (logiShowSort)
            this.isLogiShowSortChanged = true
        if (logiShowFilter)
            this.isLogiShowFilterChanged = true
        const isFirstChange = (
            value: SimpleChange,
        ) => value && value.firstChange && value.currentValue !== undefined
        if ((isFirstChange(
            logiSortOrder,
        ) || isFirstChange(logiSortFn)) && !this.isLogiShowSortChanged)
            this.logiShowSort = true
        if (isFirstChange(logiFilters) && !this.isLogiShowFilterChanged)
            this.logiShowFilter = true
        if ((logiFilters || logiFilterMultiple) && this.logiShowFilter) {
            const listOfValue = this.logiFilters
                .filter(item => item.byDefault)
                .map(item => item.value)
            this.logiFilterValue = this.logiFilterMultiple ? listOfValue :
                listOfValue[0] || null
        }
    }

    public ngOnDestroy(): void {
        this.destroy$.next()
        this.destroy$.complete()
    }
    private sortOrderChange$ = new Subject<LogiTableSortOrder>()
    private destroy$ = new Subject()
    private isLogiShowSortChanged = false
    private isLogiShowFilterChanged = false
}
