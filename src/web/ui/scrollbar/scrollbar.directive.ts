import {DOCUMENT} from '@angular/common'
import {
    Directive,
    ElementRef,
    Inject,
    NgZone,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core'
import {addClass, removeClass} from '@logi/src/web/base/utils'
import {
    animationFrameScheduler,
    EMPTY,
    fromEvent,
    merge,
    Observable,
    of,
    Subscription,
} from 'rxjs'
import {map, mergeMap, pluck, switchMap, takeUntil, tap} from 'rxjs/operators'

import {LogiScrollbarComponent} from './component'

const THUMB_DRAGGING_CLASS = 'logi-scrollbar-thumb-dragging'

// tslint:disable: unknown-instead-of-any no-null-keyword
@Directive()
export abstract class LogiScrollbarDirective implements OnInit, OnDestroy {
    protected get track(): HTMLElement {
        return this.trackRef.nativeElement
    }

    protected get thumb(): HTMLElement {
        return this.thumbRef.nativeElement
    }

    protected get trackClientRect(): ClientRect {
        return this.track.getBoundingClientRect()
    }

    protected get thumbClientRect(): ClientRect {
        return this.thumb.getBoundingClientRect()
    }

    public abstract get trackOffset(): number

    public abstract get trackSize(): number

    public abstract get thumbSize(): number

    public abstract get viewportScrollMax(): number

    public abstract get viewportScrollSize(): number

    public abstract get viewportScrollOffset(): number

    public get trackMax(): number {
        return this.trackSize - this.thumbSize
    }

    protected abstract get pageProperty(): string

    protected abstract get clientProperty(): string

    protected abstract get dragStartOffset(): number
    public constructor(
        protected readonly ngZone: NgZone,
        protected readonly scrollbarContainer: LogiScrollbarComponent,
        @Inject(DOCUMENT) protected readonly document: Document,
    ) {
        this.viewport = this.scrollbarContainer.viewport
    }

    public ngOnInit(): void {
        this.ngZone.runOutsideAngular(() => {
            /**
             * Listen track click and thumb drag, then trigger ngDoCheck in
             * LogiScrollbarComponent.
             */
            this._subs.add(merge(
                this._thumbDragged(),
                this._trackClicked(),
            ).subscribe())

            this._subs.add(merge(
                this.scrollbarContainer.scrolled$,
                this.scrollbarContainer.updated$,
            ).subscribe(() => {
                this._updateThumb()
            }))
        })
    }

    public ngOnDestroy(): void {
        this._subs.unsubscribe()
    }

    @ViewChild('track', {static: true})
    protected readonly trackRef!: ElementRef<HTMLElement>
    @ViewChild('thumb', {static: true})
    protected readonly thumbRef!: ElementRef<HTMLElement>
    protected viewport: HTMLElement

    protected setDragging(value: boolean): void {
        const element = this.thumb
        value ? addClass(element, THUMB_DRAGGING_CLASS) :
            removeClass(element, THUMB_DRAGGING_CLASS)
    }

    protected abstract scrollTo(position: number): void

    protected abstract updateThumbStyle(position: number, size: number): void

    private _subs = new Subscription()

    private _thumbDragged(): Observable<number> {
        return fromEvent(this.thumb, 'mousedown', {passive: true}).pipe(
            tap(e => e.stopPropagation()),
            switchMap(e => this._thumbMoved(e)),
        )
    }

    private _trackClicked(): Observable<any> {
        const mousedown$ = fromEvent(this.track, 'mousedown', {passive: true})
            .pipe(
                tap(e => e.stopPropagation()),
                tap(() => this.document.onselectstart = () => false),
            )
        const mouseup$ = fromEvent(this.document, 'mouseup', {passive: true})
            .pipe(
                tap(e => e.stopPropagation()),
                tap(() => this.document.onselectstart = null),
                /**
                 * the mouseup event will not output?
                 */
                switchMap(() => EMPTY),
            )
        return merge(mousedown$, mouseup$).pipe(
            pluck<any, number>(this.pageProperty),
            map(pageOffset => {
                const clickOffset = pageOffset - this.trackOffset
                const offset = clickOffset - (this.thumbSize / 2)
                const ratio = offset / this.trackSize
                return ratio * this.viewportScrollSize
            }),
            tap((value: number) => {
                this.scrollTo(value)
            }),
        )
    }

    private _thumbMoved(event: Event): Observable<number> {
        let trackMaxStart: number
        let scrollMaxStart: number
        const dragStart = of(event).pipe(
            // Prevent selection
            tap(() => this.document.onselectstart = () => false),
            tap(() => {
                trackMaxStart = this.trackMax
                scrollMaxStart = this.viewportScrollMax
                this.setDragging(true)
            }),
        )
        const dragMove = fromEvent(
            this.document,
            'mousemove',
            {capture: true, passive: true},
        ).pipe(tap(e => e.stopPropagation()))

        const dragEnd = fromEvent(this.document, 'mouseup', {capture: true})
            .pipe(
                tap(e => e.stopPropagation()),
                // Enable selection
                tap(() => this.document.onselectstart = null),
                tap(() => this.setDragging(false)),
            )
        return dragStart.pipe(
            pluck<any, number>(this.pageProperty),
            map(offset => offset - this.dragStartOffset),
            mergeMap(mousedownOffset => dragMove.pipe(
                pluck<any, number>(this.clientProperty),
                map(mouseOffset => mouseOffset - this.trackOffset),
                map(offset => scrollMaxStart * (offset - mousedownOffset) /
                    trackMaxStart),
                tap((position: number) => this.scrollTo(position)),
                takeUntil(dragEnd),
            )),
        )
    }

    private _updateThumb(): void {
        const size = calculateThumbSize(
            this.trackSize,
            this.viewportScrollSize,
            20,
        )
        const position = calculateThumbPosition(
            this.viewportScrollOffset,
            this.viewportScrollMax,
            this.trackMax,
        )
        animationFrameScheduler.schedule(() => {
            this.updateThumbStyle(position, size)
        })
    }
}

function calculateThumbSize(
    trackSize: number,
    contentSize: number,
    minThumbSize: number,
): number {
    const ratio = trackSize / contentSize
    return Math.max(~~(ratio * trackSize), minThumbSize)
}

function calculateThumbPosition(
    scrollPosition: number,
    scrollMax: number,
    trackMax: number,
): number {
    return scrollPosition * trackMax / scrollMax
}
