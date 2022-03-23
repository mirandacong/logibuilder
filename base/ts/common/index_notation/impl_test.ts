// tslint:disable:no-magic-numbers
import {toA1notation, toZeroBasedNotation} from './impl'

const DATA1: readonly (readonly [number, string])[] = [
        [0, 'A'],
        [1, 'B'],
        [25, 'Z'],
        [31, 'AF'],
        [2 * 26 * 26 + 4 * 26 + 24, 'BDY'],
        [730 , 'ABC'],
]
DATA1.forEach(([index, a1notation]: readonly [number, string]) => {
    describe('Notation translate test', () => {
        it(`${index} <=> ${a1notation}`, () => {
            expect(toA1notation(index)).toBe(a1notation)
            expect(toZeroBasedNotation(a1notation)).toBe(index)
        })
    })
})

const DATA2: readonly number[] = [
    -1,
    3.324,
    -2.343,
]
DATA2.forEach((index: number) => {
    describe('Invalid input', () => {
        it(`${index}`, () => {
            expect(() => {
                toA1notation(index)
            }).toThrow()
        })
    })
})

const DATA3: readonly string[] = [
    'A0',
    'A ',
    'a ',
    '',
    '.A',
    'AN8',
]
DATA3.forEach((str: string) => {
    describe('zeroBasedNotation Invalid input', () => {
        it(`${str}`, () => {
            expect(() => {
                toZeroBasedNotation(str)
            }).toThrow()
        })
    })
})
