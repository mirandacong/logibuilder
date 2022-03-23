/**
 * See https://github.com/MurhafSousli/ngx-scrollbar
 */

import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion'
import {
    AfterContentInit,
    AfterViewChecked,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core'
import {fromEvent, Observable, Subscription} from 'rxjs'
import {auditTime, debounceTime} from 'rxjs/operators'

interface ResizeObserverOptions {
    // tslint:disable-next-line: readonly-keyword
    box?: 'content-box' | 'border-box'
}

interface ResizeObserverSize {
    readonly inlineSize: number
    readonly blockSize: number
}

type ResizeObserverCallback = (
    entries: ReadonlyArray<ResizeObserverEntry>,
    observer: ResizeObserver,
) => void

interface ResizeObserverEntry {
    readonly target: Element
    readonly contentRect: DOMRectReadOnly
    readonly borderBoxSize?: ReadonlyArray<ResizeObserverSize>
    readonly contentBoxSize?: ReadonlyArray<ResizeObserverSize>
    readonly devicePixelContentBoxSize?: ReadonlyArray<ResizeObserverSize>
}

/**
 * TODO(zengkai): should use resize observer polyfill.
 */
declare class ResizeObserver {
    public constructor(callback: ResizeObserverCallback);
    public disconnect(): void

    public observe(target: Element, options?: ResizeObserverOptions): void

    public unobserve(target: Element): void
}

// tslint:disable: ng-no-get-and-set-property
// tslint:disable: unknown-instead-of-any
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        '[class.logi-scrollbar-disabled]': 'disabled',
        class: 'logi-scrollbar',
    },
    selector: 'logi-scrollbar',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class LogiScrollbarComponent implements OnInit, AfterContentInit,
AfterViewChecked, OnDestroy {
    public constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _el: ElementRef<HTMLElement>,
        private readonly _ngZone: NgZone,
    ) {}

    // tslint:disable-next-line: ext-variable-name variable-name
    public static ngAcceptInputType_disabled: BooleanInput

    @Input() public set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value)
    }

    public get disabled(): boolean {
        return this._disabled
    }

    @Input() public scrollAuditTime = 0
    @Output() public readonly updated$ = new EventEmitter<void>()

    public scrolled$!: Observable<any>

    public verticalScrollable = false
    public horizontalScrollable = false

    public get hostElement(): HTMLElement {
        return this._el.nativeElement
    }

    public get viewport(): HTMLElement {
        return this._viewportRef.nativeElement
    }

    public ngOnInit(): void {
        // this._updateState()
        this._ngZone.runOutsideAngular(() => {
            const scroll$ = fromEvent(this.viewport, 'scroll', {passive: true})
            this.scrolled$ = this.scrollAuditTime ? scroll$.pipe(
                auditTime(this.scrollAuditTime),
            ) : scroll$
        })
    }

    public ngAfterContentInit(): void {
        this._update()
        if (!this._resizeSubscription)
            this._onResize()
    }

    public ngAfterViewChecked(): void {
        this._update()
    }

    public ngOnDestroy(): void {
        this._offResize()
    }

    @ViewChild('viewport', {static: true})
    private readonly _viewportRef!: ElementRef<HTMLElement>
    private _disabled = false
    private _resizeObserver?: ResizeObserver
    private _resizeSubscription?: Subscription

    private _update(): void {
        this._updateState()
        this.updated$.next()
    }

    private _updateState(): void {
        const viewport = this.viewport
        this.verticalScrollable = viewport.scrollHeight > viewport.clientHeight
        this.horizontalScrollable = viewport.scrollWidth > viewport.clientWidth
        /**
         * Note it should use detectChanges() instead of markForCheck() here
         * because it maybe run out of angular zone.
         */
        this._cd.detectChanges()
    }

    private _onResize(): void {
        this._offResize()
        const resize$ = new Observable(sub => {
            this._resizeObserver = new ResizeObserver(e => sub.next(e))
            this._resizeObserver.observe(this.viewport)
        })
        this._ngZone.runOutsideAngular(() => {
            this._resizeSubscription = resize$
                .pipe(debounceTime(100))
                .subscribe(() => {
                    this._update()
                },
            )
        })
    }

    private _offResize(): void {
        this._resizeObserver?.disconnect()
        this._resizeSubscription?.unsubscribe()
    }
}
