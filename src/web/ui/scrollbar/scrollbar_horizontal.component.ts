import {DOCUMENT} from '@angular/common'
import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    NgZone,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core'

import {LogiScrollbarComponent} from './component'
import {LogiScrollbarDirective} from './scrollbar.directive'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        class: 'logi-scrollbar-horizontal',
    },
    selector: 'logi-scrollbar-horizontal',
    styleUrls: ['./scrollbar_horizontal.style.scss'],
    templateUrl: './scrollbar_horizontal.template.html',
})
export class LogiScrollbarHorizontalComponent extends LogiScrollbarDirective
implements OnInit, OnDestroy {
    public constructor(
        protected readonly ngZone: NgZone,
        protected readonly scrollbarContainer: LogiScrollbarComponent,
        @Inject(DOCUMENT) protected readonly document: Document,
    ) {
        super(ngZone, scrollbarContainer, document)
    }

    public get trackOffset(): number {
        return this.trackClientRect.left
    }

    public get trackSize(): number {
        return this.track.clientWidth
    }

    public get thumbSize(): number {
        return this.thumb.clientWidth
    }

    public get viewportScrollMax(): number {
        return this.viewport.scrollWidth - this.viewport.clientWidth
    }

    public get viewportScrollSize(): number {
        return this.viewport.scrollWidth
    }

    public get viewportScrollOffset(): number {
        return this.viewport.scrollLeft
    }

    public get pageProperty(): string {
        return 'pageX'
    }

    public get clientProperty(): string {
        return 'clientX'
    }

    public get dragStartOffset(): number {
        // tslint:disable-next-line: no-non-null-assertion naming-convention
        const pageXOffset = this.document.defaultView!.pageXOffset || 0
        return this.thumbClientRect.left + pageXOffset
    }

    public updateThumbStyle(position: number, size: number): void {
        this.thumb.style.width = `${size}px`
        this.thumb.style.transform = `translateX(${position}px)`
    }

    public scrollTo(position: number): void {
        this.viewport.scrollLeft = position
    }
}
