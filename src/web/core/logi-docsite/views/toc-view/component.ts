import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
} from '@angular/core'
import {
    Service as LocationService,
} from '@logi/src/web/core/logi-docsite/views/services/location/service'
import {
    Service as TocService,
} from '@logi/src/web/core/logi-docsite/views/services/toc/service'
import {
    TocItem,
} from '@logi/src/web/core/logi-docsite/views/services/toc/toc_item'
import {fromEvent, Subject} from 'rxjs'
import {takeUntil} from 'rxjs/operators'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-toc-view',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class TocComponent implements OnInit, OnDestroy {
    public constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _el: ElementRef,
        private readonly _locationSvc: LocationService,
        private readonly _tocSvc: TocService,
    ) {}

    /**
     * The default active heading is the first heading.
     */
    public activeIndex = 0
    public tocList!: readonly TocItem[]

    public ngOnInit(): void {
        this._tocSvc
            .tocList$()
            .pipe(takeUntil(this._destroy$))
            .subscribe((tocList: readonly TocItem[]): void => {
                this.tocList = tocList
                this._cd.markForCheck()
            })
        this._tocSvc
            .activeItemIndex$()
            .pipe(takeUntil(this._destroy$))
            .subscribe((index: number): void => {
                this.activeIndex = index
                this._cd.markForCheck()
            })
        /**
         * Listen on click events and prevent browser responsing to clicking on
         * links.
         */
        fromEvent<MouseEvent>(this._el.nativeElement, 'click')
            .pipe(takeUntil(this._destroy$))
            .subscribe((event: MouseEvent): void => {
                const target = event.target
                if (target === null)
                    return
                const ele = target as HTMLElement
                if (ele.tagName === 'A') {
                    event.preventDefault()
                    const url = ele.getAttribute('href') as string
                    this._locationSvc.go(url)
                }
            })
    }

    public ngOnDestroy(): void {
        this._destroy$.next()
        this._destroy$.complete()
    }

    private _destroy$ = new Subject()
}
