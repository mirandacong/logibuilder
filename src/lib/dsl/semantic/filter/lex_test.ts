// tslint:disable: no-magic-numbers
import {lex} from './lex'
import {Type} from './token'

describe('lex test', (): void => {
    it('a label', (): void => {
        const expr = 'hist'
        const toks = lex(expr)
        expect(toks.length).toBe(1)
        expect(toks[0].type).toBe(Type.VALUE)
        expect(toks[0].image).toBe('hist')
    })
    it('a label within whitespace', (): void => {
        const expr = 'last  year'
        const toks = lex(expr)
        expect(toks.length).toBe(1)
        expect(toks[0].type).toBe(Type.VALUE)
        expect(toks[0].image).toBe(expr)
    })
    it('op', (): void => {
        const expr = 'hist AND last'
        const toks = lex(expr)
        expect(toks.length).toBe(5)
        expect(toks[0].type).toBe(Type.VALUE)
        expect(toks[0].image).toBe('hist')
        expect(toks[1].type).toBe(Type.WS)
        expect(toks[2].type).toBe(Type.AND)
        expect(toks[3].type).toBe(Type.WS)
        expect(toks[4].type).toBe(Type.VALUE)
        expect(toks[4].image).toBe('last')
    })
    it('bracket', (): void => {
        const expr = '(abc OR def  ghi    ) AND jkl'
        const toks = lex(expr)
        expect(toks.length).toBe(12)
        expect(toks[5].image).toBe('def  ghi')
    })
})
