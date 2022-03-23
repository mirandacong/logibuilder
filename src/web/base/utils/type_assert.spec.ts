import {assertIsHTMLInputElement} from './type_assert'

describe('Type assert test', (): void => {
    it('html input element', (): void => {
        let input: HTMLInputElement | null
        input = document.createElement('input')
        assertIsHTMLInputElement(input)
        expect(input).not.toBeNull()
    })
})
