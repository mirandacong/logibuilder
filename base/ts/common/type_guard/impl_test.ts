import {isBoolean, isString, isUint8Array} from './impl'

// tslint:disable: no-null-keyword no-construct no-magic-numbers
describe('type guard test', (): void => {
    it('string type', (): void => {
        expect(isString('')).toBe(true)
        expect(isString('hello')).toBe(true)
        expect(isString(new String('hello'))).toBe(true)
        expect(isString(String('hello'))).toBe(true)
        expect(isString(0)).toBe(false)
        expect(isString(null)).toBe(false)
        expect(isString(undefined)).toBe(false)
        expect(isString(true)).toBe(false)
        expect(isString({})).toBe(false)
    })
    it('boolean type', (): void => {
        expect(isBoolean(true)).toBe(true)
        expect(isBoolean(false)).toBe(true)
        expect(isBoolean(1)).toBe(false)
        expect(isBoolean(0)).toBe(false)
        expect(isBoolean('')).toBe(false)
        expect(isBoolean(null)).toBe(false)
        expect(isBoolean(undefined)).toBe(false)
        expect(isBoolean({})).toBe(false)
    })
    it('uint8array type', (): void => {
        const object1 = new Uint8Array([])
        const object2 = new Uint16Array([])
        const object3 = new ArrayBuffer(8)
        const object4 = 1
        const object5 = 'Uint8Array'
        const object6 = {}
        expect(isUint8Array(object1)).toBe(true)
        expect(isUint8Array(object2)).toBe(false)
        expect(isUint8Array(object3)).toBe(false)
        expect(isUint8Array(object4)).toBe(false)
        expect(isUint8Array(object5)).toBe(false)
        expect(isUint8Array(object6)).toBe(false)
    })
})
