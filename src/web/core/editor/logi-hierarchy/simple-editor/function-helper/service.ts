import {Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay'
import {ComponentPortal, PortalInjector} from '@angular/cdk/portal'
import {
    ComponentRef,
    ElementRef,
    Injectable,
    InjectionToken,
    Injector,
} from '@angular/core'
import {FuncHelperResponse} from '@logi/src/lib/intellisense'

import {FunctionHelperComponent, FUNCTION_MESSAGE_TOKEN} from './component'

@Injectable({
    providedIn: 'root',
})
export class FunctionHelperService {
    public constructor(
        private readonly _overlay: Overlay,
        private readonly _injector: Injector,
    ) {}

    public show(targetElement: ElementRef, message: FuncHelperResponse): void {
        this._targetElement = targetElement
        this._show(message)
    }

    public hide(): void {
        this._clean()
    }

    private _isActive = false
    private _targetElement?: Readonly<ElementRef>
    private _overlayRef?: OverlayRef
    private _componentRef?: ComponentRef<FunctionHelperComponent>

    private _show(message: FuncHelperResponse): void {
        if (this._isActive && this._componentRef) {
            this._componentRef.instance.message = message
            return
        }
        this._createOverlay()
        const tokens =
            new WeakMap<InjectionToken<FuncHelperResponse>, FuncHelperResponse>(
            [[FUNCTION_MESSAGE_TOKEN, message]])
        const injector = new PortalInjector(this._injector, tokens)
        const portal
            = new ComponentPortal(FunctionHelperComponent, undefined, injector)
        if (this._overlayRef === undefined)
            return
        this._componentRef = this._overlayRef.attach(portal)
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
                    originX: 'start',
                    originY: 'top',
                    overlayX: 'start',
                    overlayY: 'bottom',
                },
            ])
        this._overlayRef = this._overlay.create(config)
    }
}
