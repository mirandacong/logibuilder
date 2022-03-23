import {
    FlexibleConnectedPositionStrategy,
    Overlay,
    OverlayConfig,
    OverlayRef,
} from '@angular/cdk/overlay'
import {ComponentPortal, PortalInjector} from '@angular/cdk/portal'
import {ViewportRuler} from '@angular/cdk/scrolling'
import {DOCUMENT} from '@angular/common'
import {
    ComponentRef,
    EventEmitter,
    Inject,
    Injectable,
    InjectionToken,
    Injector,
    OnDestroy,
} from '@angular/core'
import {ClickPanelEvent} from '@logi/src/lib/intellisense'
import {fromEvent, Subscription} from 'rxjs'
import {filter} from 'rxjs/operators'

import {SuggestionComponent, SUGGESTION_PANEL_DATA} from './component'
import {PanelData} from './panel_data'

/**
 * The width of suggestion panel, it should equal to css style `width`.
 */
const PANEL_WIDTH = 400

@Injectable({providedIn: 'root'})
export class SuggestionPanelService implements OnDestroy {
    public constructor(
        private readonly _overlay: Overlay,
        private readonly _injector: Injector,

        @Inject(DOCUMENT)
        /**
         * Using `Document` type for `_document` will get an error in angular 5
         * See: https://github.com/angular/angular/issues/20351#issuecomment-446025223.
         *
         * Now in angular 9, replacing `any` with `Document` will not get error.
         * TODO (kai): Confirm that no error would be thrown in angular 9.
         */
        // tslint:disable-next-line: unknown-instead-of-any
        private readonly _document: any,
        private readonly _viewportRuler: ViewportRuler,
    ) {}

    public ngOnDestroy(): void {
        this._closingActionsSubs?.unsubscribe()
        this._viewportSubscription.unsubscribe()
        this._destroyPanel()
    }

    public openPanel(targetElement: HTMLElement, panelData: PanelData): void {
        this._targetElement = targetElement
        this._attachOverlay(panelData)
    }

    public updatePanel(panelData: PanelData): void {
        if (!this._overlayAttached || !this._componentRef)
            return
        this._componentRef.instance.updatePanelData(panelData)
    }

    public isPanelOpen(): boolean {
        return this._overlayAttached
    }

    public closePanel(): void {
        this._overlayRef?.detach()
        this._closingActionsSubs?.unsubscribe()
        this._overlayAttached = false
    }

    public panelClick(): EventEmitter<ClickPanelEvent> | undefined {
        if (this._componentRef === undefined)
            return
        return this._componentRef.instance.selectItem$
    }

    private _overlayAttached = false
    private _targetElement!: HTMLElement
    private _overlayRef?: OverlayRef | null
    private _componentRef?: ComponentRef<SuggestionComponent>
    private _closingActionsSubs?: Subscription
    private _viewportSubscription = Subscription.EMPTY
    private _positionStrategy?: FlexibleConnectedPositionStrategy

    private _attachOverlay(data: PanelData): void {
        if (!this._overlayRef) {
            this._overlayRef = this._createOverlayRef()
            this._viewportSubscription = this._viewportRuler.change().subscribe(
                (): void => this._overlayRef?.updateSize({width: PANEL_WIDTH}),
            )
        } else {
            /**
             * The origin (contenteditable div) may be destroyed when update
             * expression, so we need set the new origin.
             */
            this._positionStrategy?.setOrigin(this._targetElement)
            this._overlayRef.updateSize({width: PANEL_WIDTH})
        }

        if (this._overlayRef && !this._overlayRef.hasAttached()) {
            const tokens = new WeakMap<InjectionToken<string>, PanelData>([
                [SUGGESTION_PANEL_DATA, data],
            ])
            const injector = new PortalInjector(this._injector, tokens)
            const portal
                = new ComponentPortal(SuggestionComponent, undefined, injector)
            this._componentRef = this._overlayRef.attach(portal)
            this._componentRef.changeDetectorRef.detectChanges()
            this._closingActionsSubs = this._subscribeCloseActions()
        }
        this._overlayAttached = true
    }

    private _createOverlayRef(): OverlayRef {
        const config = new OverlayConfig()
        this._positionStrategy = config.positionStrategy = this._overlay
            .position()
            .flexibleConnectedTo(this._targetElement)
            .withFlexibleDimensions(false)
            .withPush(false)
            .withPositions([
                {
                    originX: 'start',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'top',
                },
                {
                    originX: 'start',
                    originY: 'top',
                    overlayX: 'start',
                    overlayY: 'bottom',
                },
            ])
        /**
         * Set scroll strategy to update overlay view when scrolling.
         * Reference from material autocomplete.
         * TODO (kai): Need to be optimized.
         */
        config.scrollStrategy = this._overlay.scrollStrategies.reposition()
        return this._overlay.create(config)
    }

    private _destroyPanel(): void {
        if (this._overlayRef) {
            this.closePanel()
            this._overlayRef.dispose()
            // tslint:disable-next-line: no-null-keyword
            this._overlayRef = null
        }
    }

    /**
     * Listen all click event from document and hide panel if event target is
     * not current connected element and not included in overlay element.
     */
    private _subscribeCloseActions(): Subscription {
        return fromEvent<MouseEvent>(this._document, 'click')
            .pipe(filter((e: MouseEvent): boolean => {
                // tslint:disable-next-line: no-type-assertion
                const target = e.target as HTMLElement
                return this._overlayAttached &&
                        // tslint:disable: limit-indent-for-method-in-class
                        target !== this._targetElement &&
                        // tslint:disable-next-line: no-double-negation
                        (!!this._overlayRef &&
                            !this._overlayRef.overlayElement.contains(target))
            }),
            )
            .subscribe((): void => this.closePanel())
    }
}
