// tslint:disable: file-name-casing
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * code from https://github.com/angular/material2
 */
import {Direction, Directionality} from '@angular/cdk/bidi'
import {Platform} from '@angular/cdk/platform'
import {
  AfterContentChecked,
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  Output,
  QueryList,
  Renderer2,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core'
import {LogiSizeLDSType} from '@logi/src/web/base/types'
import {pxToNumber} from '@logi/src/web/base/utils'
import {ResizeService} from '@logi/src/web/ui/common/services'
import {merge, of, Subject, Subscription} from 'rxjs'
import {startWith, takeUntil} from 'rxjs/operators'

import {LogiTabLabelDirective} from './tab-label.directive'
import {TabPosition, TabPositionMode} from './table.types'
import {LogiTabsInkBarDirective} from './tabs-ink-bar.directive'

export type ScrollDirection = 'after' | 'before'
const EXAGGERATED_OVERSCROLL = 64

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    exportAs: 'logiTabsNav',
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        '[class.logi-tabs-bar]': 'true',
        '[class.logi-tabs-bottom-bar]': 'tabPosition === "bottom"',
        '[class.logi-tabs-card-bar]': 'tabType === "card"',
        '[class.logi-tabs-default-bar]': 'logiSize === "default"',
        '[class.logi-tabs-large-bar]': 'logiSize === "large"',
        '[class.logi-tabs-left-bar]': 'tabPosition === "left"',
        '[class.logi-tabs-right-bar]': 'tabPosition === "right"',
        '[class.logi-tabs-small-bar]': 'logiSize === "small"',
        '[class.logi-tabs-top-bar]': 'tabPosition === "top"',
    },
    preserveWhitespaces: false,
    selector: 'logi-tabs-nav',
    styleUrls: ['./tabs-nav.style.scss'],
    templateUrl: './tabs-nav.template.html',
})
export class LogiTabsNavComponent implements
AfterContentChecked, AfterContentInit, OnDestroy {
    @Input() public set positionMode(value: TabPositionMode) {
        this._tabPositionMode = value
        this._alignInkBarToSelectedTab()
        if (this.showPagination)
            Promise.resolve().then(() => {
                this._updatePagination()
            })
    }

    public get positionMode(): TabPositionMode {
        return this._tabPositionMode
    }

    @Input()
  public set selectedIndex(value: number) {
      this._selectedIndexChanged = this._selectedIndex !== value
      this._selectedIndex = value
  }

    public get selectedIndex(): number {
        return this._selectedIndex
    }

  /**
   * Sets the distance in pixels that the tab header should be transformed in
   * the X-axis.
   */
    public set scrollDistance(v: number) {
        this._scrollDistance = Math
            .max(0, Math.min(this._getMaxScrollDistance(), v))

    /**
     * Mark that the scroll distance has changed so that after the view is
     * checked, the CSS transformation can move the header.
     */
        this._scrollDistanceChanged = true

        this._checkScrollingControls()
    }

    public get scrollDistance(): number {
        return this._scrollDistance
    }

    public get viewWidthHeightPix(): number {
        let paginationPix = 0
        if (this.showPaginationControls)
            paginationPix = this.navContainerScrollPaddingPix
        if (this.positionMode === 'horizontal')
            return this._navContainerElement.nativeElement.offsetWidth -
                paginationPix
        return this._navContainerElement.nativeElement.offsetHeight -
            paginationPix
    }

    public get navContainerScrollPaddingPix(): number {
        if (this._platform.isBrowser) {
            const navContainer = this._navContainerElement.nativeElement
            const originStyle: CSSStyleDeclaration = window.getComputedStyle
        ? window.getComputedStyle(navContainer)
        // tslint:disable-next-line: unknown-instead-of-any no-type-assertion
        : (navContainer as any).currentStyle // currentStyle for IE < 9
            if (this.positionMode === 'horizontal')
                return pxToNumber(
                    originStyle.paddingLeft,
                ) + pxToNumber(originStyle.paddingRight)

            return pxToNumber(originStyle.paddingTop) + pxToNumber(
                originStyle.paddingBottom,
            )
        }
        return 0
    }

    public get tabListScrollWidthHeightPix(): number {
        if (this.positionMode === 'horizontal')
            return this._navListElement.nativeElement.scrollWidth

        return this._navListElement.nativeElement.scrollHeight
    }

    public get tabListScrollOffSetWidthHeight(): number {
        if (this.positionMode === 'horizontal')
            return this._scrollListElement.nativeElement.offsetWidth

        return this._elementRef.nativeElement.offsetHeight
    }

    public constructor(
        private readonly _elementRef: ElementRef,
        private readonly _ngZone: NgZone,
        private readonly _renderer: Renderer2,
        private readonly _cdr: ChangeDetectorRef,
        private readonly _platform: Platform,
        private readonly _resizeService: ResizeService,
        @Optional() private readonly _dir: Directionality,
    ) {}
    public showPaginationControls = false
    public disableScrollAfter = true
    public disableScrollBefore = true
    @Output() public readonly nextClick = new EventEmitter<void>()
    @Output() public readonly prevClick = new EventEmitter<void>()
    @Input() public tabBarExtraStartContent?: TemplateRef<void>
    @Input() public tabBarExtraEndContent?: TemplateRef<void>
    @Input() public animated = true
    @Input() public hideBar = false
    @Input() public hiddenInkBar = false
    @Input() public showPagination = true
    @Input() public tabType = 'line'
    @Input() public logiSize?: LogiSizeLDSType
    @Input() public tabPosition: TabPosition = 'top'
    @Input() public alwaysShowPaginationControls: boolean | undefined

    // tslint:disable-next-line: codelyzer-template-property-should-be-public
    public el(): HTMLElement {
        return this._elementRef.nativeElement
    }

    public onContentChanges(): void {
        const textContent = this.el().textContent ?? ''
        /**
         * We need to diff the text content of the header, because the
         * MutationObserver callback will fire even if the text content didn't
         * change which is inefficient and is prone to infinite loops if a
         * poorly constructed expression is passed in (see #14249).
         */
        if (textContent === this._currentTextContent)
            return
        this._currentTextContent = textContent
        this._ngZone.run(() => {
            if (this.showPagination)
                this._updatePagination()
            this._alignInkBarToSelectedTab()
            this._cdr.markForCheck()
        })
    }

    public scrollHeader(scrollDir: ScrollDirection): void {
        if (scrollDir === 'before' && !this.disableScrollBefore)
            this.prevClick.emit()
        else if (scrollDir === 'after' && !this.disableScrollAfter)
            this.nextClick.emit()
        /**
         * Move the scroll distance one-third the length of the tab list's
         * viewport.
         */
        this.scrollDistance += ((scrollDir === 'before' ? -1 : 1) *
            // tslint:disable-next-line: no-magic-numbers
            this.viewWidthHeightPix) / 3
    }

    public ngAfterContentChecked(): void {
        if (this._tabLabelCount !== this._listOfLogiTabLabelDirective.length) {
            if (this.showPagination)
                this._updatePagination()
            this._tabLabelCount = this._listOfLogiTabLabelDirective.length
            this._cdr.markForCheck()
        }
        if (this._selectedIndexChanged) {
            this._scrollToLabel(this._selectedIndex)
            if (this.showPagination)
                this._checkScrollingControls()
            this._alignInkBarToSelectedTab()
            this._selectedIndexChanged = false
            this._cdr.markForCheck()
        }
        if (this._scrollDistanceChanged) {
            if (this.showPagination)
                this._updateTabScrollPosition()
            this._scrollDistanceChanged = false
            this._cdr.markForCheck()
        }
    }

    public ngAfterContentInit(): void {
        this._realignInkBar = this._ngZone.runOutsideAngular(() => {
            const dirChange = this._dir ? this._dir.change : of(undefined)
            const resize = typeof window !== undefined ? this._resizeService
                .subscribe()
                .pipe(takeUntil(this._destroy$)) : of(undefined)
            return merge(dirChange, resize)
                .pipe(startWith(undefined))
                .subscribe(() => {
                    if (this.showPagination)
                        this._updatePagination()
                    this._alignInkBarToSelectedTab()
                })
        })
    }

    public ngOnDestroy(): void {
        this._destroy$.next()
        this._destroy$.complete()

        if (this._realignInkBar)
            this._realignInkBar.unsubscribe()
    }
    @ContentChildren(LogiTabLabelDirective)
    private _listOfLogiTabLabelDirective!: QueryList<LogiTabLabelDirective>
    @ViewChild(LogiTabsInkBarDirective, {static: true})
    private _logiTabsInkBarDirective!: LogiTabsInkBarDirective
    @ViewChild('nav_container_element', {static: true})
    private _navContainerElement!: ElementRef<HTMLDivElement>
    @ViewChild('nav_list_element', {static: true})
    private _navListElement!: ElementRef<HTMLDivElement>
    @ViewChild('scroll_list_element', {static: true})
    private _scrollListElement!: ElementRef<HTMLDivElement>
    private _scrollDistanceChanged?: boolean
    private _realignInkBar: Subscription | null = null
    private _tabLabelCount?: number
    private _selectedIndexChanged = false

    private _tabPositionMode: TabPositionMode = 'horizontal'
    private _scrollDistance = 0
    private _selectedIndex = 0
    /**
     * Cached text content of the header.
     */
    private _currentTextContent?: string
    private _destroy$ = new Subject<void>()

    private _alignInkBarToSelectedTab(): void {
        if (this.tabType !== 'line')
            return
        const selectedLabelWrapper = this._listOfLogiTabLabelDirective &&
        this._listOfLogiTabLabelDirective.length
            ? this._listOfLogiTabLabelDirective
                .toArray()[this.selectedIndex].elementRef.nativeElement
            : null
        if (this._logiTabsInkBarDirective)
            this._logiTabsInkBarDirective.alignToElement(selectedLabelWrapper)
    }

    private _getLayoutDirection(): Direction {
        return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr'
    }

  /**
   * Determines what is the maximum length in pixels that can be set for the
   * scroll distance. This is equal to the difference in width between the tab
   * list container and tab header container.
   *
   * This is an expensive call that forces a layout reflow to compute box and
   * scroll metrics and should be called sparingly.
   */
    private _getMaxScrollDistance(): number {
        return (this.tabListScrollWidthHeightPix - this.viewWidthHeightPix) < 0 ? 0 :
        (this.tabListScrollWidthHeightPix - this.viewWidthHeightPix)
    }

    private _checkScrollingControls(): void {
    // Check if the pagination arrows should be activated.
        this.disableScrollBefore = this.scrollDistance === 0
        this.disableScrollAfter = this.scrollDistance === this
            ._getMaxScrollDistance()
        this._cdr.markForCheck()
    }

    private _scrollToLabel(labelIndex: number): void {
        const selectedLabel = this._listOfLogiTabLabelDirective ?
            this._listOfLogiTabLabelDirective.toArray()[labelIndex] : undefined
        if (!selectedLabel)
            return
      // The view length is the visible width of the tab labels.

        let labelBeforePos: number
        let labelAfterPos: number
        if (this.positionMode !== 'horizontal') {
            labelBeforePos = selectedLabel.getOffsetTop()
            labelAfterPos = labelBeforePos + selectedLabel.getOffsetHeight()
        } else
            if (this._getLayoutDirection() === 'ltr') {
                labelBeforePos = selectedLabel.getOffsetLeft()
                labelAfterPos = labelBeforePos + selectedLabel.getOffsetWidth()
            } else {
                labelAfterPos = this._navListElement.nativeElement.offsetWidth -
                    selectedLabel.getOffsetLeft()
                labelBeforePos = labelAfterPos - selectedLabel.getOffsetWidth()
            }
        const beforeVisiblePos = this.scrollDistance
        const afterVisiblePos = this.scrollDistance + this.viewWidthHeightPix

        if (labelBeforePos < beforeVisiblePos)
        // Scroll header to move label to the before direction
            this.scrollDistance -= beforeVisiblePos - labelBeforePos +
                EXAGGERATED_OVERSCROLL
        else if (labelAfterPos > afterVisiblePos)
        // Scroll header to move label to the after direction
            this.scrollDistance += labelAfterPos - afterVisiblePos +
                EXAGGERATED_OVERSCROLL
    }

    private _checkPaginationEnabled(): void {
        if (this.alwaysShowPaginationControls !== undefined) {
            this.showPaginationControls = this.alwaysShowPaginationControls
            return
        }
        const isEnabled = this.tabListScrollWidthHeightPix >
            this.tabListScrollOffSetWidthHeight
        if (!isEnabled)
            this.scrollDistance = 0
        if (isEnabled !== this.showPaginationControls)
            this._cdr.markForCheck()
        this.showPaginationControls = isEnabled
    }

    private _updatePagination(): void {
        this._checkPaginationEnabled()
        this._checkScrollingControls()
        this._updateTabScrollPosition()
    }

    private _updateTabScrollPosition(): void {
        const scrollDistance = this.scrollDistance
        if (this.positionMode === 'horizontal') {
            const translateX = this
                ._getLayoutDirection() === 'ltr' ? -scrollDistance : scrollDistance
            this._renderer.setStyle(
                this._navListElement.nativeElement,
                'transform',
                `translate3d(${translateX}px, 0, 0)`,
            )
        } else
      this._renderer.setStyle(
          this._navListElement.nativeElement,
          'transform',
          `translate3d(0,${-scrollDistance}px, 0)`,
      )
    }
}
