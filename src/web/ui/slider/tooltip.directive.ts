import {Overlay, OverlayRef} from '@angular/cdk/overlay'
import {ComponentPortal} from '@angular/cdk/portal'
import {
    ChangeDetectorRef,
    Component,
    Directive,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    ViewContainerRef,
} from '@angular/core'
import {fromEvent, Subscription} from 'rxjs'

// tslint:disable: no-null-keyword
// tslint:disable: codelyzer-template-property-should-be-public
@Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[sliderTooltip]',
})
export class LogiSliderTooltipDirective implements OnInit, OnDestroy {
    public constructor(
        private readonly _viewContainerRef: ViewContainerRef,
        private readonly _overlay: Overlay,
        private readonly _el: ElementRef<HTMLElement>,
    ) {}

    @Input('sliderTooltip') public set message(message: string) {
        this._message = message
        if (!this._message)
            this.hide()
        // tslint:disable-next-line: brace-style
        else {
            this._updateTooltipMessage()
            Promise.resolve().then(() => this._updatePosition())
        }
    }

    public get message(): string {
        return this._message
    }

    public ngOnInit(): void {
        this._listen()
    }

    public ngOnDestroy(): void {
        if (this._overlayRef) {
            this._overlayRef.dispose()
            this._tooltipInstance = null
        }
        this._subs.unsubscribe()
    }

    public hide(): void {
        if (!this._tooltipInstance)
            return
        this._detach()
    }

    private readonly _subs = new Subscription()
    private _message = ''
    private _overlayRef: OverlayRef | null = null
    private _tooltipInstance: LogiSliderTooltipComponent | null = null
    private _portal?: ComponentPortal<LogiSliderTooltipComponent>

    private _listen(): void {
        const element = this._el.nativeElement
        this._subs.add(fromEvent(element, 'mouseenter').subscribe(() => {
            this._show()
        }))
    }

    private _show(): void {
        if (!this.message)
            return
        const overlayRef = this._createOverlay()
        this._detach()
        this._portal = this._portal || new ComponentPortal(
            LogiSliderTooltipComponent,
            this._viewContainerRef,
        )
        this._tooltipInstance = overlayRef.attach(this._portal).instance
        this._updateTooltipMessage()
    }

    private _updateTooltipMessage(): void {
        if (!this._tooltipInstance)
            return
        this._tooltipInstance.message = this.message
        this._tooltipInstance.markForCheck()
    }

    private _updatePosition(): void {
        if (!this._overlayRef)
            return
        this._overlayRef?.updatePosition()
    }

    private _createOverlay(): OverlayRef {
        if (this._overlayRef)
            return this._overlayRef
        const positionStrategy = this._overlay
            .position()
            .flexibleConnectedTo(this._el)
            .withPositions([
                {originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom'},
            ])
        this._overlayRef = this._overlay.create({
            positionStrategy,
        })
        return this._overlayRef
    }

    private _detach(): void {
        if (this._overlayRef && this._overlayRef.hasAttached())
            this._overlayRef.detach()
        this._tooltipInstance = null
    }
}

@Component({
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        class: 'logi-slider-tooltip-wrapper',
    },
    selector: 'logi-slider-tooltip',
    template: `
        <div class='logi-slider-tooltip'>{{message}}</div>
    `,
})
export class LogiSliderTooltipComponent {
    public constructor(private readonly _cd: ChangeDetectorRef) {}
    public message = ''

    // tslint:disable-next-line: codelyzer-template-property-should-be-public
    public markForCheck(): void {
        this._cd.markForCheck()
    }
}
