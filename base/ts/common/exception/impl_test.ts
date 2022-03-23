import {ExceptionBuilder, Type} from './impl'

describe('Error test', () => {
    it('error test', () => {
        const err1 = new ExceptionBuilder()
            .message('error message')
            .type(Type.OTHER)
            .build()
        expect(err1.type).toBe(Type.OTHER)
        expect(err1.message).toBe('error message')

        const err2 = new ExceptionBuilder().message('error message').build()
        expect(err2.message).toBe('error message')
    })
    it('build error test', () => {
        const err1 = new ExceptionBuilder()
        expect(() => err1.build()).toThrow()
        const err2 = new ExceptionBuilder().type(Type.OTHER)
        expect(() => err2.build()).toThrow()
    })
})
