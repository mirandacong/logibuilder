import {Injectable, OnDestroy} from '@angular/core'
import {Subject, Observable} from 'rxjs'

import {LogiActiveInputComponent} from './active_input.component'

@Injectable()
export class ActiveInputService implements OnDestroy {
    public ngOnDestroy(): void {
        this._currentActiveInput = null
        this._activeInputChange$.complete()
    }

    public toggleActiveInput(input: LogiActiveInputComponent): void {
        if (this._currentActiveInput === input) {
            this.cancelActiveInput(input)
            return
        }
        this.setActiveInput(input)
    }

    public setActiveInput(input: LogiActiveInputComponent): void {
        if (this._currentActiveInput === input)
            return
        if (this._currentActiveInput)
            this.cancelActiveInput(this._currentActiveInput)
        input.active = true
        this._currentActiveInput = input
        this._activeInputChange$.next(input)
    }

    public cancelActiveInput(input: LogiActiveInputComponent): void {
        if (this._currentActiveInput !== input)
            return
        input.active = false
        input.markForCheck()
        this._currentActiveInput = null
        this._activeInputChange$.next(null)
    }

    public setActiveInputValue(value: string): void {
        if (!this._currentActiveInput)
            return
        this._currentActiveInput.getInput().setValue(value)
        this._currentActiveInput.valueChange$.next(value)
        this.cancelActiveInput(this._currentActiveInput)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public getActiveInputType(): any {
        if (!this._currentActiveInput)
            return
        return this._currentActiveInput.type
    }

    public listenActiveInputChange(
    ): Observable<LogiActiveInputComponent | null> {
        return this._activeInputChange$
    }

    private _currentActiveInput: LogiActiveInputComponent | null = null
    private _activeInputChange$ = new Subject<LogiActiveInputComponent | null>()
}
