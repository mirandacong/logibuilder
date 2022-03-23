// tslint:disable: no-type-assertion unknown-instead-of-any
// tslint:disable: ng-observable-naming-convention
// tslint:disable: ng-only-method-public-in-service
import {Overlay, OverlayRef, ScrollStrategyOptions} from '@angular/cdk/overlay'
import {ComponentPortal} from '@angular/cdk/portal'
import {ComponentRef, ElementRef, Injectable} from '@angular/core'
// tslint:disable-next-line:import-blacklist
import {Subject, Subscription} from 'rxjs'

import {PaletteComponent} from '../palette/component'

import {ContextMenuContentComponent} from './content.component'
import {
    ContextMenuClickEvent,
    ContextMenuClickEventBuilder,
} from './contextmenu_click_event'
import {ContextMenuItemDirective} from './item.directive'
import {ContextMenuOverlay, ContextMenuOverlayBuilder} from './overlay'
export interface CloseLeafMenuEvent {
    readonly exceptRootMenu?: boolean
    readonly event?: MouseEvent | KeyboardEvent
}

export interface CancelContextMenuEvent {
    readonly eventType: 'cancel'
    readonly event?: MouseEvent | KeyboardEvent
}
export interface ExecuteContextMenuEvent {
    readonly eventType: 'execute'
    readonly event?: MouseEvent | KeyboardEvent
    readonly item: any
    readonly menuItem: ContextMenuItemDirective
}
export type CloseContextMenuEvent =
ExecuteContextMenuEvent | CancelContextMenuEvent

@Injectable()
export class ContextMenuService {
    public constructor(
        private readonly _overlay: Overlay,
        private readonly _scrollStrategy: ScrollStrategyOptions) {}

    public isDestroyingLeafMenu = false

    public show = new Subject<ContextMenuClickEvent>()
    public triggerClose: Subject<ContextMenuContentComponent> = new Subject()
    public close: Subject<CloseContextMenuEvent> = new Subject()
    public closeSubMenusEvent = new Subject<CloseContextMenuEvent>()

    // tslint:disable-next-line:max-func-body-length
    public openContextMenu(context: ContextMenuClickEvent): void {
        const {
            anchorElement,
            event,
            parent,
            contextMenu,
        }: ContextMenuClickEvent = context
        if (!parent) {
            const mouseEvent = event as MouseEvent
            this._fakeElement.getBoundingClientRect = () => {
                return ({
                    bottom: mouseEvent.clientY,
                    height: 0,
                    left: mouseEvent.clientX,
                    right: mouseEvent.clientX,
                    top: mouseEvent.clientY,
                    width: 0,
                })
            }
            this.closeAllContextMenus({event, eventType: 'cancel'})
            const elRef = new ElementRef(anchorElement || this._fakeElement)
            const positionStrategy = this._overlay
                .position()
                .flexibleConnectedTo(elRef)
                .withPositions([
                    {
                        originX: 'start', originY: 'bottom',
                        overlayX: 'start', overlayY: 'top',
                    },
                    {
                        originX: 'start', originY: 'top',
                        overlayX: 'start', overlayY: 'bottom',
                    },
                    {
                        originX: 'end', originY: 'top',
                        overlayX: 'start', overlayY: 'top',
                    },
                    {
                        originX: 'start', originY: 'top',
                        overlayX: 'end', overlayY: 'top',
                    },
                    {
                        originX: 'end', originY: 'center',
                        overlayX: 'start', overlayY: 'center',
                    },
                    {
                        originX: 'start', originY: 'center',
                        overlayX: 'end', overlayY: 'center',
                    },
                ])
            const overlayRef = this._overlay.create({
                positionStrategy,
                // tslint:disable-next-line:object-literal-sort-keys
                panelClass: 'ngx-contextmenu',
                scrollStrategy: this._scrollStrategy.close(),
            })
            this._overlays = []
            this.attachContextMenu(overlayRef, context)
        } else {
            if (isPalettePortal(contextMenu)) {
                this.openPalette(context)
                return
            }
            const positionStrategy = this._overlay
                .position()
                .flexibleConnectedTo(
                    new ElementRef(event ? event.target : anchorElement),
                )
                .withPositions([
                    {
                        originX: 'end', originY: 'top',
                        overlayX: 'start', overlayY: 'top',
                    },
                    {
                        originX: 'start', originY: 'top',
                        overlayX: 'end', overlayY: 'top',
                    },
                    {
                        originX: 'end', originY: 'bottom',
                        overlayX: 'start', overlayY: 'bottom',
                    },
                    {
                        originX: 'start', originY: 'bottom',
                        overlayX: 'end', overlayY: 'bottom',
                    },
                ])

            const newOverlay = this._overlay.create({
                positionStrategy,
                // tslint:disable-next-line:object-literal-sort-keys
                panelClass: 'ngx-contextmenu',
                scrollStrategy: this._scrollStrategy.close(),
            })
            this.destroySubMenus(parent)
            this.attachContextMenu(newOverlay, context)
        }
    }

