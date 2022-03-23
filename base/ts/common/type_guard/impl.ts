/**
 * https://www.techiedelight.com/check-if-variable-is-string-javascript/
 * https://stackoverflow.com/a/9436948
 */
export function isString(obj: unknown): obj is string {
    /**
     * ```
     * const s = new String('hello')
     * typeof s              // 'object'
     * s instanceof String   // true
     * ```
     *
     * We can also use:
     *     Object.prototype.toString.call(obj) === '[object String]'
     */
    return typeof obj === 'string' || obj instanceof String
}

export function isBoolean(obj: unknown): obj is boolean {
    // tslint:disable-next-line: no-unnecessary-boolean-condition
    return (obj === true || obj === false)
}

/**
 * Check if `object` is an Uint8Array.
 */
export function isUint8Array(obj: unknown): obj is Uint8Array {
    return obj instanceof Uint8Array
}

export function isUndefinedOrNull(obj: unknown): obj is undefined | null {
    return obj === undefined || obj === null
}
