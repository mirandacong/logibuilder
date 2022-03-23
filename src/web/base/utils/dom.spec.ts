import {addClass, hasClass, removeClass} from './dom'

// tslint:disable: no-magic-numbers
describe('Type guard test', (): void => {
    it('has class', (): void => {
        const div = document.createElement('div')
        div.classList.add('a', 'b', 'c')
        expect(hasClass(div, 'b')).toBe(true)
        expect(hasClass(div, 'd')).toBe(false)
    })

    it('add class and remove class', (): void => {
        const div = document.createElement('div')
        expect(div.classList.length).toBe(0)
        addClass(div, 'a')
        expect(div.classList.length).toBe(1)
        expect(hasClass(div, 'a')).toBe(true)
        addClass(div, 'a')
        expect(div.classList.length).toBe(1)
        addClass(div, 'b')
        expect(div.classList.length).toBe(2)

        removeClass(div, 'c')
        expect(div.classList.length).toBe(2)
        removeClass(div, 'a')
        expect(div.classList.length).toBe(1)
        expect(hasClass(div, 'a')).toBe(false)
    })
})
