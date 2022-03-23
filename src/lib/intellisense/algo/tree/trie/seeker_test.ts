import {readFileSync} from 'fs'
import {join} from 'path'

import {EmptyStrategy, Target} from '../../seeker'

import {TrieSeekerBuilder} from './seeker'

describe('trie', (): void => {
    const enFile = '../testdata/english.txt'
    const chFile = '../testdata/chinese.txt'
    it('en match', (): void => {
        const data = readFileSync(join(__dirname, enFile), 'utf-8').split('\n')
        const seeker = new TrieSeekerBuilder().data(data).build()
        const result = seeker.seek('Sh')
        // tslint:disable-next-line: no-magic-numbers
        expect(result.length).toBe(2)
        expect(result.map((t: Target): string => t.content))
            .toEqual(['Share Premium', 'Short-Term Investments'])
    })
    it('ch match', (): void => {
        const data = readFileSync(join(__dirname, chFile), 'utf-8').split('\n')
        const seeker = new TrieSeekerBuilder().data(data).build()
        const result = seeker.seek('资本')
        expect(result.map((t: Target): string => t.content).sort())
            .toEqual(['资本公积', '资本化支出', '资本溢价'])
    })
    it('strategy empty', (): void => {
        const data = readFileSync(join(__dirname, enFile), 'utf-8').split('\n')
        const seeker = new TrieSeekerBuilder()
            .data(data)
            .emptyStrategy(EmptyStrategy.EMPTY)
            .build()
        const result = seeker.seek('')
        expect(result).toEqual([])
    })
    it('strategy all', (): void => {
        const data = readFileSync(join(__dirname, enFile), 'utf-8').split('\n')
        const seeker = new TrieSeekerBuilder()
            .data(data)
            .emptyStrategy(EmptyStrategy.ALL)
            .build()
        const result = seeker.seek('')
        // tslint:disable-next-line: no-magic-numbers
        expect(result.length).toBe(7)
    })
})
