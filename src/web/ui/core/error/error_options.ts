/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core'
import {FormControl, FormGroupDirective, NgForm} from '@angular/forms'

// tslint:disable: prefer-function-over-method
@Injectable()
export class ShowOnDirtyErrorStateMatcher implements ErrorStateMatcher {
    public isErrorState(
        control: FormControl | null,
        form: FormGroupDirective | NgForm | null,
    ): boolean {
        return !!(control && control.invalid && (control.dirty || (form && form.submitted)))
    }
}

@Injectable({providedIn: 'root'})
export class ErrorStateMatcher {
    public isErrorState(
        control: FormControl | null,
        form: FormGroupDirective | NgForm | null,
    ): boolean {
        return !!(control && control.invalid && (control.touched || (form && form.submitted)))
    }
}
