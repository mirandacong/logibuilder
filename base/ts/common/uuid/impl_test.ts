import {getUuid} from './impl'

describe('UUID test', (): void => {
    it('uuid string length test', (): void => {
        // tslint:disable-next-line:no-magic-numbers
        expect(getUuid().length).toBe(36)
    })
})
