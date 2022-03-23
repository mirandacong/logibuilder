// tslint:disable: file-name-casing
// tslint:disable: unknown-instead-of-any
import {coerceBooleanProperty} from '@angular/cdk/coercion'

import {Constructor} from './constructor'

export interface CanDisable {
    // tslint:disable-next-line: readonly-keyword
    disabled: boolean
}
export type CanDisableCtor = Constructor<CanDisable>

/**
 * Mixin to augment a directive with a `disabled` property.
 */
export function mixinDisabled<T extends Constructor<{}>>(base: T):
CanDisableCtor & T {
    return class extends base {
        public constructor(...args: any[]) {
            super(...args)
        }
        private _disabled = false

        public get disabled(): boolean {
            return this._disabled
        }

        public set disabled(value: boolean) {
            this._disabled = coerceBooleanProperty(value)
        }

    }
}
