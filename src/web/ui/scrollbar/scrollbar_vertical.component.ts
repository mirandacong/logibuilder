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

// tslint:disable: prefer-function-over-method
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        class: 'logi-scrollbar-vertical',
    },
    selector: 'logi-scrollbar-vertical',
    styleUrls: ['./scrollbar_vertical.style.scss'],
    templateUrl: './scrollbar_vertical.template.html',
})
export class LogiScrollbarVerticalComponent extends LogiScrollbarDirective
implements OnInit, OnDestroy {
    public constructor(
        protected readonly ngZone: NgZone,
        protected readonly scrollbarContainer: LogiScrollbarComponent,
        @Inject(DOCUMENT) protected readonly document: Document,
    ) {
        super(ngZone, scrollbarContainer, document)
    }

    public get trackOffset(): number {
        return this.trackClientRect.top
    }

    public get trackSize(): number {
        return this.track.clientHeight
    }

    public get thumbSize(): number {
        return this.thumb.clientHeight
    }

    public get viewportScrollMax(): number {
        return this.viewport.scrollHeight - this.viewport.clientHeight
    }

    public get viewportScrollSize(): number {
        return this.viewport.scrollHeight
    }

    public get viewportScrollOffset(): number {
        return this.viewport.scrollTop
    }

    public get pageProperty(): string {
        return 'pageY'
    }

    public get clientProperty(): string {
        return 'clientY'
    }

    public get dragStartOffset(): number {
        // tslint:disable-next-line: no-non-null-assertion naming-convention
        const pageYOffset = this.document.defaultView!.pageYOffset || 0
        return this.thumbClientRect.top + pageYOffset
    }

    public updateThumbStyle(position: number, size: number): void {
        this.thumb.style.height = `${size}px`
        this.thumb.style.transform = `translateY(${position}px)`
    }

    public scrollTo(position: number): void {
        this.viewport.scrollTop = position
    }
}
