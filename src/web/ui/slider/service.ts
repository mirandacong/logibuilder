import {Injectable, OnDestroy} from '@angular/core'
import {Observable, Subject} from 'rxjs'

@Injectable()
export class LogiSliderService implements OnDestroy {
    public ngOnDestroy(): void {
        this._drag$.complete()
    }

    public startDragging(): void {
        this._isDragging = true
        this._drag$.next(true)
    }

    public stopDragging(): void {
        this._isDragging = false
        this._drag$.next(false)
    }

    public listenDragEvent(): Observable<boolean> {
        return this._drag$
    }

    public isDragging(): boolean {
        return this._isDragging
    }

    private _isDragging = false
    /**
     * true is start drag.
     * false is stop drag.
     */
    private _drag$ = new Subject<boolean>()
}
