import {HttpClient} from '@angular/common/http'
import {Injectable} from '@angular/core'
import {MatIconRegistry} from '@angular/material/icon'
import {DomSanitizer} from '@angular/platform-browser'
import {ICONS, NgIcon} from './common_icons'
import {forkJoin, Observable, Subject, Subscriber} from 'rxjs'

export const enum Icon {
    IC_MATH_DIVI = 'ic_math_divi',
    IC_MATH_MULTI = 'ic_math_multi',
    IC_MATH_ADD = 'ic_math_add',
    IC_MATH_MINUS = 'ic_math_minus',
    IC_ARROW_REMOVE = 'ic_arrow_remove',
    IC_ARROW_ADD = 'ic_arrow_add',
    IC_LOCK = 'ic_lock',
    IC_LOGO = 'ic_login_logo',
    IC_USER = 'ic_user',
}

/**
 * Use in d3 to set html icon.
 *
 * `Icon`: The id of icon.
 * `string`: The html of icon.
 */
export type IconMap = Map<Icon, string>

@Injectable({providedIn: 'root'})
/**
 * Global icon register service.
 * TODO(Minglong): 1.Extract this register icons to app.
 * 2. read icons file as an array.
 */
export class IconService {
    public constructor(
        private readonly _iconRegistry: MatIconRegistry,
        private readonly _httpClient: HttpClient,
        private readonly _sanitizer: DomSanitizer,
    ) {}

    /**
     * For subscribe icons load finish.
     */
    public listenGetIcon(): Observable<void> {
        return this._result$
    }

    /**
     * Register a single icon.
     */
    public registerIcon(url: string, id: string): void {
        const safeUrl = this._sanitizer.bypassSecurityTrustResourceUrl(url)
        this._iconRegistry.addSvgIcon(id, safeUrl)
    }

    public registerAllIcons(staticPath = ''): void {
        ICONS.forEach((icon: NgIcon): void => {
            const url = `${staticPath}/${icon.uri}`
            this.registerIcon(url, icon.id)
        })
    }

    /**
     * 注册所有图标(不带前缀)
     * 此方法仅用于测试和内部app
     */
    public registerAllIconsWithoutPrefix(): void {
        ICONS.forEach((icon: NgIcon): void => {
            this.registerIcon(icon.uri, icon.id)
        })
    }

    /**
     * Get icon html by id.
     */
    public getIconHtmls(
        icons: readonly Icon[],
        staticPath = '',
    ): Observable<IconMap> {
        return new Observable((sub: Subscriber<IconMap>): void => {
            this._getIcons(sub, icons, staticPath)
        })
    }

    private _result$ = new Subject<void>()
    private _getIcons(
        sub: Subscriber<IconMap>,
        icons: readonly Icon[],
        staticPath = '',
    ): void {
        const map: IconMap = new Map()
        const obs: Observable<string>[] = []
        const id: Icon[] = []
        icons.forEach((iconId: Icon): void => {
            ICONS.forEach((icon: NgIcon): void => {
                if (icon.id !== iconId)
                    return
                id.push(icon.id)
                obs.push(this._httpClient
                    .get(`${staticPath}${icon.uri}`, {responseType: 'text'}))
            })
        })
        forkJoin(obs).subscribe((resp: string[]): void => {
            resp.forEach((r: string, index: number): void => {
                map.set(id[index], r)
            })
            sub.next(map)
            sub.complete()
        })
    }
}
