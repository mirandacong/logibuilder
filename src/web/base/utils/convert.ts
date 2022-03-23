/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {
    coerceBooleanProperty,
    coerceCssPixelValue,
    _isNumberValue,
} from '@angular/cdk/coercion'

export function toBoolean(value: boolean | string): boolean {
    return coerceBooleanProperty(value)
}

export function toNumber(value: number | string): number

export function toNumber<D>(value: number | string, fallback: D): number | D

export function toNumber(value: number | string, fallbackValue = 0): number {
    return _isNumberValue(value) ? Number(value) : fallbackValue
}

export function toCssPixel(value: number | string): string {
    return coerceCssPixelValue(value)
}
