import {Impl} from '@logi/base/ts/common/mapped_types'

/**
 * Basic builder class.
 *
 * The goal of this class is to create an object which type is `T` by receiving
 * the interface (type `T`) and the class impl (type `S`) which implements this
 * interface.
 *
 *           +--------------+                +--------------+
 *           |  Interface   |   Generic `T`  |   Builder    |
 *           |              |--------------->| (This Class) |
 *           +--------------+                +--------------+
 *                   ^                              ^
 *                   |                              |
 *                   | Implements                   |
 *                   |                              |
 *                   |                              |
 *           +--------------+                       |
 *           |  ClassImpl   |         Generic `S`   |
 *           |              |-----------------------+
 *           +--------------+
 *
 * The first generic type, T, is the type returned by the build() method.
 *
 * The second generic type, S, is the implementation type used interanlly by
 * the builder for constructing the object (that is later returned by build()).
 *
 * Note the `return ret as any as T` in the build() method.  It forces the
 * build() method to return the object of type S as type T to make the TS
 * compiler happy.  Otherwise, the TS compiler would complain that S, which only
 * extends Impl<T> = Mutable<Partial<T>> is not assignable to T.
 *
 * We cannot make S extends T.  Because it is expected that some properties of
 * the object (of type S) under construction are missing before calling build().
 *
 * Just to complete the reasoning, we cannot force the users to assign default
 * values to ALL properties either as it is too much a burden on the user.
 *
 * In one word, the need to incrementally assign values to properties of the
 * object while building the object conflicts with the need to return an object
 * whoe type definition does not have any optional properties, i.e. via ?.
 *
 * The choice made here is to let the user of this builder class make sure that
 * T and S are compatible while allowing the user to write simple code in
 * derived build classes.
 *
 * To remedy the lack of type enforcement, this class provides a hook, verify(),
 * that is called inside build().  Subclasses of this builder class may override
 * the verify() method to implement arbitrarily complex type and property
 * checks to ensure that the object returned by build() is indeed comptible with
 * type T.
 */
export class Builder<T, S extends Impl<T>> {
    /**
     * The list of properties declared with definite assignment assertions.
     *
     * Only used by verifyDaaProperties().
     *
     * If a subclass, MyClass, of this builder class wishes to verify the
     * existence of some fields, say 'foo' and 'bar', MyClass could use the
     * following snippet:
     *      ```ts
     *      protected get daa(): string[] {
     *          return MyClass.__DAA_PROPS__;
     *      }
     *      protected static readonly __DAA_PROPS__ = ['foo', 'bar'];
     *      ```
     *
     * TODO (zhongming): Explain the design rationales of this.
     */
    protected get daa(): readonly string[] {
        return Builder.__DAA_PROPS__
    }

    /**
     * Static method of Build used for a shallow copy.
     *
     * Used in constructor of actual build class. For example:
     *      ```ts
     *      export class FooBuilder extends Builder<Foo, FooImpl> {
     *          public constructor(obj?: Readonly<Foo>) {
     *              const impl = new FooImpl()
     *              if (obj)
     *                  FooBuilder.shallowCopy(impl, obj)
     *              super(impl)
     *          }
     *      }
     *      ```
     */
    public static shallowCopy<T>(target: T, source: T): void {
        // tslint:disable-next-line: no-object
        Object.keys(source).forEach((key: string): void => {
            /**
             * Targe and source object would have no index signature. Use
             * @ts-ignore here to prevent it
             */
            // @ts-ignore
            target[key] = source[key]
        })
    }

    /**
     * Build the proper instance.
     *
     * May only be called once per builder object as it invalidates the internal
     * copy of the object (set this.impl to null).  Subsequent calls to any
     * method in the builder class will result in runtime exceptions saying that
     * the builder class already completed its job and can no longer be used.
     */
    public build(): Readonly<T> {
        this.preBuildHook()
        this.verifyDaaProperties()
        const ret = this.getImpl()

        /**
         * The `impl` property is readonly. So that it does not get modified in
         * subclasses of this Builder class. However, we still need to assign
         * undefined to it in this build() method to record that fact that the
         * build() method has already been called.
         */
        // @ts-ignore Assign undefined to readonly
        this._impl = undefined

        /**
         * The type assertion below is not safe.
         *
         * It is intended to assign type `S` into type `T`, so user need to make
         * the compatible, please see the tsdoc of this class for more
         * information.
         */
        return ret as unknown as T  // tslint:disable-line:no-any
    }

    /**
     * Construct the builder object from the implementation class or an
     * existing object.
     *
     * While using the implementation class, only the first parameter, ctor,
     * should be specified.  `new () => T` is the type of the T.constructor()
     * method. This allows the methods such as getImpl() to dynamically create
     * new instances of T.
     *
     * This solution was taken from:
     *      https://stackoverflow.com/questions/17382143/how-to-create-a-new-object-from-type-parameter-in-generic-class-in-typescript
     *      https://github.com/Microsoft/TypeScript/issues/2037
     *
     *      impl type   |   status
     *
     *      undefined   |   finished building, i.e., called build()
     *              S   |   object under construction
     */
    // tslint:disable-next-line: parameter-properties
    protected constructor(private readonly _impl?: S) {}

    protected static readonly __DAA_PROPS__: readonly string[] = []

    // tslint:disable-next-line: prefer-function-over-method
    protected preBuildHook(): void {
        return
    }

    /**
     * Get or create this.impl if build() has not been called.
     *
     * Raise error otherwise.
     */
    protected getImpl(): S {
        if (this._impl === undefined)
            // tslint:disable-next-line: no-throw
            throw Error('Already called build().')

        /**
         * Safe to type assertion below because the constructor of the builder
         * class already assigns a value to this.impl.
         */
        return this._impl as S
    }

    /**
     * Verify that fields declared with definite assignment assertions.
     *
     * Definite Assignment Assertion:
     *      https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html
     */
    protected verifyDaaProperties(): void {
        // tslint:disable-next-line: no-object
        const definedProperties = Object.getOwnPropertyNames(this.getImpl())
        this.daa.forEach((p: string): void => {
            if (!definedProperties.includes(p))
                // tslint:disable-next-line: no-throw
                throw Error(`Undefined field: '${p}'`)
        })
    }
}
