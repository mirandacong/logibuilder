import {Builder as BaseBuilder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
// tslint:disable-next-line: no-wildcard-import
import * as t from 'io-ts'

import {Op, OpType} from './node'

/**
 * Base builder class for various subclasses of `Op`.
 *
 * The first generic type, T, is a readonly type returned by the build() method
 * of the builder.
 *
 * The second generic type, S, is a writable partial type used internally by
 * the builder while constructing the `Op` object (that is later returned by
 * calling build()).
 */
export abstract class Builder<T extends Op, S extends Impl<T>> extends
    BaseBuilder<T, S> {
    protected get daa(): readonly string[] {
        return Builder.__DAA_PROPS__
    }

    //
    // Properties common to all `Op`s.
    //
    public name(name: string): this {
        this._getImpl().name = name

        return this
    }

    public inTypes(inTypes: readonly t.Mixed[]): this {
        this._getImpl().inTypes = inTypes

        return this
    }

    public outType(outType: t.Mixed): this {
        this._getImpl().outType = outType

        return this
    }
    protected static readonly __DAA_PROPS__: readonly string[] =
        ['inTypes', 'outType']

    protected preBuildHook(): void {
        if (this._getImpl().name === undefined)
            this._generateName()
    }

    /**
     * Force the compiler to recognize due properties on impl.
     *
     * The type assertion involved is indeed safe, as can be proven through
     * computations in the type system.  It is just that the TS compiler failed
     * to prove it for itself.
     */
    // tslint:disable-next-line: ext-variable-name
    protected _getImpl(): Impl<T> {
        return this.getImpl() as Impl<T>
    }

    private _generateName(): void {
        this._getImpl().name = OpType[this._getImpl().optype as OpType]
    }
}
