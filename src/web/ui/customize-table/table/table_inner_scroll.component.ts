/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
// tslint:disable:ext-variable-name variable-name component-selector
// tslint:disable:codelyzer-template-property-should-be-public
// tslint:disable: no-inputs-metadata-property no-host-metadata-property
// tslint:disable: use-component-view-encapsulation
// tslint:disable: no-null-keyword
// tslint:disable: typedef
import {CdkDragDrop} from '@angular/cdk/drag-drop'
import {Platform} from '@angular/cdk/platform'
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling'
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    SimpleChanges,
    TemplateRef,
    TrackByFunction,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core'
import {BehaviorSubject, fromEvent, merge, Subject, Subscription} from 'rxjs'
import {
    debounceTime,
    delay,
    distinctUntilChanged,
    map,
    skip,
    startWith,
    switchMap,
} from 'rxjs/operators'

import {LogiTableStyleService} from '../service/style.service'
import {LogiSafeAny, LogiTableData} from '../table.type'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    selector: 'logi-table-inner-scroll',
    templateUrl: './table_inner_scroll.template.html',
})
export class LogiTableInnerScrollComponent implements
 OnChanges, AfterViewInit, OnDestroy, OnInit {
    // tslint:disable-next-line: max-func-body-length
    public constructor(
        private readonly renderer: Renderer2,
        private readonly ngZone: NgZone,
        private readonly platform: Platform,
        private readonly elementRef: ElementRef,
        private readonly styleSvc: LogiTableStyleService,
        private readonly _cd: ChangeDetectorRef,
    ) {
        // TODO: move to host after View Engine deprecation
        this.elementRef.nativeElement.classList.add('logi-table-container')
    }
    @Input() public noResult = ''
    @Input() public data: readonly LogiTableData[] = []
    @Input() public contentTemplate: TemplateRef<LogiSafeAny> | null = null
    @Input() public widthConfig: readonly string[] = []
    // tslint:disable-next-line: readonly-array
    @Input() public listOfColWidth: (string | null) [] = []
    @Input() public theadTemplate: TemplateRef<LogiSafeAny> | null = null
    @Input() public virtualTemplate: TemplateRef<LogiSafeAny> | null = null
    @Input() public virtualItemSize = 0
    @Input() public virtualMaxBufferPx = 200
    @Input() public virtualMinBufferPx = 100
    @Input() public tableMainElement?: HTMLDivElement
    @Output() readonly drop$ = new EventEmitter<CdkDragDrop<unknown>>()
    @ViewChild(
        'tableheaderelement',
        {read: ElementRef},
    ) public tableHeaderElement!: ElementRef
    @ViewChild(
        'tablebodyelement',
        {read: ElementRef},
    ) public tableBodyElement!: ElementRef
    @ViewChild(CdkVirtualScrollViewport, {read: CdkVirtualScrollViewport})
    public cdkVirtualScrollViewport?: CdkVirtualScrollViewport
    public showEmpty$ = new BehaviorSubject<boolean>(false)
    @Input() public verticalScrollBarWidth = 0
    public noDateVirtualHeight = '182px'
    virtualScrollOffset = '0px'
    @Input() public virtualForTrackBy: TrackByFunction<LogiTableData> =
        index => index

    public setScrollPositionClassName(clear = false): void {
        const {
            scrollWidth,
            scrollLeft,
            clientWidth,
        } = this._scrollElement
        const leftClassName = 'logi-table-ping-left'
        const rightClassName = 'logi-table-ping-right'
        const isRemaveRight = (scrollWidth - (scrollLeft + clientWidth)) < 1 &&
            (scrollWidth - (scrollLeft + clientWidth)) > -1
        if ((scrollWidth === clientWidth && scrollWidth !== 0) || clear) {
            this.renderer.removeClass(this.tableMainElement, leftClassName)
            this.renderer.removeClass(this.tableMainElement, rightClassName)
        } else if (scrollLeft === 0) {
            this.renderer.removeClass(this.tableMainElement, leftClassName)
            this.renderer.addClass(this.tableMainElement, rightClassName)
        } else if (isRemaveRight) {
            this.renderer.removeClass(this.tableMainElement, rightClassName)
            this.renderer.addClass(this.tableMainElement, leftClassName)
        } else {
            this.renderer.addClass(this.tableMainElement, leftClassName)
            this.renderer.addClass(this.tableMainElement, rightClassName)
        }
    }

    drop(e: CdkDragDrop<unknown>): void {
        this.drop$.next(e)
    }

    public ngOnChanges(changes: SimpleChanges): void {
        const {data} = changes
        if (data)
            this.data$.next()
    }

    ngOnInit(): void {
        const showEmpty$ = this.styleSvc.showEmpty()
        showEmpty$.subscribe(s => {
            this._cd.markForCheck()
            this.showEmpty$.next(s)
        })
    }

    public ngAfterViewInit(): void {
        if (this.platform.isBrowser === undefined)
            return
        const scrollEvent$ = this.scroll$.pipe(
            startWith(null),
            delay(0),
            switchMap(() => fromEvent<MouseEvent>(
                this._scrollElement,
                'scroll',
            ).pipe(startWith(true))),
        )
        this.ngZone.runOutsideAngular(() => {
            this._subs.add(merge(scrollEvent$, this.data$, this.scroll$)
                .pipe(startWith(true), delay(0))
                .subscribe(() => {
                    this.setScrollPositionClassName()
                }))
        })
        this._subs
        // tslint:disable-next-line: no-magic-numbers
            .add(scrollEvent$.pipe(skip(1)).pipe(debounceTime(300)).subscribe((
            ) => {
                if (!this._isNearBottom())
                    return
                this.styleSvc.setScrollNearBottom()
            }))
        this._measureStickySize()
    }

    public ngOnDestroy(): void {
        this.setScrollPositionClassName(true)
        this.data$.complete()
        this.scroll$.complete()
        this._subs.unsubscribe()
    }
    private data$ = new Subject<void>()
    private scroll$ = new Subject<void>()
    private _subs = new Subscription()
    private _measureStickySize(): void {
        /**
         * Need to set sticky header top because ng-virtual will set
         * transform(translateY)
         */
        // https://stackblitz.com/edit/angular-table-virtual-scroll-sticky-headers-poiqm1?file=src%2Fapp%2Fapp.component.ts
        const viewport = this.cdkVirtualScrollViewport
        if (viewport === undefined)
            return
        this._subs.add(viewport.scrolledIndexChange
            .pipe(
                map(() => viewport.getOffsetToRenderedContentStart() ?? 0 * -1),
                distinctUntilChanged(),
            )
            .subscribe(offset => {
                this.virtualScrollOffset = `${-offset}px`
                this._cd.detectChanges()
            }))
        this._subs.add(viewport.renderedRangeStream.subscribe(range => {
            if (this.virtualItemSize === undefined)
                // tslint:disable-next-line: no-throw-unless-asserts
                throw Error('please set virtualItemSize')
            const virtualOffset = `${range.start * -this.virtualItemSize}px`
            if (virtualOffset === this.virtualScrollOffset)
                return
            this.virtualScrollOffset = virtualOffset
            this._cd.detectChanges()
        }))
    }

    private _isNearBottom(): boolean {
        const position = this._scrollElement.scrollTop +
            this._scrollElement.offsetHeight
        return position >= this._scrollElement.scrollHeight
    }

    private get _scrollElement(): HTMLElement {
        return this.elementRef.nativeElement
    }
}
