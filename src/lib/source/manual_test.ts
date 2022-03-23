import {ManualSourceBuilder} from './manual'

describe('manual', (): void => {
    it('string type number', (): void => {
        const source = new ManualSourceBuilder().value('1').build()
        expect(source.value).toEqual(1)
    })
})
