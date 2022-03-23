import {
    FlexibleConnectedPositionStrategy,
    HorizontalConnectionPos,
    Overlay,
    OverlayRef,
    VerticalConnectionPos,
} from '@angular/cdk/overlay'
import {TemplatePortal} from '@angular/cdk/portal'
import {
    AfterContentInit,
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    Inject,
    Input,
    OnDestroy,
    Optional,
    Output,
    Self,
    ViewContainerRef,
} from '@angular/core'
import {merge, Observable, of, Subscription} from 'rxjs'
import {filter} from 'rxjs/operators'

import {LogiMenuComponent, LOGI_MENU_PANEL, MenuCloseReason} from './component'
import {LogiMenuItemDirective} from './item.directive'

export const MENU_PANEL_TOP_PADDING = 8

// tslint:disable: unknown-instead-of-any no-null-keyword
@Directive()
export abstract class LogiMenuTriggerBaseDirective implements AfterContentInit,
OnDestroy {
    public constructor(
        // tslint:disable-next-line: parameter-properties
        protected readonly el: ElementRef,
        protected readonly overlay: Overlay,
        private readonly _viewContainerRef: ViewContainerRef,
         @Optional() @Self()
        private readonly _menuItemInstance: LogiMenuItemDirective,
        @Inject(LOGI_MENU_PANEL) @Optional() parentMenu: LogiMenuComponent,
    ) {
        if (parentMenu)
            this._parentMenu = parentMenu
        if (_menuItemInstance)
            _menuItemInstance.triggersSubmenu = this.triggersSubmenu()
    }

    @Input() public menuData: any = {}

    @Output() public readonly menuOpened$ = new EventEmitter<void>()

    @Output() public readonly menuClosed$ = new EventEmitter<void>()

    @HostBinding('attr.aria-controls')
    public get menuPanelId(): string | null {
        // tslint:disable-next-line: no-null-keyword
        return this._menuOpen ? this._menu.panelId : null
    }

    get menuOpen(): boolean {
        return this._menuOpen
    }

    public ngAfterContentInit(): void {
        this._handleHover()
    }

    public ngOnDestroy(): void {
        if (this._overlayRef) {
            this._overlayRef.dispose()
            this._overlayRef = null
        }
        this._menuCloseSubscription.unsubscribe()
        this._closingActionsSubscription.unsubscribe()
        this._hoverSubscription.unsubscribe()
    }

    public setMenu(menu: LogiMenuComponent): void {
        if (menu === this._menu)
            return
        this._menu = menu
        this._menuCloseSubscription.unsubscribe()
        if (!menu)
            return
        if (menu === this._parentMenu)
            // tslint:disable-next-line: no-throw-unless-asserts
            throw Error('递归使用menu')

        this._menuCloseSubscription = menu.close$.subscribe((
            reason: MenuCloseReason,
        ) => {
            this._destroyMenu()

            if ((reason === 'click' || reason === 'tab') && this._parentMenu)
                this._parentMenu.close$.emit()
        })
    }

    public openMenu(event: MouseEvent): void {
        if (this._menu === undefined || this._menu.disabled)
            return
        if (this._menuOpen)
            return
        event?.preventDefault()
        event?.stopPropagation()
        const overlayRef = this.createOverlay(event)
        const overlayConfig = overlayRef.getConfig()
        this._setPosition(
            // tslint:disable-next-line: no-type-assertion
            overlayConfig.positionStrategy as FlexibleConnectedPositionStrategy,
        )
        overlayConfig.hasBackdrop = this._menu.hasBackdrop === undefined ?
            !this.triggersSubmenu() : this._menu.hasBackdrop
        overlayRef.attach(this._getPortal())
        if (this._menu.lazyContent)
            this._menu.lazyContent.attach({$implicit: this.menuData})
        this._closingActionsSubscription =
            this._menuClosingActions().subscribe(() => this.closeMenu())
        this._initMenu()
    }

    public closeMenu(): void {
        this._menu.close$.emit()
    }

    public triggersSubmenu(): boolean {
        return !!(this._menuItemInstance && this._parentMenu)
    }

    protected _overlayRef: OverlayRef | null = null
    protected _menu!: LogiMenuComponent
    protected _menuOpen = false

    protected abstract createOverlay(event: MouseEvent): OverlayRef
    private _portal?: TemplatePortal
    private _parentMenu?: LogiMenuComponent
    private _closingActionsSubscription = Subscription.EMPTY
    private _menuCloseSubscription = Subscription.EMPTY
    private _hoverSubscription = Subscription.EMPTY

    private _setPosition(positionStrategy: FlexibleConnectedPositionStrategy) {
        let [originX, originFallbackX]: HorizontalConnectionPos[] =
        this._menu.xPosition === 'before' ? ['end', 'start'] : ['start', 'end']

        const [overlayY, overlayFallbackY]: VerticalConnectionPos[] =
        this._menu.yPosition === 'above' ? ['bottom', 'top'] : ['top', 'bottom']

        let [originY, originFallbackY] = [overlayY, overlayFallbackY]
        let [overlayX, overlayFallbackX] = [originX, originFallbackX]
        let offsetY = 0

        if (this.triggersSubmenu()) {
            overlayFallbackX = originX = this._menu.xPosition === 'before' ? 'start' : 'end'
            originFallbackX = overlayX = originX === 'end' ? 'start' : 'end'
            offsetY = overlayY === 'bottom' ? MENU_PANEL_TOP_PADDING : -MENU_PANEL_TOP_PADDING
        } else if (!this._menu.overlapTrigger) {
            originY = overlayY === 'top' ? 'bottom' : 'top'
            originFallbackY = overlayFallbackY === 'top' ? 'bottom' : 'top'
        }

        positionStrategy.withPositions([
        {originX, originY, overlayX, overlayY, offsetY},
        {originX: originFallbackX, originY, overlayX: overlayFallbackX, overlayY, offsetY},
            {
                originX,
                originY: originFallbackY,
                overlayX,
                overlayY: overlayFallbackY,
                offsetY: -offsetY,
            },
            {
                originX: originFallbackX,
                originY: originFallbackY,
                overlayX: overlayFallbackX,
                overlayY: overlayFallbackY,
                offsetY: -offsetY,
            },
        ])
    }

    private _getPortal(): TemplatePortal {
        if (!this._portal ||
            this._portal.templateRef !== this._menu.templateRef)
            this._portal = new TemplatePortal(
                this._menu.templateRef,
                this._viewContainerRef,
            )
        return this._portal
    }

    private _menuClosingActions(): Observable<unknown> {
        const backdropClick$ = this._overlayRef!.backdropClick()
        const detachements$ = this._overlayRef!.detachments()
        const parentClose$ = this._parentMenu ? this._parentMenu.close$ : of()
        const hover$ = this._parentMenu ? this._parentMenu.hovered().pipe(
            filter(active => active !== this._menuItemInstance),
            filter(() => this._menuOpen),
        ) : of()
        return merge(backdropClick$, detachements$, parentClose$, hover$)
    }

    private _initMenu(): void {
        this._menu.parentMenu = this
            .triggersSubmenu() ? this._parentMenu : undefined
        this._setIsMenuOpen(true)
    }

    private _destroyMenu(): void {
        if (!this._overlayRef || !this._menuOpen)
            return
        const menu = this._menu
        this._closingActionsSubscription.unsubscribe()
        this._overlayRef.detach()
        this._setIsMenuOpen(false)

        if (menu.lazyContent)
            menu.lazyContent.detach()
    }

    private _setIsMenuOpen(isOpen: boolean): void {
        this._menuOpen = isOpen
        this._menuOpen ? this.menuOpened$.emit() : this.menuClosed$.emit()

        if (this.triggersSubmenu())
            this._menuItemInstance.highlighted = isOpen
    }

    private _handleHover(): void {
        if (!this.triggersSubmenu() || !this._parentMenu)
            return

        this._hoverSubscription = this._parentMenu
            .hovered()
            .pipe(filter(
                active => active === this._menuItemInstance && !active.disabled,
            ))
            .subscribe(() => {
          // @ts-ignore
                this.openMenu()
            })
    }
}
