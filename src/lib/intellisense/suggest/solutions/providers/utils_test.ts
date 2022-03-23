import {filterWord} from './utils'

// tslint:disable-next-line: max-func-body-length
describe('provider util', (): void => {
    it('filter word', (): void => {
        const filters = ['bank', 'branch', 'banana']
        const input = 'ban'
        expect(filterWord(input, filters)).toBe(true)
        expect(filterWord('bank', filters)).toBe(false)
    })
})
