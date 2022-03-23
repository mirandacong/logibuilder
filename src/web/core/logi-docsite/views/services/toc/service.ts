import {Injectable} from '@angular/core'
import {fromEvent, Observable, ReplaySubject, Subscription} from 'rxjs'

import {TocItem, TocItemBuilder} from './toc_item'

@Injectable({
    providedIn: 'root',
})
export class Service {
    /**
     * A list of all the headings (h1, h2, h3) of the given dom element.
     */
    public tocList$(): Observable<readonly TocItem[]> {
        return this._tocList$
    }

    /**
     * Index of the first heading that is shown on the page (not covered by
     * other dom elements).
     */
    public activeItemIndex$(): Observable<number> {
        return this._activeItemIndex$
    }

    /**
     * Generate table of contents from given dom element.
     */
    public genToc(docDiv: HTMLElement, currPath: string): void {
        this._reset()
        const headings = Array.from(docDiv.querySelectorAll('h1,h2,h3'))
        const tocList = headings.map((heading: Element): TocItem =>
            new TocItemBuilder()
                .href(`${currPath}#${heading.id}`)
                .level(heading.tagName.toLowerCase())
                .title((heading.textContent || '').trim())
                .build())

        this._tocList$.next(tocList)
    }

    /**
     * Listen on scrolling event and detect which heading is on current page.
     */
    public spyCurrActiveHeading(docDiv: HTMLElement): void {
        const headings = Array.from(docDiv.querySelectorAll('h1,h2,h3'))
        const docDivHeight = docDiv.getBoundingClientRect().top
        let distances: number[] = []
        this._scrollSubs = fromEvent(docDiv, 'scroll').subscribe((): void => {
            distances = headings.map((heading: Element): number =>
            (heading as HTMLElement).getBoundingClientRect().top - docDivHeight,
            )
            this._activeItemIndex$.next(
                /**
                 * The first heading that is not covered by the topbar is the
                 * current active heading. The height and position data may not
                 * be accurate, so this line uses `-1` instead of `0`.
                 */
                distances.indexOf(
                    distances.filter((h: number): boolean => h >= -1)[0]))
        })
    }
    private _tocList$ = new ReplaySubject<readonly TocItem[]>(1)
    private _activeItemIndex$ = new ReplaySubject<number>(1)
    private _scrollSubs!: Subscription

    private _reset(): void {
        if (this._scrollSubs !== undefined)
            this._scrollSubs.unsubscribe()
        this._tocList$.next([])
    }
}
