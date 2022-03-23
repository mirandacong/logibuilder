import * as GC from '@grapecity/spread-sheets'

import {
    a1NotationsToCoordsRange,
    a1NotationToCoord,
    getA1NotationRange,
} from './range'

import Range = GC.Spread.Sheets.Range

// tslint:disable: no-magic-numbers
describe('range test', (): void => {
    it('get a1 notation of range', () => {
        const range = new Range(0, 0, 1, 2)
        expect(getA1NotationRange(range)).toBe('A1:B1')
    })

    it('a1 notation to coord', () => {
        expect(a1NotationToCoord('A1')).toEqual([0, 0])
        expect(a1NotationToCoord('C2')).toEqual([1, 2])
        expect(a1NotationToCoord('AA20')).toEqual([19, 26])
        expect(a1NotationToCoord('2A2')).toBe(null)
        expect(a1NotationToCoord('A0')).toBe(null)
        expect(a1NotationToCoord('A-2')).toBe(null)
    })

    it('a1 notation to coord', () => {
        expect(a1NotationsToCoordsRange('A1')).toBe(null)
        expect(a1NotationsToCoordsRange('A2:C4')).toEqual([[1, 0], [3, 2]])
        expect(a1NotationsToCoordsRange('C4:A2')).toEqual([[1, 0], [3, 2]])
        expect(a1NotationsToCoordsRange('B3:J3')).toEqual([[2, 1], [2, 9]])
        expect(a1NotationsToCoordsRange('F15:D3')).toEqual([[2, 3], [14, 5]])
    })
})
