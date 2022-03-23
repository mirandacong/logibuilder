import {Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay'
import {ComponentPortal, PortalInjector} from '@angular/cdk/portal'
import {ElementRef, Injectable, InjectionToken, Injector} from '@angular/core'

import {TooltipComponent, TOOLTIP_MESSAGE_TOKEN} from './component'

@Injectable({
    providedIn: 'root',
})
export class TooltipService {
    public constructor(
        private readonly _overlay: Overlay,
        private readonly _injector: Injector,
    ) {}

    public show(targetElement: ElementRef, message = ''): void {
        this._targetElement = targetElement
        this._show(message)
    }

    public hide(): void {
        this._clean()
    }

    private _isActive = false
    private _targetElement?: Readonly<ElementRef>
    private _overlayRef?: OverlayRef

    private _show(message: string): void {
        if (this._isActive)
            return
        this._createOverlay()
        const tokens = new WeakMap<InjectionToken<string>, string>(
            [[TOOLTIP_MESSAGE_TOKEN, message]])
        const injector = new PortalInjector(this._injector, tokens)
        const portal
            = new ComponentPortal(TooltipComponent, undefined, injector)
        if (this._overlayRef === undefined)
            return
        this._overlayRef.attach(portal)
        this._isActive = true
    }

    private _clean(): void {
        if (this._overlayRef === undefined)
            return
        this._overlayRef.detach()
        this._isActive = false
    }

    private _createOverlay(): void {
        if (this._targetElement === undefined)
            return
        const config = new OverlayConfig()
        config.positionStrategy = this._overlay
            .position()
            .flexibleConnectedTo(this._targetElement)
            .withPositions([
                {
                    offsetX: -21,
                    offsetY: 33,
                    originX: 'start',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'bottom',
                },
            ])
        this._overlayRef = this._overlay.create(config)
    }
}
