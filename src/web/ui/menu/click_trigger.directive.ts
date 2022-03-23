import {OverlayConfig, OverlayRef} from '@angular/cdk/overlay'
import {Directive, HostListener, Input} from '@angular/core'

import {LogiMenuComponent} from './component'
import {LogiMenuTriggerBaseDirective} from './trigger_base.directive'

@Directive({
    exportAs: 'logiMenuTrigger',
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        class: 'logi-menu-trigger',
    },
    selector: '[logi-menu-trigger], [logiMenuTrigger]',
})
export class LogiMenuTriggerDirective extends LogiMenuTriggerBaseDirective {
    // tslint:disable-next-line: no-input-rename
    @Input('logiMenuTrigger') public set menu(menu: LogiMenuComponent) {
        this.setMenu(menu)
    }

    @HostListener('click', ['$event'])
    public onClick(event: MouseEvent): void {
        this.openMenu(event)
    }

    protected createOverlay(): OverlayRef {
        if (this._overlayRef)
            return this._overlayRef
        const overlayConfig = this._getOverlayConfig()
        this._overlayRef = this.overlay.create(overlayConfig)
        return this._overlayRef
    }

    private _getOverlayConfig(): OverlayConfig {
        return new OverlayConfig({
            backdropClass: this._menu.backdropClass || 'cdk-overlay-transparent-backdrop',
            panelClass: this._menu.overlayPanelClass,
            positionStrategy: this.overlay
                .position()
                .flexibleConnectedTo(this.el)
                .withLockedPosition()
                .withGrowAfterOpen(),
        })
    }
}
