/**
 * This file exists to demonstrate typical usages and effects of a few mapped
 * types.
 */

import {Immutable, Impl, Interface, Mutable, Required, Writable} from './impl'

export interface T {
    readonly foo: readonly string[]
    readonly bar?: readonly string[]
}

/**
 * {
 *      readonly foo?: string[]
 *      bar?: readonly string[]
 * }
 */
export type PartialType = Partial<T>

/**
 * {
 *      readonly foo: string[]
 *      bar: readonly string[]
 * }
 */
export type RequiredType = Required<T>

/**
 * {
 *     foo: string[]
 *     bar?: readonly string[]
 * }
 */
export type WritableType = Writable<T>

/**
 * {
 *     readonly foo: string[]
 *     readonly bar?: readonly string[]
 * }
 */
export type ReadonlyType = Readonly<T>

/**
 * {
 *     readonly foo: string[]
 *     bar?: string[]
 * }
 */
export type MutableType = Mutable<T>

/**
 * {
 *     readonly foo: readonly string[]
 *     bar?: readonly string[]
 * }
 */
export type ImmutableType = Immutable<T>

/**
 * {
 *     foo?: string[]
 *     bar?: readonly string[]
 * }
 */
export type ImplType = Impl<T>

/**
 * {
 *      readonly foo: readonly string[]
 *      readonly bar: readonly string[]
 * }
 */
export type InterfaceType = Interface<T>
