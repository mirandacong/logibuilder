/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
    AbstractControl,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
} from '@angular/forms'
import {isString} from '@logi/base/ts/common/type_guard'

import {LOGI_REG_EMAIL, LOGI_REG_PHNOE} from './reg_expr'

/**
 * Custom angular form validator.
 */

// tslint:disable: no-null-keyword
export const LOGI_EMPTY_ERROR_KEY = 'empty'
export const LOGI_PWD_FORM_CONTROL_NAME = 'logi_pwd'
export const LOGI_PWD_CONFIRM_FORM_CONTROL_NAME = 'logi_pwd_confirm'
export const LOGI_PWD_MISMATCH_ERROR_KEY = 'logi_pwd_mismatch'
export const LOGI_DULPLICATED_KEY = 'logi_dulplicated'

export function getErrorMessage(errorMessage: ValidationErrors): string {
    // tslint:disable-next-line: no-object
    const keys = Object.keys(errorMessage)
    if (keys.length === 0)
        return ''
    const error = errorMessage[keys[0]]
    if (typeof error !== 'string')
        return ''
    return error
}

/**
 * TODO(zengkai): remove this function.
 */
export function emptyValidator(
    control: AbstractControl,
): ValidationErrors | null {
    const value = control.value
    if (value === undefined || value === null ||
        value.trim && value.trim().length === 0)
        return {[LOGI_EMPTY_ERROR_KEY]: true}
    return null
}

export class Validators {
    public static dulplicated(
        strs: readonly string[],
        msg: string,
    ): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value
            if (!isString(value) || value === undefined || value === null)
                return {[LOGI_DULPLICATED_KEY]: msg}
            if (strs.includes(value))
                return {[LOGI_DULPLICATED_KEY]: msg}
            return null
        }
    }

    public static nullValidator(
        // @ts-ignore
        // tslint:disable-next-line: no-unused
        control: AbstractControl,
    ): ValidationErrors | null {
        return null
    }

    public static notEmpty(message: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value
            if (value === undefined || value === null ||
                value.trim && value.trim().length === 0)
                return {[LOGI_EMPTY_ERROR_KEY]: message}
            return null
        }
    }

    public static minLength(minLength: number, message: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (isEmptyInputValue(control.value))
                // don't validate empty values to allow optional controls
                return null
            const length: number = control.value ? control.value.length : 0
            return length < minLength ? {minlength: message} : null
        }
    }

    public static maxLength(maxLength: number, message: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const length: number = control.value ? control.value.length : 0
            return length > maxLength ? {maxlength: message} : null
        }
    }

    public static email(message: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (isEmptyInputValue(control.value))
                return null
            return LOGI_REG_EMAIL.test(control.value) ? null : {email: message}
        }
    }

    public static phone(message: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (isEmptyInputValue(control.value))
                return null
            return LOGI_REG_PHNOE.test(control.value) ? null : {phone: message}
        }
    }

    public static pattern(
        pattern: string | RegExp,
        message: string,
    ): ValidatorFn {
        if (!pattern)
            return Validators.nullValidator
        let regex: RegExp
        let regexStr: string
        if (typeof pattern === 'string') {
            regexStr = ''
            if (pattern.charAt(0) !== '^')
                regexStr += '^'
            regexStr += pattern
            if (pattern.charAt(pattern.length - 1) !== '$')
                regexStr += '$'
            regex = new RegExp(regexStr)
        } else {
            regexStr = pattern.toString()
            regex = pattern
        }
        return (control: AbstractControl): ValidationErrors | null => {
            if (isEmptyInputValue(control.value))
                return null
            const value: string = control.value
            return regex.test(value) ? null : {pattern: message}
        }
    }

    public static passwordMatch(message: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
        /**
         * TODO(zengkai): how to remove this type assertion.
         */
        // tslint:disable-next-line: no-type-assertion
            const group = control as FormGroup
            const pwdControl = group.controls[LOGI_PWD_FORM_CONTROL_NAME]
            const pwdConfirmControl =
            group.controls[LOGI_PWD_CONFIRM_FORM_CONTROL_NAME]
            if (!pwdControl || !pwdConfirmControl)
                return null
            const pwd = pwdControl.value
            const pwdConfirm = pwdConfirmControl.value
            if (pwd === pwdConfirm) {
                /**
                 * Used to clear the mismatch error that set below.
                 * TODO(zengkai): try to remove this.
                 */
                pwdConfirmControl.setErrors(null)
                return null
            }
            /**
             * Also set error of the passworl confirm control to show error
             * message. Note: it will replace all previous errors of control.
             */
            pwdConfirmControl
                .setErrors({[LOGI_PWD_MISMATCH_ERROR_KEY]: message})
            return {[LOGI_PWD_MISMATCH_ERROR_KEY]: message}
        }
    }
}

// tslint:disable-next-line: unknown-instead-of-any
function isEmptyInputValue(value: any): boolean {
    // we don't check for string here so it also works with arrays
    return value == null || value.length === 0
}

export const DUOLICATED_ERROR_KEY = 'duplicated'

/**
 * TODO(minglong): remove this function and add a static function to
 * 'Validators' above.
 */
// tslint:disable: no-null-keyword
export function duplicatedValidator(
    list: readonly string[],
): (value: AbstractControl) => ValidationErrors | null {
    return (ctl: AbstractControl): ValidationErrors | null => {
        const value = ctl.value
        if (!isString(value) || value === '')
            return null
        const target = list.find(name => name === value.trim())
        if (target !== undefined)
            return {duplicated: true}
        return null
    }
}
