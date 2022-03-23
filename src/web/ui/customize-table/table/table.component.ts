/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
// tslint:disable:ext-variable-name variable-name component-selector
// tslint:disable:codelyzer-template-property-should-be-public
// tslint:disable: no-inputs-metadata-property no-host-metadata-property
// tslint:disable: use-component-view-encapsulation
// tslint:disable: readonly-array no-null-keyword
// tslint:disable: no-magic-numbers limit-indent-for-method-in-class
import {Direction, Directionality} from '@angular/cdk/bidi'
import {BooleanInput} from '@angular/cdk/coercion'
import {CdkDragDrop} from '@angular/cdk/drag-drop'
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling'
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    SimpleChanges,
    TemplateRef,
    TrackByFunction,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core'
import {MatPaginatorIntl, PageEvent} from '@angular/material/paginator'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {
    getRangeLabel,
    getRangeLabelWithoutTatol,
    PAGINATOR_NEXT_PAGE_LABEL,
    PAGINATOR_PER_PAGE_LABEL,
    PAGINATOR_PREV_PAGE_LABEL,
} from '@logi/src/web/ui/common/pagination'
import {ResizeService} from '@logi/src/web/ui/common/services'
import {InputBoolean} from '@logi/src/web/ui/common/utils'
import {Subscription} from 'rxjs'
import {map} from 'rxjs/operators'

import {CustomSearch} from '../addon/custom_filter'

