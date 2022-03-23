import {initializeMap} from '@logi/src/lib/intellisense/utils'

import {prefixMatch} from './prefix'

describe('prefix match', (): void => {
    it('match', (): void => {
        const beMatched = ['Branch', 'Bench', 'Bracket']
        const input = 'Bra'
        const result = prefixMatch(input, beMatched)
        const strings = result
            .map((c: readonly [string, Map<number, number>]): string => c[0])
        expect(strings).toContain('Branch')
        expect(strings).toContain('Bracket')
        // tslint:disable-next-line:no-magic-numbers
        expect(strings.length).toBe(2)
        // tslint:disable-next-line:no-magic-numbers
        const expectMap = initializeMap([[0, 0], [1, 1], [2, 2]])
        expect(result[0][1]).toEqual(expectMap)
        expect(result[1][1]).toEqual(expectMap)
    })
})

describe('prefix match', (): void => {
    it('case insensitive', (): void => {
        const input = 'Ant'
        const dict = ['Anta', 'anTa']
        const output = prefixMatch(input, dict, false)
        const words = output
            .map((c: readonly [string, Map<number, number>]): string => c[0])
        expect(words).toEqual(dict)
    })
})
