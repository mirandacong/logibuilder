import {editDistMatch} from './edit_distance'

describe('edit match', (): void => {
    it('match', (): void => {
        const beMatched = ['Branch', 'Bench']
        const input = 'Bench'
        const result = editDistMatch(input, beMatched)
        const strings = result
            .map((c: readonly [string, Map<number, number>]): string => c[0])
        expect(strings).toContain('Branch')
        expect(strings).toContain('Bench')
    })
})

describe(('edit_distance index'), (): void => {
    it('test', (): void => {
        const s1 = 'abcde'
        const s2 = 'acbde'
        const result = editDistMatch(s1, [s2])[0]
        const expected = new Map<number, number>()
        // tslint:disable-next-line:no-magic-numbers
        const expectedList = [[0, 0], [2, 1], [3, 3], [4, 4]]
        expectedList.forEach((value: number[]): Map<number, number> =>
            expected.set(value[0], value[1]))
        expect(result[1]).toEqual(expected)
    })
})

describe('edit distance', (): void => {
    it('case sensitive', (): void => {
        const s1 = 'anTa'
        const dict = ['anTA', 'AmTa']
        const result = editDistMatch(s1, dict, false)
        const output = result
            .map((c: readonly [string, Map<number, number>]): string => c[0])
        expect(output).toEqual(['anTA', 'AmTa'])
    })
})
