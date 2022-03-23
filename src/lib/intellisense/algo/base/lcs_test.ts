// tslint:disable:no-magic-numbers
import {initializeMap} from '@logi/src/lib/intellisense/utils'

import {getLcsLen, lcsLenMatch} from './lcs'

describe('get lcs length', (): void => {
    it('test1', (): void => {
        const s1 = 'abcd'
        const s2 = 'a1b2c3d4'
        const length = getLcsLen(s1, s2)
        expect(length).toEqual(4)
    })
    it('test2', (): void => {
        const s1 = 'abcd'
        const s2 = 'adcb'
        const length = getLcsLen(s1, s2)
        expect(length).toEqual(2)
    })
})

describe('lcslenmatch', (): void => {
    it('match', (): void => {
        const beMatched = ['Branch', 'Bench', 'bank']
        const input = 'bnch'
        const result = lcsLenMatch(input, beMatched, false)
        const strings = result
            .map((c: readonly [string, Map<number, number>]): string => c[0])
        expect(strings).toContain('Branch')
        expect(strings).toContain('Bench')
        const idx1 = strings.indexOf('Branch')
        const expectMap1 = initializeMap([
            [0, 0],
            [1, 3],
            [2, 4],
            [3, 5],
        ])
        expect(result[idx1][1]).toEqual(expectMap1)
    })
    it('unmatch', (): void => {
        const beMatched = ['ant']
        const input = 'tna'
        const result = lcsLenMatch(input, beMatched)
        expect(result.length).toBe(0)
    })
})

describe('lcs backtrack', (): void => {
    it('', (): void => {
        const s1 = 'Other'
        const s2 = 'Other Non Operating Income'
        const result = lcsLenMatch(s1, [s2], false)
        const expectMap = initializeMap([
            [0, 0],
            [1, 1],
            [2, 2],
            [3, 3],
            [4, 4],
        ])
        expect(result[0][1]).toEqual(expectMap)
    })
})

describe('case insensitive', (): void => {
    it('lcsLenMatch', (): void => {
        const pattern = 'anT'
        const dict = ['anta', 'ANta']
        const result = lcsLenMatch(pattern, dict, false)
        expect(result.map((c: readonly [string, Map<number, number>]):
            string => c[0])).toEqual(['anta', 'ANta'])
    })
})
