import {
    FlexibleConnectedPositionStrategyOrigin,
    OverlayConfig,
    OverlayRef,
} from '@angular/cdk/overlay'
import {Directive, HostListener, Input} from '@angular/core'

import {LogiMenuComponent} from './component'
import {LogiMenuTriggerBaseDirective} from './trigger_base.directive'

@Directive({
    exportAs: 'logiContextMenuTrigger',
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        class: 'logi-context-menu-trigger',
    },
    selector: '[logi-context-menu-trigger], [logiContextMenuTrigger]',
})
export class LogiContextmenuTriggerDirective extends
LogiMenuTriggerBaseDirective {
    // tslint:disable-next-line: no-input-rename
    @Input('logiContextMenuTrigger') public set menu(menu: LogiMenuComponent) {
        this.setMenu(menu)
    }

    @HostListener('contextmenu', ['$event'])
    public onContextmenu(event: MouseEvent): void {
        this.openMenu(event)
    }

    protected createOverlay(e: MouseEvent): OverlayRef {
        const origin = {x: e.clientX, y: e.clientY}
        if (this._overlayRef) {
            this._overlayRef.dispose()
            const config = this._getOverlayConfig(origin)
            this._overlayRef = this.overlay.create(config)
            return this._overlayRef
        }
        const overlayConfig = this._getOverlayConfig(origin)
        this._overlayRef = this.overlay.create(overlayConfig)
        return this._overlayRef
    }

    private _getOverlayConfig(
        origin: FlexibleConnectedPositionStrategyOrigin,
    ): OverlayConfig {
        return new OverlayConfig({
            backdropClass: this._menu.backdropClass || 'cdk-overlay-transparent-backdrop',
            panelClass: this._menu.overlayPanelClass,
            positionStrategy: this.overlay
                .position()
                .flexibleConnectedTo(origin)
                .withPositions([
                    {
                        // tslint:disable: limit-indent-for-method-in-class
                        originX: 'start', originY: 'bottom',
                        overlayX: 'start', overlayY: 'top',
                    },
                    {
                        originX: 'end', originY: 'bottom',
                        overlayX: 'end', overlayY: 'top',
                    },
                    {
                        originX: 'start', originY: 'top',
                        overlayX: 'start', overlayY: 'bottom',
                    },
                    {
                        originX: 'end', originY: 'top',
                        overlayX: 'end', overlayY: 'bottom',
                    },
                ]),
        })
    }
}
