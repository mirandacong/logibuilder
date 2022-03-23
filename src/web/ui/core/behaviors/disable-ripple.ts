// tslint:disable: file-name-casing
// tslint:disable: unknown-instead-of-any
import {coerceBooleanProperty} from '@angular/cdk/coercion'

import {Constructor} from './constructor'

export interface CanDisableRipple {
    // tslint:disable-next-line: readonly-keyword
    disableRipple: boolean
}

export type CanDisableRippleCtor = Constructor<CanDisableRipple>

/**
 * Mixin to augment a directive with a `disableRipple` property.
 */
export function mixinDisableRipple<T extends Constructor<{}>>(base: T):
CanDisableRippleCtor & T {
    return class extends base {
        public constructor(...args: any[]) {
            super(...args)
        }
        private _disableRipple = false

        public get disableRipple(): boolean {
            return this._disableRipple
        }

        public set disableRipple(value: boolean) {
            this._disableRipple = coerceBooleanProperty(value)
        }

    }
}
