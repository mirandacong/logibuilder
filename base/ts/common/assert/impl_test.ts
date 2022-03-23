import {
    assertIsDefined,
    assertIsNumber,
    assertIsString,
    assertIsStringArray,
    assertIsUint8Array,
    assertSafeThrow,
} from './impl'

// tslint:disable-next-line: max-func-body-length
describe('Assert test', (): void => {
    it('assertIsString', (): void => {
        let foo: string | undefined
        foo = 'abc'
        assertIsString(foo)
        expect(foo).toBe('abc')
    })
    it('assertIsStringArray', (): void => {
        let foo: string[] | undefined
        foo = ['abc']
        assertIsStringArray(foo)
        expect(foo).toEqual(['abc'])
    })
    it('assertIsNumber', (): void => {
        let foo: number | undefined
        foo = 1
        assertIsNumber(foo)
        expect(foo).toBe(1)
    })
    it('assertIsUint8Array', (): void => {
        let foo: Uint8Array | undefined
        foo = new Uint8Array([1])
        assertIsUint8Array(foo)
        expect(foo).toEqual(new Uint8Array([1]))
    })
    it('assertSafeThrow', (): void => {
        const enum Foo {
            A,
            B,
        }
        const foo: Foo = Foo.A
        switch (foo) {
        case Foo.A:
            expect(foo).toBe(Foo.A)
            break
        default:
            assertSafeThrow()
        }
    })
    it('assertIsDefined', (): void => {
        let foo: string | undefined
        foo = 'abc'
        assertIsDefined<string>(foo)
        expect(foo).toBe('abc')
    })
})
