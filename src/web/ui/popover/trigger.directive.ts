import {
    ConnectedPosition,
    FlexibleConnectedPositionStrategy,
    HorizontalConnectionPos,
    Overlay,
    OverlayConfig,
    OverlayRef,
    VerticalConnectionPos,
} from '@angular/cdk/overlay'
import {TemplatePortal} from '@angular/cdk/portal'
import {
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewContainerRef,
} from '@angular/core'
import {Subscription, timer} from 'rxjs'

import {LogiPopoverPanel} from './popover_panel'

const PANEL_OFFSET = 8

@Directive({
    exportAs: 'logiPopoverTrigger',
    // tslint:disable-next-line: directive-selector
    selector: '[logiPopoverTrigger]',
})
export class LogiPopoverTriggerDirective implements OnInit, OnDestroy {
    public constructor(
        private readonly _el: ElementRef<HTMLElement>,
        private readonly _overlay: Overlay,
        private readonly _viewContainerRef: ViewContainerRef,
    ) {}
    @Input('logiPopoverTrigger') public panel!: LogiPopoverPanel
    // 延时指定时间(单位s)后隐藏弹出框
    @Input('logiPopoverHideDelay') public hideDelay?: number
    @Output() public readonly closed$ = new EventEmitter<void>()
    @Output() public readonly open$ = new EventEmitter<void>()

    get panelOpen(): boolean {
        return this._popoverOpened
    }

    ngOnInit(): void {
        this._subs.add(this.panel.mouseenter$.subscribe(() => {
            this._hideDelaySub?.unsubscribe()
        }))
        this._subs.add(this.panel.mouseleave$.subscribe(() => {
            this.onMouseLeave()
        }))
    }

    public ngOnDestroy(): void {
        this.closePopover()
        this._subs.unsubscribe()
    }

    @HostListener('mouseenter')
    public onMouseEnter(): void {
        this._hideDelaySub?.unsubscribe()
        this.openPopover()
    }

    @HostListener('mouseleave')
    public onMouseLeave(): void {
        if (this.hideDelay) {
            this._hideDelaySub?.unsubscribe()
            this._hideDelaySub = timer(this.hideDelay * 1000).subscribe(() => {
                this.closePopover()
            })
            return
        }
        this.closePopover()
    }

    @HostListener('click')
    public onClick(): void {
        this.closePopover()
    }

    public openPopover(): void {
        if (this._popoverOpened)
            return
        this._createOverlayRef().attach(this._portal)
        this._subscribeCloseEvent()
        this._setPopoverOpened()
    }

    public closePopover(): void {
        if (!this._overlayRef)
            return
        this._overlayRef.detach()
        this._setPopoverClosed()
    }

    private _popoverOpened = false
    private _overlayRef: OverlayRef | null = null
    private _portal: TemplatePortal | null = null
    private _subs = new Subscription()
    private _hideDelaySub?: Subscription

    private _createOverlayRef(): OverlayRef {
        if (this._overlayRef)
            return this._overlayRef
        this._portal = new TemplatePortal(
            this.panel.templateRef,
            this._viewContainerRef,
        )
        const config = this._getOverlayConfig()
        this._overlayRef = this._overlay.create(config)
        return this._overlayRef
    }

    private _getOverlayConfig(): OverlayConfig {
        const config = new OverlayConfig()
        config.positionStrategy = this._getPosition()
        config.scrollStrategy = this._overlay.scrollStrategies.reposition()
        return config
    }

    private _getPosition(): FlexibleConnectedPositionStrategy {
        let fixedPosition: ConnectedPosition | undefined
        if (this.panel.positionX !== undefined) {
            const [originX, overlayX]: HorizontalConnectionPos[] =
                this.panel.positionX === 'after' ? ['end', 'start'] : ['start', 'end']
            const offsetX = this.panel.positionX === 'after' ? PANEL_OFFSET : -PANEL_OFFSET
            fixedPosition = {
                offsetX,
                originX,
                originY: 'center',
                overlayX,
                overlayY: 'center',
            }
        }
        if (this.panel.positionY !== undefined) {
            const [originY, overlayY]: VerticalConnectionPos[] =
                this.panel.positionY === 'below' ? ['bottom', 'top'] : ['top', 'bottom']
            const offsetY = this.panel.positionY === 'below' ? PANEL_OFFSET : -PANEL_OFFSET
            fixedPosition = {
                offsetY,
                originX: 'center',
                originY,
                overlayX: 'center',
                overlayY,
            }
        }
        const defaultPositions: ConnectedPosition[] = [
            {
                offsetY: -PANEL_OFFSET,
                originX: 'center',
                originY: 'top',
                overlayX: 'center',
                overlayY: 'bottom',
            },
            {
                offsetY: PANEL_OFFSET,
                originX: 'center',
                originY: 'bottom',
                overlayX: 'center',
                overlayY: 'top',
            },
        ]

        return this._overlay
            .position()
            .flexibleConnectedTo(this._el)
            .withLockedPosition(true)
            .withPositions(fixedPosition ? [fixedPosition] : defaultPositions)
    }

    private _subscribeCloseEvent(): void {
        if (!this._overlayRef)
            return
        this._subs.add(this._overlayRef.detachments().subscribe(() => {
            this._setPopoverClosed()
        }))
    }

    private _setPopoverOpened(): void {
        if (this._popoverOpened)
            return
        this._popoverOpened = true
        this.open$.next()
    }

    private _setPopoverClosed(): void {
        if (!this._popoverOpened)
            return
        this._popoverOpened = false
        this.closed$.next()
    }
}
