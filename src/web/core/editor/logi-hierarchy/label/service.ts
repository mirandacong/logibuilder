import {Injectable} from '@angular/core'
import {BehaviorSubject, Observable} from 'rxjs'

@Injectable()
/**
 * Top toolbar service.
 */
export class LabelService {
    public changeLabel(): void {
        this._showLabel = !this._showLabel
        this._showLabel$.next(this._showLabel)
    }

    public listenLabel(): Observable<boolean> {
        return this._showLabel$
    }

    private _showLabel = false

    private _showLabel$ = new BehaviorSubject<boolean>(this._showLabel)
}
