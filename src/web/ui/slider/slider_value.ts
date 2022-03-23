import {isArrayEqual} from '@logi/src/web/base/utils'

import {SliderHandler, SliderValue} from './typing'

export function isValueEqual(valA: SliderValue, valB: SliderValue): boolean {
    if (typeof valA !== typeof valB)
        return false
    return isRangeValue(valA) && isRangeValue(valB) ?
        isArrayEqual<number>(valA, valB) : valA === valB
}

// tslint:disable-next-line: readonly-array
export function isRangeValue(value: unknown): value is number[] {
    if (value instanceof Array)
        // tslint:disable-next-line: no-magic-numbers
        return value.length === 2
    return false
}

export function getLogicalValue(
    value: number,
    max: number,
    reverse: boolean,
): number {
    return reverse ? max - value : value
}

export function getClosestIndexofRange(
    value: number,
    range: readonly number[],
): number {
    let minimal = Number.MAX_VALUE
    let gap: number
    let closestIndex = -1
    range.forEach((val, index) => {
        gap = Math.abs(value - val)
        if (gap < minimal) {
            minimal = gap
            closestIndex = index
        }
    })
    return closestIndex
}

export function getPrecision(num: number): number {
    const numStr = num.toString()
    const dotIndex = numStr.indexOf('.')
    return dotIndex >= 0 ? numStr.length - dotIndex - 1 : 0
}

export function generateHandlers(amount: number): readonly SliderHandler[] {
    return Array(amount).fill(0).map(() => {
        const handle: SliderHandler = {offset: null, value: null, active: false}
        return handle
    })
}

/**
 * Check if value is valid and throw error if value-type/range not match.
 */
export function assertValueValid(
    value: SliderValue,
    isRange?: boolean,
): boolean {
    if ((!isRangeValue(value) && isNaN(value)) || (isRangeValue(value) && value
        .some(v => isNaN(v))))
        return false
    return assertValueTypeMatch(value, isRange)
}

/**
 * Assert that if `this.nzRange` is `true`, value is also a range, vice versa.
 */
export function assertValueTypeMatch(
    value: SliderValue,
    isRange = false,
): boolean {
    if (isRangeValue(value) !== isRange)
        // tslint:disable-next-line: no-throw-unless-asserts
        throw new Error(`The "range" can't match the "ngModel"'s type.`)
    return true
}

export function ensureNumberInRange(
    num: number,
    min: number,
    max: number,
): number {
    if (isNaN(num) || num < min)
        return min
    if (num > max)
        return max
    return num
}

export function getPercent(min: number, max: number, value: number): number {
    return ((value - min) / (max - min)) * 100
}
