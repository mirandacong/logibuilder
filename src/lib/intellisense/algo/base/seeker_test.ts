import {EmptyStrategy} from '../seeker'

import {lcsLenMatch} from './lcs'
import {BaseSeekerBuilder} from './seeker'

describe('base seeker', (): void => {
    const data = [
        'bank',
        'banana',
        'branch',
    ]
    it('empty empty', (): void => {
        const seeker = new BaseSeekerBuilder()
            .data(data)
            .executor(lcsLenMatch)
            .emptyStrategy(EmptyStrategy.EMPTY)
            .build()
        const result = seeker.seek('')
        expect(result.length).toBe(0)
    })
    it('empty all', (): void => {
        const seeker = new BaseSeekerBuilder()
            .data(data)
            .executor(lcsLenMatch)
            .emptyStrategy(EmptyStrategy.ALL)
            .build()
        const result = seeker.seek('')
        // tslint:disable-next-line: no-magic-numbers
        expect(result.length).toBe(3)
    })
})