    /**
     * only use for onpen sheet tabs palette
     */
    public openPalette(context: ContextMenuClickEvent): void {
        const {anchorElement, event, parent}: ContextMenuClickEvent = context
        if (!parent)
            return
        const positionStrategy = this._overlay
            .position()
            .flexibleConnectedTo(
                new ElementRef(event ? event.target : anchorElement),
            )
            .withPositions([
                {
                    originX: 'end', originY: 'top',
                    overlayX: 'start', overlayY: 'top',
                },
                {
                    originX: 'start', originY: 'top',
                    overlayX: 'end', overlayY: 'top',
                },
                {
                    originX: 'end', originY: 'bottom',
                    overlayX: 'start', overlayY: 'bottom',
                },
                {
                    originX: 'start', originY: 'bottom',
                    overlayX: 'end', overlayY: 'bottom',
                },
            ])
        const overRef = this._overlay.create({
            positionStrategy,
            // tslint:disable-next-line:object-literal-sort-keys
            panelClass: 'sheet-palette',
            scrollStrategy: this._scrollStrategy.close(),

        })
        this.destroySubMenus(parent)
        const overlay = attachPalette(overRef, context)
        this._overlays.push(overlay)
    }

    // tslint:disable-next-line:max-func-body-length
    public attachContextMenu(
        overlayRef: OverlayRef,
        context: ContextMenuClickEvent,
    ): void {
        const {
            event,
            item,
            menuItems,
            menuClass,
        }: ContextMenuClickEvent = context

        const contextMenuContent: ComponentRef<ContextMenuContentComponent> =
            overlayRef.attach(new ComponentPortal(ContextMenuContentComponent))
        const instance = contextMenuContent.instance
        instance.event = event as MouseEvent | KeyboardEvent
        instance.item = item
        instance.menuItems = menuItems as ContextMenuItemDirective[]
        instance.menuClass = menuClass as string
        const contextmenuOverlayBuilder = new ContextMenuOverlayBuilder()
            .overlayRef(overlayRef)
            .bindingComponent(instance)
        if (context.parent !== undefined)
            contextmenuOverlayBuilder.parent(context.parent)
        const contextmenuOverlay = contextmenuOverlayBuilder.build()
        this._overlays.push(contextmenuOverlay)

        const subscriptions: Subscription = new Subscription()
        subscriptions.add(instance.execute
            .asObservable()
            .subscribe(e => this.closeAllContextMenus({
                eventType: 'execute',
                ...e,
            })))
        subscriptions.add(instance.closeAllMenus
            .asObservable()
            .subscribe(e => this.closeAllContextMenus({
                eventType: 'cancel',
                ...e,
            })))
        subscriptions.add(instance.closeSubMenus
            .asObservable()
            .subscribe(() => this.destroySubMenus(contextmenuOverlay)))
        subscriptions.add(instance.closeLeafMenu
            .asObservable()
            .subscribe(closeLeafMenuEvent =>
                this.destroyLeafMenu(closeLeafMenuEvent)))
        subscriptions.add(instance.openSubMenu
            .asObservable()
            .subscribe((subMenuEvent: ContextMenuClickEvent): void => {
                this.destroySubMenus(contextmenuOverlay)
                if (!subMenuEvent.contextMenu) {
                    contextmenuOverlay.updateWasLeaf(true)
                    return
                }
                contextmenuOverlay.updateWasLeaf(false)
                this.show.next(new ContextMenuClickEventBuilder(subMenuEvent)
                    .parent(contextmenuOverlay)
                    .build())
            }))
        contextMenuContent.onDestroy((): void => {
            const m = menuItems as ContextMenuItemDirective[]
            m.forEach(menuItem => {
                menuItem.isActive = false
            })
            subscriptions.unsubscribe()
        })
        /**
         * Angular can not mark other component which is referenced by curr
         * class for change detection, so use `detectChanges` instead of
         * `markForCheck` below.
         */
        contextMenuContent.changeDetectorRef.detectChanges()
    }

