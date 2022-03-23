// tslint:disable: no-type-assertion unknown-instead-of-any
import {coerceBooleanProperty} from '@angular/cdk/coercion'
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    ContentChildren,
    EventEmitter,
    InjectionToken,
    Input,
    OnDestroy,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core'
import {merge, Observable, Subscription} from 'rxjs'
import {startWith, switchMap} from 'rxjs/operators'

import {
    LogiMenuContentDirective,
    LOGI_MENU_CONTENT_TOKEN,
} from './content.directive'
import {LogiMenuItemDirective} from './item.directive'

export const LOGI_MENU_PANEL = new InjectionToken<LogiMenuComponent>('logi-menu-panel')

export type MenuCloseReason = void | 'click' | 'keydown' | 'tab'
export type MenuPositionX = 'before' | 'after'
export type MenuPositionY = 'above' | 'below'

// tslint:disable-next-line: naming-convention
let menuPanelUid = 0

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    exportAs: 'logiMenu',
    providers: [{provide: LOGI_MENU_PANEL, useExisting: LogiMenuComponent}],
    selector: 'logi-menu',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class LogiMenuComponent implements AfterContentInit, OnDestroy {
    @Input() public set xPosition(value: MenuPositionX) {
        if (value !== 'before' && value !== 'after')
            return
        this._xPosition = value
    }

    public get xPosition(): MenuPositionX {
        return this._xPosition
    }

    @Input()
    public set yPosition(value: MenuPositionY) {
        if (value !== 'above' && value !== 'below')
            return
        this._yPosition = value
    }

    public get yPosition(): MenuPositionY {
        return this._yPosition
    }

    @Input() public set overlapTrigger(value: boolean) {
        this._overlapTrigger = coerceBooleanProperty(value)
    }

    public get overlapTrigger(): boolean {
        return this._overlapTrigger
    }

    @Input() public set hasBackdrop(value: boolean | undefined) {
        this._hasBackdrop = coerceBooleanProperty(value)
    }

    public get hasBackdrop(): boolean | undefined {
        return this._hasBackdrop
    }
    @Input() public menuClass = ''
    @Input() public backdropClass = ''
    @Input() public disabled = false
    @Output() public readonly close$ = new EventEmitter<MenuCloseReason>()
    @ViewChild(TemplateRef) public templateRef!: TemplateRef<any>
    /**
     * If using directive class instead of token here, it will throw error in
     * release environment when triggering menu.
     */
    @ContentChild(LOGI_MENU_CONTENT_TOKEN)
    public lazyContent?: LogiMenuContentDirective
    @ContentChildren(LogiMenuItemDirective, {descendants: true})
    public allItems!: QueryList<LogiMenuItemDirective>
    public visibleMenuItems: readonly LogiMenuItemDirective[] = []
    public overlayPanelClass = ''
    public parentMenu?: LogiMenuComponent

    /**
     * The panel id is used for aria-controls attribute in menu trigger host.
     * Test harness also use this id.
     */
    // tslint:disable-next-line: increment-decrement
    public readonly panelId = `logi-menu-panel-${menuPanelUid++}`

    public ngAfterContentInit(): void {
        this._updateDirectDescendants()
    }

    public ngOnDestroy(): void {
        this._directDescendantItems.destroy()
        this.close$.complete()
        this._subscription.unsubscribe()
    }

    public hovered(): Observable<LogiMenuItemDirective> {
        const itemChanges = this._directDescendantItems.changes as
            Observable<QueryList<LogiMenuItemDirective>>
        return itemChanges.pipe(
            startWith(this._directDescendantItems),
            switchMap(items => merge(...items
                .map((item: LogiMenuItemDirective) => item.hovered$))),
        ) as Observable<LogiMenuItemDirective>
    }
    private _overlapTrigger = false

    private _subscription: Subscription = new Subscription()
    private _directDescendantItems = new QueryList<LogiMenuItemDirective>()
    private _hasBackdrop?: boolean
    private _xPosition: MenuPositionX = 'after'
    private _yPosition: MenuPositionY = 'below'

    private _updateDirectDescendants(): void {
        this.allItems.changes
            .pipe(startWith(this.allItems))
            .subscribe((items: QueryList<LogiMenuItemDirective>) => {
                this._directDescendantItems.reset(
                    items.filter(item => item.parentMenu === this),
                )
                this._directDescendantItems.notifyOnChanges()
            })
    }
}
