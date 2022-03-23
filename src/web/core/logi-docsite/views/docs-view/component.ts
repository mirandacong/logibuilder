import {DOCUMENT} from '@angular/common'
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Inject,
    OnDestroy,
    OnInit,
    Renderer2,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core'
import {Doc} from '@logi/src/web/core/logi-docsite/views/services/document/doc'
import {
    Service as DocumentService,
} from '@logi/src/web/core/logi-docsite/views/services/document/service'
import {
    Service as LocationService,
} from '@logi/src/web/core/logi-docsite/views/services/location/service'
import {
    Service as TocService,
} from '@logi/src/web/core/logi-docsite/views/services/toc/service'
import {fromEvent, Subject} from 'rxjs'
import {takeUntil} from 'rxjs/operators'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.ShadowDom,
    selector: 'logi-docs-view',
    styleUrls: [
        './highlight.css',
        './style.scss',
    ],
    templateUrl: './template.html',
})
export class DocsViewComponent implements OnInit, OnDestroy {
    public constructor(

        @Inject(DOCUMENT) private readonly _document: Document,
        private readonly _documentSvc: DocumentService,
        private readonly _locationSvc: LocationService,
        private readonly _render2: Renderer2,
        private readonly _tocSvc: TocService,
    ) {}

    public ngOnInit(): void {
        this._documentSvc
            .currentDoc$()
            .pipe(takeUntil(this._destroy$))
            .subscribe((doc: Doc): void => {
                const headingId = this._locationSvc.currHash()
                this._prepareDoc(doc)
                this._scrollToPosition(headingId)
            })
        /**
         * Listen on click events and prevent browser responsing to clicking on
         * links.
         */
        fromEvent<MouseEvent>(this._docsContainer.nativeElement, 'click')
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

    @ViewChild('docs_container', {static: true})
    private _docsContainer!: ElementRef<HTMLDivElement>
    @ViewChild('docs_view', {static: true})
    private _docsView!: ElementRef<HTMLDivElement>

    private _currentDocId = ''
    private _destroy$ = new Subject()

    // tslint:disable-next-line: max-func-body-length
    private _prepareDoc(doc: Doc): void {
        if (doc.id === this._currentDocId)
            return
        this._currentDocId = doc.id
        const nextViewContainer = this._document.createElement('div')
        // tslint:disable-next-line: no-inner-html
        nextViewContainer.innerHTML = doc.content

        /**
         * Convert relative image urls to absolute path.
         */
        const imgs = nextViewContainer.querySelectorAll('img')
        imgs.forEach((img: HTMLImageElement): void => {
            const src = img.getAttribute('src') || ''
            const prefix = this._locationSvc.getStaticPrefix()
            const rightUrl = new URL(`${prefix}/${doc.id}`,
                this._document.location.origin)
            img.src = new URL(src, rightUrl.href).pathname
        })

        /**
         * Convert relative `.md` urls to absolute `.html` path.
         */
        const links = nextViewContainer.querySelectorAll('a')
        links.forEach((link: HTMLAnchorElement): void => {
            const href = link.getAttribute('href') || ''
            if (!href.endsWith('.md'))
                return
            /**
             * routerPrefix: views/logi-ui/docs
             * doc.id: external/01-start/01-quickstart
             * this._document.location.origin: http://localhost:5432
             * href: ./02-overview.md
             * final href:
             * /views/logi-ui/docs/external/01-start/02-overview
             */
            const routerPath = this._locationSvc.routerPrefix + doc.id
            const path = new URL(routerPath, this._document.location.origin)
            const rightUrl = new URL(href.replace('.md', ''), path.href)
            link.href = rightUrl.pathname
        })

        /**
         * Render new doc and remove the previous one.
         */
        const container = this._docsContainer.nativeElement
        const firstChild = container.firstChild
        container.appendChild(nextViewContainer)
        if (firstChild !== null)
            container.removeChild(firstChild)

        const fullPath = this._locationSvc.routerPrefix + doc.id
        this._tocSvc.genToc(container, fullPath)
        this._tocSvc.spyCurrActiveHeading(this._docsView.nativeElement)
    }

    /**
     * Scroll to the right anchor if needed.
     */
    private _scrollToPosition(headingId: string): void {
        if (headingId === '') {
            /**
             * The url has no id, scroll to top.
             */
            this._render2
                .setAttribute(this._docsView.nativeElement, 'scrollTop', '0')
            return
        }
        const headerElement = this._docsContainer.nativeElement
            .querySelector(headingId)
        if (headerElement === null)
            return
        headerElement.scrollIntoView()
    }
}
