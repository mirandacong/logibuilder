import {Foo, FooBuilder} from './example'

describe('Builder example test', () => {
    it('Build Foo', () => {
        const fooData = ['foo']
        const foo: Foo = new FooBuilder().foo(fooData).bar('bar').build()
        expect(foo.foo).toBe(fooData)
        expect(foo.bar).toBe('bar')
        expect(foo.getBar()).toBe('bar')

        const clone = new FooBuilder(foo).build()
        expect(clone.foo).toBe(fooData)
        expect(clone.bar).toBe('bar')
        expect(foo.getBar()).toBe('bar')
        expect(clone === foo).toBe(false)

        const fork = new FooBuilder(foo).bar('bar2').build()
        expect(fork.foo).toBe(fooData)
        expect(fork.bar).toBe('bar2')
        expect(fork === foo).toBe(false)
    })

    it('Update Foo', () => {
        const fooData = ['foo']
        const foo = new FooBuilder().foo(fooData).bar('bar').build()
        updateFoo(foo)
        expect(foo.foo).toBe(fooData)
        expect(foo.bar).toBe('newbar')
    })

    it('Build Foo without daa properties', () => {
        expect(() => new FooBuilder().build()).toThrow()
    })
})

function updateFoo(foo: Foo): void {
    foo.bar = 'newbar'

    return
}
