import {normalizeExcelValue, isPositiveInteger} from './number'

// tslint:disable: no-magic-numbers
describe('number test', (): void => {
    it('normalize excel value', (): void => {
        expect(normalizeExcelValue(0)).toBe('0')
        expect(normalizeExcelValue(1)).toBe('1')
        expect(normalizeExcelValue(1.234)).toBe('1.23')
        expect(normalizeExcelValue(1.235)).toBe('1.24')
        expect(normalizeExcelValue(-1.235)).toBe('(1.24)')
        expect(normalizeExcelValue(Number('as'))).toBe('-')
    })
    it('check positive integer', () => {
        expect(isPositiveInteger('1')).toBe(false)
        expect(isPositiveInteger(null)).toBe(false)
        expect(isPositiveInteger(undefined)).toBe(false)
        expect(isPositiveInteger({})).toBe(false)
        expect(isPositiveInteger(true)).toBe(false)
        expect(isPositiveInteger(0)).toBe(false)
        expect(isPositiveInteger(0.1)).toBe(false)
        expect(isPositiveInteger(-1)).toBe(false)
        expect(isPositiveInteger(1)).toBe(true)
        expect(isPositiveInteger(+0)).toBe(false)
        expect(isPositiveInteger(+1)).toBe(true)
        expect(isPositiveInteger(1.123)).toBe(false)
        expect(isPositiveInteger(1e2)).toBe(true)
        expect(isPositiveInteger(123456789)).toBe(true)
    })
})
