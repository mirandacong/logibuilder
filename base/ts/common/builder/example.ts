import {Impl} from '@logi/base/ts/common/mapped_types'

import {Builder} from './impl'

export class Kar {
    public kar = 'kar'
}

/**
 * Demonstrate usage of fork within the Builder class.
 */
export interface Foo {
    readonly foo: readonly string[]
    // tslint:disable-next-line: readonly-keyword
    bar: string
    getBar(): string
}

class FooImpl extends Kar implements Impl<Foo> {
    public foo!: readonly string[]
    public bar!: string
    public getBar(): string {
        return this.bar
    }
}

export class FooBuilder extends Builder<Foo, FooImpl> {
    public constructor(obj?: Readonly<Foo>) {
        const impl = new FooImpl()
        if (obj)
            FooBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public foo(foo: readonly string[]): FooBuilder {
        this.getImpl().foo = foo

        return this
    }

    public bar(bar: string): FooBuilder {
        this.getImpl().bar = bar

        return this
    }

    protected get daa(): readonly string[] {
        return FooBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['foo', 'bar']
}
