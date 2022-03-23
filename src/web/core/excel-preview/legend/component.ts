import {Overlay, OverlayConfig} from '@angular/cdk/overlay'
import {CdkPortal, Portal} from '@angular/cdk/portal'
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    Renderer2,
    ViewChild,
} from '@angular/core'
import {trackByFnReturnItem} from '@logi/src/web/base/track-by'

import {backgroundList, contentList} from './legend'

const OFFSETY = -200

const OFFSETX = -395

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-legend',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class LegendComponent {
    public constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _overlay: Overlay,
        private readonly _render: Renderer2,
    ) {}
    @Input() public dragBoundary?: ElementRef<HTMLElement> | HTMLElement

    public backgroundList = backgroundList()

    public contenList = contentList()
    public trackBy = trackByFnReturnItem
    /**
     * When the background content contains wps,
     * dragging an element will cause pointer-events to be intercepted by wps,
     * so that the current dragged element cannot be dragged,
     * so the boundary's pointer-events
     * should be set to none at the beginning of the drag
     * and set to unset at the end of drag
     */
    public dragStart(): void {
        if (this.dragBoundary !== undefined)
            this._render.setStyle(this.dragBoundary, 'pointer-events', 'none')
    }

    public dragEnd(): void {
        if (this.dragBoundary !== undefined)
            this._render.setStyle(this.dragBoundary, 'pointer-events', 'unset')
    }

    public clickLegend(): void {
        if (this._portals.isAttached) {
            this._portals.detach()
            return
        }
        const config = new OverlayConfig({
            backdropClass: 'cdk-overlay-transparent-backdrop',
            hasBackdrop: true,
            panelClass: 'logi-excel-preview-legend',
            positionStrategy: this._overlay
                .position()
                .global()
                .centerHorizontally()
                .top(`${this._legendBtn.nativeElement
                    .getBoundingClientRect().top + OFFSETY}px`)
                .left(`${this._legendBtn.nativeElement
                    .getBoundingClientRect().right + OFFSETX}px`),
        })

        const overlayRef = this._overlay.create(config)
        this._portals.attach(overlayRef)
        overlayRef.backdropClick().subscribe(() => {
            overlayRef.detach()
            this._cd.markForCheck()
        })
    }

    public isAttach(): boolean {
        return this._portals?.isAttached
    }

    @ViewChild(CdkPortal) private _portals!: Portal<unknown>
    @ViewChild('legend_btn') private _legendBtn!: ElementRef<HTMLElement>
}
