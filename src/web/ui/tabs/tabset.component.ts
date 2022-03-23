/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * get some code from https://github.com/angular/material2
 */

import {CdkDragDrop} from '@angular/cdk/drag-drop'
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
    OnChanges,
    OnDestroy,
    Optional,
    Output,
    QueryList,
    Renderer2,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewEncapsulation,
} from '@angular/core'
import {
    NavigationEnd,
    Router,
    RouterLink,
    RouterLinkWithHref,
    UrlTree,
} from '@angular/router'
import {LogiSizeLDSType} from '@logi/src/web/base/types'
import {toNumber, toObservable} from '@logi/src/web/base/utils'
import {SplitAreaDirective, SplitComponent} from '@logi/src/web/ui/split'
import {merge, Subject, Subscription} from 'rxjs'
import {filter, first, startWith, takeUntil} from 'rxjs/operators'

import {LogiTabComponent} from './tab.component'
import {
    TabAnimatedInterface,
    TabChangeEvent,
    TabPosition,
    TabPositionMode,
    TabsCanDeactivateFn,
    TabType,
} from './table.types'
import {LogiTabsNavComponent} from './tabs-nav.component'

export const LOGI_CONFIG_COMPONENT_NAME = 'tabs'
export interface TabLocation {
    readonly oldPosition: number,
    readonly newPosition: number,
}

