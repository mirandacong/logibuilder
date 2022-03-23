import {readFileSync} from 'fs'
import {join} from 'path'

import {EmptyStrategy} from '../../seeker'

import {AbbrSeekerBuilder} from './seeker'

describe('abbr seeker', (): void => {
    const file = '../testdata/english.txt'
    let data: readonly string[]
    beforeEach((): void => {
        data = readFileSync(join(__dirname, file), 'utf-8').split('\n')
    })
    it('match', (): void => {
        const seeker = new AbbrSeekerBuilder().data(data).build()
        const result = seeker.seek('AddiII')
        expect(result.length).toBe(1)
        expect(result[0].content).toBe('Additional Inventory Items')
        // tslint:disable-next-line:no-magic-numbers
        const matchedPos = [0, 1, 2, 3, 11, 21]
        const expectedMap = new Map<number, number>()
        matchedPos.forEach((value: number, idx: number): void => {
            expectedMap.set(idx, value)
        })
        expect(result[0].matchedMap).toEqual(expectedMap)
    })
    it('strategy empty', (): void => {
        const seeker = new AbbrSeekerBuilder()
            .data(data)
            .emptyStrategy(EmptyStrategy.EMPTY)
            .build()
        expect(seeker.seek('').length).toBe(0)
    })
    it('stragegy all', (): void => {
        const seeker = new AbbrSeekerBuilder()
            .data(data)
            .emptyStrategy(EmptyStrategy.ALL)
            .build()
        // tslint:disable-next-line: no-magic-numbers
        expect(seeker.seek('').length).toBe(7)
    })
})
