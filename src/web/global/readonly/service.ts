import {Injectable} from '@angular/core'
import {BehaviorSubject} from 'rxjs'

@Injectable({providedIn: 'root'})
export class ReadonlyService {
    public getReadonly(): BehaviorSubject<boolean> {
        return this._readonly$
    }

    public setReadonly(isReadonly: boolean): void {
        this._readonly$.next(isReadonly)
    }

    private _readonly$ = new BehaviorSubject<boolean>(false)
}
