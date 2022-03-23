export function assertIsString(val: unknown): asserts val is string {
    if (typeof val !== 'string')
        // tslint:disable-next-line: no-throw
        throw new Error('Not a string!')
}

// tslint:disable-next-line: readonly-array
export function assertIsStringArray(val: unknown): asserts val is string[] {
    if (!(val instanceof Array))
        // tslint:disable-next-line: no-throw
        throw new Error('Not a array!')
    val.forEach((item: unknown): void => {
        if (typeof item !== 'string')
            // tslint:disable-next-line: no-throw
            throw new Error('Array item not a string!')
    })
}

export function assertIsNumber(val: unknown): asserts val is number {
    if (typeof val !== 'number')
        // tslint:disable-next-line: no-throw
        throw new Error('Not a number!')
}

export function assertIsUint8Array(
    value: unknown,
): asserts value is Uint8Array {
    if (!(value instanceof Uint8Array))
        // tslint:disable-next-line: no-throw
        throw Error('Not a Uint8Array!')
}

export function assertIsDefined<T>(value: unknown): asserts value is T {
    if (value === undefined || value === null)
        // tslint:disable-next-line: no-throw
        throw Error(`Value can not be ${value}`)
}

/**
 * Assert to throw when it is safe to throw error.
 *
 * We can safe to throw error at the below situations:
 *
 * * The imposible value of the switch case.
 *   For example
 *   ```ts
 *    const enum Foo{
 *        A,
 *        B,
 *    }
 *    const a = Foo.A
 *    switch(a){
 *        case Foo.A:
 *            // do somthing.
 *        case Foo.B:
 *            // do somthing.
 *        default:
 *            assertToThrow()
 *    }
 *   ```
 */
export function assertSafeThrow(): void {
    // tslint:disable-next-line: no-throw-unless-asserts
    throw Error('Safe to throw error.')
}

/**
 * Use to assert a type but doing anything.
 */
// tslint:disable-next-line: ter-max-len
// tslint:disable-next-line: no-throw-unless-asserts no-unused unknown-paramenter-for-type-predicate unknown-instead-of-any no-empty
export function assertType<T>(val: any): asserts val is T {
    return val
}
