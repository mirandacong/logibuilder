import {SelectionModel} from '@angular/cdk/collections'
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
} from '@angular/core'
import {MatPaginator, MatPaginatorIntl} from '@angular/material/paginator'
import {MatSort} from '@angular/material/sort'
import {MatTableDataSource} from '@angular/material/table'
import {
    getRangeLabel,
    PAGINATOR_NEXT_PAGE_LABEL,
    PAGINATOR_PER_PAGE_LABEL,
    PAGINATOR_PREV_PAGE_LABEL,
} from '@logi/src/web/ui/common/pagination'
import {Subject} from 'rxjs'
import {takeUntil} from 'rxjs/operators'

import {ColumnDefDirective} from './column_def.directive'
import {SortChangeEvent, SortChangeEventBuilder} from './sort_change_event'
import {SortColInfo} from './sort_info'

const SINGLE_SELECT_COLUMN_FLAG = 'logi-table-single-select'
const MULTIPLE_SELECT_COLUMN_FLAG = 'logi-table-multiple-select'

export interface LogiTablePageChangeParams {
    readonly pageIndex: number
    readonly pageSize: number
}

/**
 * For radio group name.
 */
let TABLE_RADIO_ID = 0

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-table',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class LogiTableComponent<T> implements OnInit, OnDestroy,
AfterViewInit, AfterContentInit {
    // tslint:disable: readonly-array
    // tslint:disable: ng-no-get-and-set-property
    @Input() public set data(d: readonly T[]) {
        if (d === this._data)
            return
        // tslint:disable-next-line: no-type-assertion
        const data = d as T[]
        this._data = data
        this.dataSource.data = data
        this._filterSelection(data)
    }

    @Input() public set columns(columns: readonly string[]) {
        this._columns = columns
    }

    public get columns(): readonly string[] {
        if (this.singleSelect)
            return [SINGLE_SELECT_COLUMN_FLAG, ...this._columns]
        if (this.multipleSelect)
            return [MULTIPLE_SELECT_COLUMN_FLAG, ...this._columns]
        return this._columns
    }

    public get dataColumns(): readonly string[] {
        return this._columns
    }

    @Input() public set filter(filter: string | undefined) {
        if (filter === undefined)
            return
        this.dataSource.filter = filter.trim()
    }

    @Input() public set selectedItems(selItems: T[] | undefined) {
        if (!selItems)
            return
        this.selection.select(...selItems)
    }
    public constructor(private readonly _paginatorIntl: MatPaginatorIntl) {}

    /**
     * sortCol should be set once because it should be init value.
     */
    @Input() public sortCol: SortColInfo | undefined

    @Input() public columnTitles: readonly string[] = []
    @Input() public columnWidthList: readonly string[] = []
    @Input() public sortColumns: readonly string[] = []
    @Input() public selectedItem: T | undefined
    @Input() public singleSelect = false
    @Input() public multipleSelect = false

    @Input() public headerSticky = true
    // tslint:disable-next-line: no-input-prefix
    @Input() public isAsyncData = false
    @Input() public loading = false
    @Input() public total = 0
    @Output() public readonly selectedItemsChange$
        = new EventEmitter<readonly T[]>()
    @Input() public pageSizeOptions: number[] | undefined
    @Input() public pageIndex = 0
    @Output() public readonly rowClick$ = new EventEmitter<T>()
    @Output() public readonly pageChange$
        = new EventEmitter<LogiTablePageChangeParams>()
    @Output() public readonly sortChanged$ =
        new EventEmitter<SortChangeEvent>()
    public dataSource = new MatTableDataSource<T>()
    // tslint:disable: codelyzer-template-property-should-be-public
    // tslint:disable-next-line: unknown-instead-of-any
    public colTemplateMap!: Map<string, TemplateRef<any>>
    public radioName!: string
    public singleSelectColFlag = SINGLE_SELECT_COLUMN_FLAG
    public multipleSelectColFlag = MULTIPLE_SELECT_COLUMN_FLAG
    public selection = new SelectionModel<T>(true)

    /**
     * prefer use Arrow function
     */
    // tslint:disable-next-line: ext-variable-name naming-convention
    @Input() public rowLinkUrl: ((obj: T) => string) | undefined

    public ngOnInit(): void {
        // tslint:disable-next-line: increment-decrement
        this.radioName = `logi-table-select-radio-${TABLE_RADIO_ID++}`
        if (this.sortCol !== undefined)
            this._sort.sort(this.sortCol)
        this._sort.sortChange.pipe(takeUntil(this._destroyed$)).subscribe(s => {
            const e = new SortChangeEventBuilder().sort(s).build()
            this.sortChanged$.next(e)
        })

        if (this.columnTitles.length === 0)
            this.columnTitles = this.dataColumns

        if (this.multipleSelect && this.selectedItems !== undefined)
            this.selection = new SelectionModel<T>(true, this.selectedItems)
        if (this.singleSelect) {
            const selectedItems = this.selectedItems ?? []
            this.selection = new SelectionModel<T>(false, selectedItems)
        }
        if (this.singleSelect && this.multipleSelect)
            // tslint:disable-next-line: no-throw-unless-asserts
            throw Error(
                'Only one of "singleSelect" and "multipleSelect" can set true!',
            )
        this.selection.changed
            .pipe(takeUntil(this._destroyed$))
            .subscribe(v => {
                this.selectedItemsChange$.next(v.source.selected)
            })
    }

    public ngAfterContentInit(): void {
        // tslint:disable-next-line: unknown-instead-of-any
        const map = new Map<string, TemplateRef<any>>()
        this._columnDefs.toArray().forEach(d => {
            map.set(d.column, d.templateRef)
        })
        this.colTemplateMap = map

        this._paginatorIntl.itemsPerPageLabel = PAGINATOR_PER_PAGE_LABEL
        this._paginatorIntl.nextPageLabel = PAGINATOR_NEXT_PAGE_LABEL
        this._paginatorIntl.previousPageLabel = PAGINATOR_PREV_PAGE_LABEL
        this._paginatorIntl.getRangeLabel = getRangeLabel
    }

    public ngAfterViewInit(): void {
        if (!this.isAsyncData)
            this.dataSource.paginator = this._paginator
        this.dataSource.sort = this._sort
    }

    public getSelectedItems(): readonly T[] {
        return this.selection.selected
    }

    public setSelectClean(): void {
        this.selection.clear()
    }

    public handleChange(): void {
        if (!this.isAsyncData)
            return
        this.pageChange$.next({
            pageIndex: this._paginator.pageIndex,
            pageSize: this._paginator.pageSize,
        })
    }

    public ngOnDestroy(): void {
        this._destroyed$.next()
        this._destroyed$.complete()
    }

    public getColumnWidth(i: number): string {
        if (this.columnWidthList.length === 0 && this.columns.length > 0)
            // tslint:disable-next-line: no-magic-numbers
            return `${(1 / this.dataColumns.length) * 100}%`
        return this.columnWidthList[i] || 'unset'
    }

    public isDisableSort(column: string): boolean {
        return !this.sortColumns.includes(column)
    }

    // tslint:disable-next-line: prefer-function-over-method
    public isSelected(row: T): boolean {
        return row === this.selectedItem
    }

    public click(row: T): void {
        this.rowClick$.next(row)
        this.selection.toggle(row)
        if (this.selectedItem === row)
            return
        this.selectedItem = row
    }

    public isAllSelected(): boolean {
        const selectedLength = this.selection.selected.length
        const itemsLength = this.dataSource.data.length
        return selectedLength === itemsLength
    }

    public toggleAll(): void {
        this.isAllSelected() ? this.selection.clear() :
            this.dataSource.data.forEach(d => this.selection.select(d))
    }

    @ContentChildren(ColumnDefDirective)
    private _columnDefs!: QueryList<ColumnDefDirective<{$implicit: T}>>
    @ViewChild(MatPaginator) private _paginator!: MatPaginator
    @ViewChild(MatSort, {static: true}) private _sort!: MatSort
    private _data: T[] = []
    private _columns: readonly string[] = []

    private _destroyed$ = new Subject<void>()

    private _filterSelection(data: T[]): void {
        const de = this.selection.selected.filter(s => !data.includes(s))
        this.selection.deselect(...de)
    }
}
