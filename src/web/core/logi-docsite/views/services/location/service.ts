import {PlatformLocation} from '@angular/common'
import {Injectable} from '@angular/core'
import {Event, NavigationEnd, Router} from '@angular/router'
import {BehaviorSubject, Observable} from 'rxjs'
import {filter, map, take} from 'rxjs/operators'

/**
 * (TODO:minglong) The router events subscribe will exist in the whole
 * lifecycle of app, but it should only exist in the lifecycle of docsite.
 *
 * Find a suitable way to solve this problem:
 * 1. Use providers in docsite module, and remove the provideIn root.
 * 2. Refactor this service as a truthy root service.
 * 3. Others.
 */
@Injectable({
    providedIn: 'root',
})
export class Service {
    public constructor(
        private readonly _router: Router,
        private readonly _platformLocation: PlatformLocation,
    ) {
        this._router.events
            .pipe(filter((e: Event): boolean => e instanceof NavigationEnd))
            .subscribe((e: Event): void => {
                const url = this._convertUrl((e as NavigationEnd).url)
                this._urlSubject$.next(url)
            })
    }
    public routerPrefix = ''

    public setStaticPrefix(prefix: string): void {
        this._staticPrefix = prefix
    }

    public getStaticPrefix(): string {
        return this._staticPrefix
    }

    public clearUrl(): void {
        const url = this._urlSubject$.getValue()
        this._router.navigateByUrl(this._router.url.replace(url, ''))
    }

    public currentPath$(): Observable<string> {
        return this._urlSubject$.pipe(
            /**
             * strip query and hash.
             * transfer `01-quickstart#create-a-model` to `01-quickstart`.
             */
            map((url: string): string => (url.match(/[^?#]*/) || [])[0]),
        )
    }

    /**
     * Return the hash fragment from the `PlatformLocation`.
     * For example:
     * If the url is `01-quickstart#create-a-model`, return `create-a-model`.
     */
    public currHash(): string {
        return decodeURIComponent(this._platformLocation.hash)
    }

    public go(url: string): void {
        if (/^http/.test(url))
            window.location.assign(url)
        else
            this._router.navigateByUrl(url)
    }

    public prevOrNext(type: PrevOrNext): void {
        this.currentPath$().pipe(take(1)).subscribe((path: string): void => {
            let actualPath = path
            if (actualPath.startsWith('/'))
                actualPath = path.replace(/^\//, '')
            const currIndex = this._routerList.indexOf(actualPath)
            let shortPath = this._routerList[currIndex - 1]
            if (type === 'next')
                shortPath = this._routerList[currIndex + 1]
            if (shortPath === undefined)
                return
            this.go(this.routerPrefix.concat(shortPath))
        })
    }

    public setRouterList(list: readonly string[]): void {
        this._routerList = list
        this._setRouterRoot()
        /**
         * First load docsite can not get router root, so the url should be
         * emitted again. But it is only once, so unsubscribe immediately.
         */
        this._urlSubject$
            .pipe(take(1))
            .subscribe((url: string): void => {
                const actualUrl = this._convertUrl(url)
                this._urlSubject$.next(actualUrl)
            })
            .unsubscribe()
    }
    private _staticPrefix = ''
    private _routerList: readonly string[] = []

    /**
     * There are three scenes will change url.
     *   - First load docsite.
     *   - After selecting a item in navigation.
     *   - After selecting a item in toc-view.
     */
    private _urlSubject$ = new BehaviorSubject<string>('')
    /**
     * For example:
     * If this._router.url is
     *     `views/logi-ui/docs/external/01-start/01-quickstart#create-a-model`.
     * It can separate in three part:
     *   - expected router root:`views/logi-ui/docs/`
     *   - current url loaded from docs folder:`external/01-start/01-quickstart`
     *   - href id:`#create-a-model`.
     * The purpose is set the expected router root `views/logi-ui/docs/`.
     */
    private _setRouterRoot(): void {
        /**
         * Strip query and hash.
         * The result of it is
         * `views/logi-ui/docs/external/01-start/01-quickstart`.
         */
        this.routerPrefix = (this._router.url.match(/[^?#]*/) || [])[0]
        this._routerList.forEach((url: string): void => {
            if (!this.routerPrefix.endsWith(url))
                return
            this.routerPrefix = this.routerPrefix.replace(url, '')
        })
        if (this.routerPrefix.endsWith('/'))
            return
        this.routerPrefix += '/'
    }

    /**
     * For example:
     * If url is
     *     `views/logi-ui/docs/external/01-start/01-quickstart#create-a-model`.
     * It can separate in three part:
     *   - expected router root:`views/logi-ui/docs/`
     *   - current url loaded from docs folder:`external/01-start/01-quickstart`
     *   - href id:`#create-a-model`.
     * The purpose is get the current url `external/01-start/01-quickstart`.
     */
    private _convertUrl(url: string): string {
        const needChange = this._routerList.some((router: string): boolean =>
            url.includes(router))
        if (!needChange)
            return url
        return url.replace(this.routerPrefix, '')
    }
}

type PrevOrNext = 'prev' | 'next'