import {LogiTableDataService} from './../service/data.service'
import {LogiTableStyleService} from './../service/style.service'
import {
    LogiSafeAny,
    LogiTableData,
    LogiTableLayout,
    LogiTableQueryParams,
    LogiTableSize,
} from './../table.type'
import {PaginatorOptions, PaginatorOptionsBuilder} from './paginator_options'
import {LogiTableInnerScrollComponent} from './table_inner_scroll.component'
import {LogiTableVirtualScrollDirective} from './table_virtual_scroll.directive'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    exportAs: 'logiTable',
    host: {
        '[class.logi-table-wrapper-rtl]': 'dir === "rtl"',
    },
    preserveWhitespaces: false,
    providers: [LogiTableDataService, LogiTableStyleService],
    selector: 'logi-table',
    // tslint:disable-next-line: relative-url-prefix
    styleUrls: ['./../style/index.scss'],
    templateUrl: './table.template.html',
})
export class LogiTableComponent<T = LogiSafeAny> implements
 OnInit, OnDestroy, OnChanges, AfterViewInit, AfterContentInit {
    public constructor(
        private readonly _paginatorIntl: MatPaginatorIntl,
        private readonly _elementRef: ElementRef<HTMLElement>,
        private readonly cdr: ChangeDetectorRef,
        private readonly logiTableStyleService: LogiTableStyleService,
        private readonly logiTableDataService: LogiTableDataService,
        private readonly _resizeSvc: ResizeService,
        @Optional() private readonly directionality: Directionality,
    ) {
    // TODO: move to host after View Engine deprecation
        this._elementRef.nativeElement.classList.add('logi-table-wrapper')
    }

    public static ngAcceptInputType_logiFrontPagination: BooleanInput
    public static ngAcceptInputType_showLoadingBg: BooleanInput
    public static ngAcceptInputType_logiLoading: BooleanInput
    public static ngAcceptInputType_logiBordered: BooleanInput
    public static ngAcceptInputType_logiPageNoTotal: BooleanInput
    public static ngAcceptInputType_logiOuterBordered: BooleanInput
    public static ngAcceptInputType_logiHideOnSinglePage: BooleanInput

    @Input() public logiTableLayout: LogiTableLayout = 'auto'
    @Input() public logiCustomFilter?: CustomSearch<T>
    @Input() public logiNoResult = '暂无数据'
    @Input() public logiVirtualItemSize = 0
    @Input() public logiVirtualMaxBufferPx = 200
    @Input() public logiVirtualMinBufferPx = 100
    @Input() public logiLoadingDelay = 0
    @Input() public logiWidthConfig: (string | null)[] = []
    @Input() public logiPaginatorOptions?: Impl<PaginatorOptions>
    @Input() public logiData: readonly T[] = []
    @Input() public logiScroll: { x?: string | null, y?: string | null } =
        {x: null, y: null}
    @Input() @InputBoolean() public logiFrontPagination = true
    @Input() @InputBoolean() public showLoadingBg = false
    @Input() @InputBoolean() public logiLoading = false
    @Input() @InputBoolean() public logiOuterBordered = false
    @Input() @InputBoolean() public logiBordered = false
    @Input() public logiSize: LogiTableSize = 'default'
    @Output() public readonly logiQueryParams =
        new EventEmitter<LogiTableQueryParams>()
    @Output() public readonly drop$ =
        new EventEmitter<CdkDragDrop<unknown>>()
    @Output() public readonly scrollNearBottom =
        new EventEmitter<void>()
    @Output() public readonly logiCurrentPageDataChange =
        new EventEmitter<readonly LogiTableData[]>()
    get _paginatorOptions(): Required<PaginatorOptions> {
        return this.logiTableDataService._paginatorOptions as Required<PaginatorOptions>
    }

    /**
     * public data for ngFor tr
     */
    public data: readonly T[] = []
    public cdkVirtualScrollViewport?: CdkVirtualScrollViewport
    public theadTemplate: TemplateRef<LogiSafeAny> | null = null
    public listOfManualColWidth: (string | null)[] = []
    public hasFixLeft = false
    public hasFixRight = false
    public dir: Direction = 'ltr'
    @ContentChild(LogiTableVirtualScrollDirective, {static: false})
  public logiVirtualScrollDirective!: LogiTableVirtualScrollDirective
    @ViewChild(
        LogiTableInnerScrollComponent,
        {static: false},
    ) public logiTableInnerScrollComponent!: LogiTableInnerScrollComponent
    public verticalScrollBarWidth = 0
    @Input() logiVirtualForTrackBy: TrackByFunction<LogiTableData> = index => index
    public onPage(e: PageEvent): void {
        this.logiTableDataService.updatePageConf(e.pageIndex, e.pageSize)
    }

    // tslint:disable-next-line: max-func-body-length
    public ngOnInit(): void {
        this.dir = this.directionality.value
        this._subs.add(this.directionality.change?.subscribe((
            direction: Direction,
        ) => {
            this.dir = direction
            this.cdr.detectChanges()
        }))

        this._subs.add(this.logiTableDataService.queryParams().subscribe(e => {
            this._updatePaginator(e)
            this.logiQueryParams.next({
                filter: e.filter ?? [],
                pageIndex: this._paginatorOptions.pageIndex,
                pageOptions: this._paginatorOptions.pageSizeOptions,
                pageSize: this._paginatorOptions.pageSize,
                sort: e.sort ?? [],
                total: this._paginatorOptions.total,
            })
            this.cdr.detectChanges()
        }))
        this._subs.add(this.logiTableStyleService.scrollNearBottom().subscribe(
            this.scrollNearBottom,
        ))
        this._subs.add(this.logiTableDataService
            .listOfCurrentPageData()
            .subscribe(data => {
                this.data = this.logiFrontPagination ? data : this.logiData
                this.logiCurrentPageDataChange.next(data)
                this.cdr.markForCheck()
            }))
        this._subs.add(this.logiTableStyleService.theadTemplate().subscribe(
            t => {
                this.theadTemplate = t
                this.cdr.markForCheck()
            },
        ))
        this._subs.add(this.logiTableStyleService.hasFixLeft().subscribe(
            hasFixLeft => {
                this.hasFixLeft = hasFixLeft
                this.cdr.markForCheck()
            },
        ))

        this._subs.add(this.logiTableStyleService.hasFixRight().subscribe(
            hasFixRight => {
                this.hasFixRight = hasFixRight
                this.cdr.markForCheck()
            },
        ))

        this.verticalScrollBarWidth = measureScrollbar('vertical')
        this._subs.add(this.logiTableStyleService
            .manualWidthConfigPx()
            .subscribe(listOfWidth => {
                this.listOfManualColWidth = listOfWidth.slice()
                this.cdr.markForCheck()
            }))
    }

    public ngOnChanges(changes: SimpleChanges): void {
        // tslint:disable-next-line: typedef
        const {
            logiPaginatorOptions,
            logiData,
            logiWidthConfig,
            logiCustomFilter,
        } = changes
        if (logiPaginatorOptions)
            this._updatePaginator(logiPaginatorOptions.currentValue)
        if (logiData) {
            this.logiData = this.logiData || []
            let total = this._paginatorOptions.total ?? 0
            if (logiPaginatorOptions?.currentValue?.total !== undefined)
                total = logiPaginatorOptions.currentValue.total
            else if (total !== this.logiData.length)
                total = this.logiData.length
            this._updatePaginator({total})
            this.logiTableDataService.updateAllData(this.logiData)
        }
        if (logiWidthConfig)
            this.logiTableStyleService.setTableWidthConfig(this.logiWidthConfig)
        if (logiCustomFilter) {
            this._searchSub?.unsubscribe()
            const customFilter = logiCustomFilter.currentValue
            this.logiTableDataService.initCustomFilter(customFilter)
            this._searchSub = customFilter.searchFormControl.valueChanges
                .subscribe((e: string) => {
                    this.logiTableDataService.updateSearchKey(e)
                })
        }
    }

    public ngAfterViewInit(): void {
        this._subs.add(this._resizeSvc
            .subscribe()
            .pipe(map(() => {
                const width = this._elementRef.nativeElement
                    .getBoundingClientRect().width
                const scrollBarWidth = this.verticalScrollBarWidth
                return Math.floor(width - scrollBarWidth)
            }))
            .subscribe(this.logiTableStyleService.hostWidth()))
        if (this.logiTableInnerScrollComponent &&
            this.logiTableInnerScrollComponent.cdkVirtualScrollViewport)
            this.cdkVirtualScrollViewport =
                this.logiTableInnerScrollComponent.cdkVirtualScrollViewport
    }

    public ngOnDestroy(): void {
        this._subs.unsubscribe()
        this._searchSub?.unsubscribe()
    }

    public ngAfterContentInit(): void {
        this._paginatorIntl.itemsPerPageLabel = PAGINATOR_PER_PAGE_LABEL
        this._paginatorIntl.nextPageLabel = PAGINATOR_NEXT_PAGE_LABEL
        this._paginatorIntl.previousPageLabel = PAGINATOR_PREV_PAGE_LABEL
        const logiPageNoTotal = this._paginatorOptions.logiPageNoTotal
        this._paginatorIntl.getRangeLabel = logiPageNoTotal ?
            getRangeLabelWithoutTatol : getRangeLabel
    }
    private _subs = new Subscription()
    private _searchSub?: Subscription
    private _updatePaginator(paginator: PaginatorOptions): void {
        const paginatorBuilder = new PaginatorOptionsBuilder(this._paginatorOptions)
        // tslint:disable-next-line: no-type-assertion
        if (paginator.hidePageSize !== undefined)
            paginatorBuilder.hidePageSize(paginator.hidePageSize)
        if (paginator.logiPageNoTotal !== undefined)
            paginatorBuilder.logiPageNoTotal(paginator.logiPageNoTotal)
        if (paginator.pageIndex !== undefined)
            paginatorBuilder.pageIndex(paginator.pageIndex)
        if (paginator.pageSize !== undefined)
            paginatorBuilder.pageSize(paginator.pageSize)
        if (paginator.pageSizeOptions !== undefined)
            paginatorBuilder.pageSizeOptions(paginator.pageSizeOptions)
        if (paginator.show !== undefined)
            paginatorBuilder.show(paginator.show)
        if (paginator.showFirstLastButtons !== undefined)
            paginatorBuilder
                .showFirstLastButtons(paginator.showFirstLastButtons)
        if (paginator.total !== undefined)
            paginatorBuilder.total(paginator.total)
        // tslint:disable-next-line: no-type-assertion
        this.logiTableDataService._paginatorOptions = paginatorBuilder.build()
        this.logiTableStyleService
            .setShowEmpty(this._paginatorOptions.total === 0)
    }
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
let scrollbarVerticalSize: number
let scrollbarHorizontalSize: number

// Measure scrollbar width for padding body during modal show/hide
const SCROLL_BAR_MEASURE = {
    height: '50px',
    position: 'absolute',
    top: '-9999px',
    width: '50px',
}

export function measureScrollbar(
    direction: 'vertical' | 'horizontal' = 'vertical',
    prefix = 'logi',
): number {
    if (document === undefined || window === undefined)
        return 0
    const isVertical = direction === 'vertical'
    if (isVertical && scrollbarVerticalSize)
        return scrollbarVerticalSize
    if (!isVertical && scrollbarHorizontalSize)
        return scrollbarHorizontalSize
    const scrollDiv = document.createElement('div')
    // tslint:disable-next-line: no-object
    Object.keys(SCROLL_BAR_MEASURE).forEach(scrollProp => {
        // @ts-ignore
        scrollDiv.style[scrollProp] = SCROLL_BAR_MEASURE[scrollProp]
    })
    // apply hide scrollbar className ahead
    scrollDiv.className = `${prefix}-hide-scrollbar scroll-div-append-to-body`
    // Append related overflow style
    if (isVertical)
        scrollDiv.style.overflowY = 'auto'
    else
        scrollDiv.style.overflowX = 'auto'
    document.body.appendChild(scrollDiv)
    let size = 0
    if (isVertical) {
        size = scrollDiv.offsetWidth - scrollDiv.clientWidth
        scrollbarVerticalSize = size
    } else {
        size = scrollDiv.offsetHeight - scrollDiv.clientHeight
        scrollbarHorizontalSize = size
    }

    document.body.removeChild(scrollDiv)
    return size
}
