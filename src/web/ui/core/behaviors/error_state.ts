/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
    FormControl,
    FormGroupDirective,
    NgControl,
    NgForm,
} from '@angular/forms'
import {Subject} from 'rxjs'

import {ErrorStateMatcher} from '../error/error_options'

import {Constructor} from './constructor'

export interface CanUpdateErrorState {
    readonly stateChanges$: Subject<void>
    readonly errorState: boolean
    readonly errorStateMatcher?: ErrorStateMatcher
    updateErrorState(): void
}

export type CanUpdateErrorStateCtor = Constructor<CanUpdateErrorState>

export interface HasErrorState {
    readonly _parentFormGroup: FormGroupDirective
    readonly _parentForm: NgForm
    readonly _defaultErrorStateMatcher: ErrorStateMatcher
    readonly ngControl: NgControl
}

/**
 * Mixin to augment a directive with updateErrorState method.
 * For component with `errorState` and need to update `errorState`.
 */
export function mixinErrorState<T extends Constructor<HasErrorState>>(base: T)
: CanUpdateErrorStateCtor & T {
    return class extends base {
        // tslint:disable-next-line: unknown-instead-of-any
        public constructor(...args: any[]) {
            super(...args)
        }
        public errorState = false

        public readonly stateChanges$ = new Subject<void>()

        public errorStateMatcher?: ErrorStateMatcher

        public updateErrorState(): void {
            const oldState = this.errorState
            const parent = this._parentFormGroup || this._parentForm
            const matcher = this.errorStateMatcher ||
                this._defaultErrorStateMatcher
            const control = this.ngControl ?
                // tslint:disable-next-line: no-type-assertion no-null-keyword
                this.ngControl.control as FormControl : null
            const newState = matcher.isErrorState(control, parent)

            if (newState !== oldState) {
                this.errorState = newState
                this.stateChanges$.next()
            }
        }
    }
}
