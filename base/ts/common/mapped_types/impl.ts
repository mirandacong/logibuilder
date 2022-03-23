/**
 * Make all fields of T mandatory.
 *
 * This is the opposite of Partial<T>.
 *
 * For example
 * ```ts
 * interface T {
 *     readonly foo: string[]
 *     bar?: readonly string[]
 * }
 * type Required<T> = {
 *     readonly foo: string[]
 *     bar: readonly string[]
 * }
 * ```
 */
export type Required<T> = {
    [K in keyof T]-?: T[K]
}

/**
 * Make all fields of T writable.
 *
 * This is the opposite of Readonly<T>.
 *
 * For example
 * ```ts
 * interface T {
 *     readonly foo: string[]
 *     bar?: readonly string[]
 * }
 * type Writable<T> = {
 *     foo: string[]
 *     bar?: readonly string[]
 * }
 * ```
 */
export type Writable<T> = {
    -readonly[K in keyof T]: T[K]
}

/**
 * Make all fields of T immutable.
 *
 * This is the opposite of Mutable<T>.
 *
 * For example
 * ```ts
 * interface T {
 *     readonly foo: string[]
 *     bar?: readonly string[]
 * }
 * type Immutable<T> = {
 *     readonly foo: readonly string[]
 *     bar?: readonly string[]
 * }
 * ```
 */
export type Immutable<T> = {
    [K in keyof T]: Readonly<T[K]>
}

/**
 * Make all fields of T mutable.
 *
 * Recursively strip 'readonly' from all properties of T.
 *
 * This is the opposite of Immutable<T>.
 *
 * For example
 * ```ts
 * interface T {
 *     readonly foo: string[]
 *     bar?: readonly string[]
 * }
 * type Mutable<T> = {
 *     readonly foo: string[]
 *     bar?: string[]
 * }
 * ```
 */
export type Mutable<T> = {
    [K in keyof T]: Writable<T[K]>
}

/**
 * Convert a type T to a type suitable for use as the implementation class in
 * its builder class.
 *
 * All properties of T are made optional and 'readonly' modifiers are stripped.
 *
 * This is usually used in conjunction with Interface<T>.
 *
 * For example
 * ```ts
 * interface T {
 *     readonly foo: string[]
 *     bar?: readonly string[]
 * }
 * type Impl<T> = {
 *     foo?: string[]
 *     bar?: readonly string[]
 * }
 * ```
 */
export type Impl<T> = {
    -readonly[K in keyof T]?: T[K]
}

/**
 * Convert a type T to a type suitable for use as an interface.
 *
 * All properties of T are made mandatory and 'readonly'.
 *
 * This may be used in conjunction with Impl<T>.
 *
 * For example
 * ```ts
 * interface T {
 *     readonly foo: string[]
 *     bar?: readonly string[]
 * }
 * type Required<T> = {
 *      readonly foo: readonly string[]
 *      readonly bar: readonly string[]
 * }
 * ```
 */
export type Interface<T> = {
    readonly [K in keyof T]-?: Readonly<T[K]>
}
