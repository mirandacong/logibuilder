import {Injectable} from '@angular/core'
import {BehaviorSubject, Observable} from 'rxjs'

@Injectable()
/**
 * Top toolbar service.
 */
export class TopMenuService {
    // tslint:disable-next-line: ng-only-method-public-in-service
    public buttonIsOpen$ = new BehaviorSubject<ButtonType>(ButtonType.UNKNOWN)
    public closeAll (): void {
        this.buttonIsOpen$.next(ButtonType.UNKNOWN)
    }

    public updateModel (): void {
    }

    public listenBtnOpen (): Observable<ButtonType> {
        return this.buttonIsOpen$
    }

    public onBtnOpen (type: ButtonType, isOpen: boolean): void {
        this._btnState.set(type, isOpen)
        if (!isOpen)
            return
        this.buttonIsOpen$.next(type)
    }

    public shouldOpen (): boolean {
        let state = false
        this._btnState.forEach((s: boolean): void => {
            if (!s)
                return
            state = s
        })
        return state
    }

    public getButtonState (): Map<ButtonType, boolean> {
        return this._btnState
    }

    private _btnState = new Map<ButtonType, boolean>()
}

// tslint:disable-next-line: const-enum
export enum ButtonType {
    UNKNOWN,
    ATTENTION,
    CONFIG,
    EDIT,
    EXCEL_EDIT,
    DATA,
    FILE,
    EXCEL_FILE,
    HELP,
    EXCEL_HELP,
    FUNCTION,
    FORMAT,
    INSERT,
}
