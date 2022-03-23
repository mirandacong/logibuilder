import {Injectable} from '@angular/core'
// tslint:disable-next-line: no-import-side-effect
import 'mousetrap'

/**
 * Element with this class will continue the event callback.
 * If you want a element to respond to mousetrap key event, add this class for
 * it (or its parent element).
 */
export const MOUSETRAP_CLASS = 'mousetrap'

@Injectable({providedIn: 'root'})
export class Service {
    public constructor() {
        /**
         * Listen keyboardEvent on `document` if no parameter for `Mousetrap`
         * constructor.
         */
        this._mousetrap = new Mousetrap()
    }

    /**
     * Register hotkeys.
     */
    public add(
        // tslint:disable-next-line: readonly-array
        hotkey: string | string[],
        callback: (e: KeyboardEvent) => void,
    ): void {
        this._mousetrap.bind(hotkey, callback)
    }

    public removeAll(): void {
        this._mousetrap.reset()
    }

    private _mousetrap!: MousetrapInstance
}