// tslint:disable: no-null-keyword no-type-assertion
// tslint:disable: codelyzer-template-property-should-be-public
// tslint:disable: no-unnecessary-boolean-condition
// tslint:disable: early-exit limit-indent-for-method-in-class
// tslint:disable: object-literal-sort-keys
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    exportAs: 'logiTabset',
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        class: 'logi-tabs',
        '[class.logi-tabs-bottom]': 'tabPosition === "bottom"',
        '[class.logi-tabs-left]': 'tabPosition === "left"',
        '[class.logi-tabs-right]': 'tabPosition === "right"',
        '[class.logi-tabs-top]': 'tabPosition === "top"',
        '[class.logi-tabs-vertical]': 'tabPosition === "left" || tabPosition === "right"',
        '[class.logi-tabs-large]': 'logiSize === "large"',
        '[class.logi-tabs-small]': 'logiSize === "small"',
        '[class.logi-tabs-card]': 'tabType === "card"',
        '[class.logi-tabs-line]': 'tabType === "line"',
        '[class.logi-tabs-no-animation]': 'isAnimationDisabled',
        '[class.logi-sheet-style-tabs]': 'logiTabStyle === "sheet"',
        '[class.logi-panel-style-tabs]': 'logiTabStyle === "panel"',
        '[class.logi-box-style-tabs]': 'logiTabStyle === "box"',
    },
    preserveWhitespaces: false,
    selector: 'logi-tabset',
    styleUrls: [
        './logi_style/logi_box.scss',
        './logi_style/logi_panel.scss',
        './logi_style/logi_sheet.scss',
        './tabset.style.scss',
    ],
    templateUrl: './tabset.template.html',
})
export class LogiTabSetComponent implements
AfterContentChecked, OnChanges, AfterContentInit, OnDestroy {
    @Input()
    public set selectedIndex(value: number | null) {
        this._indexToSelect = value ? toNumber(value, null) : null
    }

    public get selectedIndex(): number | null {
        return this._selectedIndex
    }

    public get inkBarAnimated(): boolean {
        return this.tabAnimated === true ||
            (this.tabAnimated as TabAnimatedInterface).inkBar === true
    }

    public get tabPaneAnimated(): boolean {
        return this.tabAnimated === true ||
            (this.tabAnimated as TabAnimatedInterface).tabPane === true
    }

    public get isAnimationDisabled(): boolean {
        return this.tabAnimated === false ||
            (this.tabAnimated as TabAnimatedInterface).tabPane === false
    }

    public constructor(
    private readonly _renderer: Renderer2,
    private readonly _elementRef: ElementRef,
    private readonly _cdr: ChangeDetectorRef,
    @Optional() private readonly _router: Router,
    ) {}
    public tabPositionMode: TabPositionMode = 'horizontal'

    @Input() public tabBarExtraStartContent?: TemplateRef<void>
    @Input() public tabBarExtraEndContent?: TemplateRef<void>
    @Input() public tabBodyExtraContent?: TemplateRef<void>
    @Input() public showPagination = true
    @Input() public tabAnimated: TabAnimatedInterface | boolean = false
    @Input() public hideAll = false
    @Input() public hiddenInkBar = false
    @Input() public tabPosition: TabPosition = 'top'
    @Input() public logiSize: LogiSizeLDSType = 'default'
    @Input() public tabBarGutter?: number
    // tslint:disable-next-line: no-indexable-types
    @Input() public tabBarStyle: {[key: string]: string } | null = null
    @Input() public tabType: TabType = 'line'
    @Input() public linkRouter = false
    @Input() public linkExact = true
    // tslint:disable-next-line: no-input-prefix
    @Input() public canDeactivate: TabsCanDeactivateFn | null = null
    @Input() public alwaysShowPaginationControls: boolean | undefined
    @Input() public disabledDrop = true
    @Input() public extraMode = false
    @Input() public dragBoundary!: ElementRef<HTMLElement> | HTMLElement
    @Input() public logiTabStyle?: 'box' | 'sheet' | 'panel'

    @Output() public readonly nextClick = new EventEmitter<void>()
    @Output() public readonly prevClick = new EventEmitter<void>()
    @Output() public readonly dragTabLocation = new EventEmitter<TabLocation>()
    @Output()
    // tslint:disable-next-line: ter-max-len
    public readonly selectChange = new EventEmitter<TabChangeEvent>(true)
    @Output() public readonly selectedIndexChange = new EventEmitter<number>()
    @Output() public readonly splitEnd$ = new EventEmitter()
    @Output() public readonly dragStartedIndex$ = new EventEmitter<number>()
    @ContentChildren(LogiTabComponent)
    public listOfLogiTabComponent!: QueryList<LogiTabComponent>
    @ViewChildren(SplitAreaDirective)
    public splitArea!: QueryList<SplitAreaDirective>
    public onSplitDragEnd(): void {
        this.splitEnd$.next()
        this.splitArea.forEach(r => {
            r.freePointerEvents()
        })
    }

    public onSplitDragStart(): void {
        this.splitArea.forEach(r => {
            r.lockPointerEvents()
        })
    }

    public dragStarted(i: number): void {
        this.dragStartedIndex$.next(i)
    }

    public clickLabel(index: number, disabled: boolean): void {
        if (disabled)
            return
        if (this.selectedIndex !== null && this.selectedIndex !== index &&
            typeof this.canDeactivate === 'function') {
            const observable = toObservable(this
                .canDeactivate(this.selectedIndex, index))
            observable.pipe(first(), takeUntil(this._destroy$)).subscribe(
                canChange => canChange && this._emitClickEvent(index),
            )
            return
        }
        this._emitClickEvent(index)
    }

    public createChangeEvent(index: number): TabChangeEvent {
        const event = new TabChangeEvent()
        event.index = index
        if (this.listOfLogiTabComponent && this.listOfLogiTabComponent.length) {
            event.tab = this.listOfLogiTabComponent.toArray()[index]
            this.listOfLogiTabComponent.forEach((item, i) => {
                if (i !== index)
                    item.logiDeselect.emit()
            })
            event.tab.logiSelect.emit()
        }
        return event
    }

    public drop(event: CdkDragDrop<readonly string[]>): void {
        this.dragTabLocation.next({
            newPosition: event.currentIndex,
            oldPosition: event.previousIndex,
        })
    }

    public ngOnChanges(changes: SimpleChanges): void {
        // tslint:disable-next-line: typedef
        const {tabPosition, logiType} = changes
        if (tabPosition) {
            this.tabPosition === 'top' || this.tabPosition === 'bottom' ?
                this.tabPositionMode = 'horizontal' :
                this.tabPositionMode = 'vertical'
            this._setPosition(this.tabPosition)
        }
        if (logiType === undefined)
            return
        if (this.tabType === 'card')
            this.tabAnimated = false
    }

    public ngAfterContentChecked(): void {
        if (this.listOfLogiTabComponent && this.listOfLogiTabComponent.length) {
            const indexToSelect = (this._indexToSelect = this
                ._clampTabIndex(this._indexToSelect))
            if (this._selectedIndex !== indexToSelect) {
                const isFirstRun = this._selectedIndex == undefined
                if (!isFirstRun)
                    this.selectChange
                        .emit(this.createChangeEvent(indexToSelect))

                Promise.resolve().then(() => {
                    this.listOfLogiTabComponent.forEach((
                        tab,
                        index,
                    ) => (tab.isActive = index === indexToSelect))

                    if (!isFirstRun)
                        this.selectedIndexChange.emit(indexToSelect)
                })
            }

            this.listOfLogiTabComponent
                .forEach((tab: LogiTabComponent, index: number) => {
                    tab.position = index - indexToSelect

                    if (this._selectedIndex != undefined &&
                        tab.position === 0 && !tab.origin)
                        tab.origin = indexToSelect - this._selectedIndex
                })

            if (this._selectedIndex !== indexToSelect) {
                this._selectedIndex = indexToSelect
                this._cdr.markForCheck()
            }
        }
    }

    public ngAfterContentInit(): void {
        this._subscribeToTabLabels()
        this._setPosition(this.tabPosition)

        if (this.linkRouter) {
            if (!this._router)
                // tslint:disable-next-line: ter-max-len
                // tslint:disable-next-line: no-throw-unless-asserts no-unexternalized-strings
                throw new Error('you should import \'RouterModule\' if you want to use \'logiLinkRouter\'!')

            this._router.events
                .pipe(
                    takeUntil(this._destroy$),
                    filter(e => e instanceof NavigationEnd),
                    startWith(true),
                )
                .subscribe(() => {
                    this._updateRouterActive()
                    this._cdr.markForCheck()
                })
        }
        this._tabsSubscription = this.listOfLogiTabComponent.changes
            .subscribe(() => {
                const indexToSelect = this._clampTabIndex(this._indexToSelect)

                if (indexToSelect === this._selectedIndex) {
                    const tabs = this.listOfLogiTabComponent.toArray()

                    for (let i = 0; i < tabs.length; i = i + 1)
                        if (tabs[i].isActive) {
                            this._indexToSelect = this._selectedIndex = i
                            break
                        }
                }

                this._subscribeToTabLabels()
                this._cdr.markForCheck()
            })
    }

    public ngOnDestroy(): void {
        this._tabsSubscription.unsubscribe()
        this._tabLabelSubscription.unsubscribe()
        this._destroy$.next()
        this._destroy$.complete()
    }
    @ViewChild(LogiTabsNavComponent, {static: true})
    private _tabsNavComponent?: LogiTabsNavComponent
    @ViewChild('tab_content', {static: true})
    private _tabContent?: SplitComponent

    private _indexToSelect: number | null = 0
    private _el: HTMLElement = this._elementRef.nativeElement
    private _selectedIndex: number | null = null
    private _tabsSubscription = Subscription.EMPTY
    private _tabLabelSubscription = Subscription.EMPTY
    private _destroy$ = new Subject<void>()

    private _setPosition(value: TabPosition): void {
        if (this._tabContent === undefined
            || this._tabsNavComponent === undefined)
            return
        value === 'bottom' ?
            this._renderer.insertBefore(
                this._el,
                this._tabContent.el(),
                this._tabsNavComponent.el(),
            ) :
            this._renderer.insertBefore(
                this._el,
                this._tabsNavComponent.el(),
                this._tabContent.el(),
            )
    }

    private _emitClickEvent(index: number): void {
        const tabs = this.listOfLogiTabComponent.toArray()
        this.selectedIndex = index
        tabs[index].logiClick.emit()
        this._cdr.markForCheck()
    }

    private _clampTabIndex(index: number | null): number {
        return Math.min(
            this.listOfLogiTabComponent.length - 1,
            Math.max(index || 0, 0),
        )
    }

    private _subscribeToTabLabels(): void {
        if (this._tabLabelSubscription)
            this._tabLabelSubscription.unsubscribe()
        this._tabLabelSubscription = merge(
            ...this.listOfLogiTabComponent.map(tab => tab.stateChanges$),
        ).subscribe(() => this._cdr.markForCheck())
    }

    private _updateRouterActive(): void {
        if (this._router.navigated) {
            const index = this._findShouldActiveTabIndex()
            if (index !== this._selectedIndex) {
                this.selectedIndex = index
                this.selectedIndexChange.emit(index)
            }
            this.hideAll = index === -1
        }
    }

    private _findShouldActiveTabIndex(): number {
        const tabs = this.listOfLogiTabComponent.toArray()
        const isActive = this._isLinkActive(this._router)

        return tabs.findIndex(tab => {
            const c = tab.linkDirective
            return c ? isActive(
                c.routerLink,
            ) || isActive(c.routerLinkWithHref) : false
        })
    }

    private _isLinkActive(
        router: Router,
    ): (link?: RouterLink | RouterLinkWithHref) => boolean {
        return (link?: RouterLink | RouterLinkWithHref) => (link ? router
            .isActive(link.urlTree as UrlTree, this.linkExact) : false)
    }
}
