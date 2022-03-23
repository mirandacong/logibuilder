// tslint:disable: no-object ban-types
import {Injectable} from '@angular/core'
import {Book} from '@logi/src/lib/hierarchy/core'
import {StudioApiService} from '@logi/src/web/global/api/service'
import {BehaviorSubject, Observable, Subject} from 'rxjs'

@Injectable()
/**
 * Common excel service.
 */
export class ExcelService {
    public constructor(private readonly _studioApiSvc: StudioApiService) {}

    /**
     * Refresh excel.
     */
    public refresh(): void {
        this._refresh$.next()
    }

    /**
     * Use to listen refresh excel.
     */
    public onRefresh$(): Observable<void> {
        return this._refresh$
    }

    /**
     * Tell excel to render.
     */
    public render(): void {
        const book = this._studioApiSvc.currBook()
        this._render$.next(book)
    }

    /**
     * Listen excel render.
     */
    public onRender$(): Observable<Readonly<Readonly<Book> | undefined>> {
        return this._render$
    }

    private _refresh$ = new BehaviorSubject<void>(undefined)
    private _render$ = new Subject<Readonly<Book> | undefined>()
}
