// tslint:disable:no-magic-numbers
import {lex} from '@logi/src/lib/dsl/lexer/v2'

import {findEditingBlock, findEditingToken} from './parse'

describe('findEditingToken', (): void => {
    // tslint:disable-next-line:max-func-body-length
    it('trailing spaces', (): void => {
        const input = 'SUM(A , B) + AVER   '
        const tokens = lex(input)
        const offset1 = 2
        const idx = findEditingToken(offset1, tokens)
        expect(idx).toEqual(0)
        const offset2 = input.length
        const idx2 = findEditingToken(offset2, tokens)
        expect(tokens[idx2].image).toEqual('   ')
    })
})

describe('findEditingBlock', (): void => {
    // tslint:disable-next-line:max-func-body-length
    it('function', (): void => {
        const input = 'SU'
        const offset = 2
        const tokens = lex(input)
        const edits = findEditingBlock(offset, tokens)
        expect(edits.start).toEqual(0)
        expect(edits.end).toEqual(0)
    })
    it('refnames', (): void => {
        const input = 'SUM({A} , {BC'
        const tokens = lex(input)
        const edits = findEditingBlock(input.indexOf('C') + 1, tokens)
        expect(edits.start).toEqual(6)
        expect(edits.end).toEqual(6)
    })
    it('namespace', (): void => {
        const input = '{Book!Sheet!C!BC'
        const tokens = lex(input)
        const edits = findEditingBlock(input.lastIndexOf('C') + 1, tokens)
        expect(edits.start).toEqual(0)
        expect(edits.end).toEqual(0)
    })
    it('{here}', (): void => {
        const input = 'SUM({A}, {B}) + {Book!Sheet!Title!C}'
        const offset = input.indexOf('t') + 1
        const tokens = lex(input)
        const edits = findEditingBlock(offset, tokens)
        expect(edits.start).toEqual(10)
        expect(edits.end).toEqual(10)
    })
})