    public closeAllContextMenus(closeEvent: CloseContextMenuEvent): void {
        if (this._overlays) {
            this.close.next(closeEvent)
            this._overlays.forEach(overlay => {
                overlay.overlayRef.detach()
                overlay.overlayRef.dispose()
            })
        }
        this._overlays = []
    }

    public getLastAttachedOverlay(): ContextMenuOverlay | undefined {
        let overlay = this._overlays[this._overlays.length - 1]
        while (this._overlays.length > 1 && !overlay.overlayRef.hasAttached()) {
            overlay.overlayRef.detach()
            overlay.overlayRef.dispose()
            this._overlays = this._overlays.slice(0, -1)
            overlay = this._overlays[this._overlays.length - 1]
        }
        return overlay
    }

    public destroyLeafMenu(
        {exceptRootMenu, event}: CloseLeafMenuEvent = {},
    ): void {
        if (this.isDestroyingLeafMenu)
            return
        this.isDestroyingLeafMenu = true

        // tslint:disable-next-line: no-scheduling-timers
        setTimeout((): void => {
            const overlay = this.getLastAttachedOverlay()
            if (this._overlays.length > 1 && overlay !== undefined) {
                overlay.overlayRef.detach()
                overlay.overlayRef.dispose()
            }
            if (!exceptRootMenu && this._overlays.length > 0 && overlay) {
                this.close.next({event, eventType: 'cancel'})
                overlay.overlayRef.detach()
                overlay.overlayRef.dispose()
            }

            const newLeaf = this.getLastAttachedOverlay()
            if (newLeaf)
                newLeaf.updateWasLeaf(true)

            this.isDestroyingLeafMenu = false
        })
    }

    public destroySubMenus(parent: ContextMenuOverlay): void {
        const closedOverlays: ContextMenuOverlay[] = []
        if (this._overlays.length === 0)
            return
        this._overlays.forEach(overlay => {
            let p = overlay.parent
            while (p !== undefined) {
                if (parent !== p) {
                    p = p.parent
                    continue
                }
                overlay.overlayRef.detach()
                overlay.overlayRef.dispose()
                closedOverlays.push(overlay)
                break
            }
        })
        closedOverlays.forEach(overlay => {
            const i = this._overlays.indexOf(overlay)
            if (i === -1)
                return
            this._overlays.splice(i, 1)
        })
    }

    // tslint:disable-next-line: readonly-array
    private _overlays: ContextMenuOverlay[] = []
    private _fakeElement: any = {
        getBoundingClientRect: () => ({
            bottom: 0,
            height: 0,
            left: 0,
            right: 0,
            top: 0,
            width: 0,
        }),
    }
}

export function isPortal(obj: unknown): obj is ComponentPortal<unknown> {
    return obj instanceof ComponentPortal
}

function attachPalette(
    overlay: OverlayRef,
    context: ContextMenuClickEvent,
): ContextMenuOverlay {
    const {item, contextMenu}: ContextMenuClickEvent = context
    // @ts-ignore
    const palette = contextMenu[0]

    const component: ComponentRef<PaletteComponent> = overlay
        .attach(palette.portal)
    const instance = component.instance
    instance.curColor = item.color

    const subscriptions: Subscription = new Subscription()
    subscriptions.add(component.instance.borderColor$
        .subscribe((color: string): void => {
            palette.click(color)
        }))
    component.onDestroy((): void => {
        subscriptions.unsubscribe()
    })
    const contextmenuOverlayBuilder = new ContextMenuOverlayBuilder()
        .overlayRef(overlay)
        .bindingComponent(instance)
    if (context.parent !== undefined)
        contextmenuOverlayBuilder.parent(context.parent)
    return contextmenuOverlayBuilder.build()
}

export function isPalettePortal(contextMenu: any): boolean {
    if (contextMenu !== undefined && isPortal(contextMenu.portal) &&
        contextMenu.portal.component === PaletteComponent)
        return true
    return false
}
