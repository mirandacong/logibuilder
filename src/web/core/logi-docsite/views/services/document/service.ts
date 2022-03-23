import {HttpClient, HttpErrorResponse} from '@angular/common/http'
import {Injectable} from '@angular/core'
import {AsyncSubject, Observable, of} from 'rxjs'
import {catchError, switchMap} from 'rxjs/operators'

import {Service as LocationService} from '../location/service'

import {Doc, DocBuilder} from './doc'

@Injectable({
    providedIn: 'root',
})
export class Service {
    public constructor(
        private readonly _http: HttpClient,
        private readonly _location: LocationService,
    ) {}

    public currentDoc$(): Observable<Doc> {
        return this._location
            .currentPath$()
            .pipe(switchMap((path: string): Observable<Doc> =>
                this._getOrInitDocument(path)))
    }

    private _cache = new Map<string, Observable<Doc>>()

    private _getOrInitDocument(id: string): Observable<Doc> {
        let doc = this._cache.get(id)
        if (!doc)
            doc = this._fetchDocument(id)
        this._cache.set(id, doc)
        return doc
    }

    private _fetchDocument(id: string): Observable<Doc> {
        const prefix = this._location.getStaticPrefix()
        const docPath = `${prefix}/${id}.html`
        const subject = new AsyncSubject<Doc>()
        this._http
            .get(docPath, {responseType: 'text'})
            .pipe(catchError((e: HttpErrorResponse): Observable<string> =>
                // tslint:disable-next-line: no-magic-numbers
                e.status === 404 ? getFileNotFoundDoc(id) :
                    getErrorDoc(id)))
            .subscribe((content: string): void => {
                subject.next(
                    new DocBuilder().id(id).content(content).build())
                subject.complete()
            })
        return subject
    }
}

function getFileNotFoundDoc(id: string): Observable<string> {
    return of(`Document file for '${id}' is not found.`)
}

function getErrorDoc(id: string): Observable<string> {
    return of(`Failed to get document file for '${id}', check your net work
    and try again later.`)
}
