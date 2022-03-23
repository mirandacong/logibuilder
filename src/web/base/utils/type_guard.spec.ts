import {isHTMLInputElement} from './type_guard'

describe('Type guard test', (): void => {
    it('html input element', (): void => {
        const div = document.createElement('div')
        expect(isHTMLInputElement(div)).toBe(false)
        const input = document.createElement('input')
        expect(isHTMLInputElement(input)).toBe(true)
    })
})
