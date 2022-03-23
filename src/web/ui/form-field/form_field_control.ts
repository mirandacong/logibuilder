/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core'
import {NgControl} from '@angular/forms'
import {Observable} from 'rxjs'

// tslint:disable: no-null-keyword directive-class-suffix
@Directive()
export abstract class LogiFormFieldControl {
    public abstract stateChanges$: Observable<void>
    public readonly ngControl?: NgControl | null
    public readonly focused: boolean = false
    public readonly disabled: boolean = false
    public readonly errorState: boolean = false
    public readonly shouldLabelFloat: boolean = false
    public abstract onContainerClick(event: MouseEvent): void
}
