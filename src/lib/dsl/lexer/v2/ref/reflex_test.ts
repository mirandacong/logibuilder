// tslint:disable: no-magic-numbers
// tslint:disable-next-line: no-wildcard-import
import * as fc from 'fast-check'

import {isRefError, RefError, RefErrorType} from './error'
import {reflex} from './reflex'
import {isRefToken, RefToken, RefTokenType} from './token'

// tslint:disable-next-line: max-func-body-length
describe('ref lex test', (): void => {
    it('normal', (): void => {
        const path1 = '{Sheet1!Table!Row1}'
        const toks = reflex(path1)
        expect(toks.length).toBe(7)
        expect(toks[0].type).toBe(RefTokenType.REF_START)
        expect(toks[1].type).toBe(RefTokenType.PART)
        expect(toks[2].type).toBe(RefTokenType.SPLITTER)
    })
    it('keyword', (): void => {
        const path = '{Table1!ALL}'
        const toks = reflex(path)
        expect(toks.length).toBe(5)
        expect(toks[1].type).toBe(RefTokenType.PART)
        expect(toks[2].type).toBe(RefTokenType.SPLITTER)
        expect(toks[3].type).toBe(RefTokenType.KEYWORD)
        const path2 = '{this}'
        const toks2 = reflex(path2)
        expect(toks2.length).toBe(3)
        expect(toks2[1].type).toBe(RefTokenType.KEYWORD)
        const path3 = '{all in costs}'
        const toks3 = reflex(path3)
        expect(toks3.length).toBe(3)
        expect(toks3[1].type).toBe(RefTokenType.PART)
    })
    it('label1', (): void => {
        const path = '{row1[[a, b, c]]}'
        const toks = reflex(path)
        expect(toks.length).toBe(12)
        expect(toks[0].type).toBe(RefTokenType.REF_START)
        expect(toks[1].type).toBe(RefTokenType.PART)
        expect(toks[2].type).toBe(RefTokenType.LABEL_START)
        expect(toks[3].type).toBe(RefTokenType.LABEL)
        expect(toks[4].type).toBe(RefTokenType.LABEL_SPLITTER)
    })
    it('label2', (): void => {
        const path = '{Table1[[a, b]]!row1[[c]]}'
        const toks = reflex(path)
        expect(toks.length).toBe(14)
    })
    it('label3', (): void => {
        const path = '{abc[[label]]}'
        const toks = reflex(path)
        expect(toks[3].image).toBe('label')
    })
    it('spaces should not be ignored in the tokens', (): void => {
        const expr = '{book! sheet!table  !row1}'
        const toks = reflex(expr)
        expect(toks.length).toBe(11)
        expect(toks[3].type).toBe(RefTokenType.WS)
        expect(toks[3].image).toBe(' ')
        expect(toks[7].image).toBe('  ')
    })
    it('index', (): void => {
        const expr = '{a!bc!d@7}'
        const toks = reflex(expr)
        expect(toks.length).toBe(8)
        expect(toks[6].type).toBe(RefTokenType.ALIAS)
        const expr2 = '{row1@}'
        const toks2 = reflex(expr2)
        expect(toks2.length).toBe(4)
        expect(isRefError(toks2[2])).toBe(true)
    })
    it('empty block or table name', (): void => {
        const expr = '{a!!b}'
        const toks = reflex(expr)
        expect(toks.length).toBe(7)
        expect(toks.filter(x => x.type === RefTokenType.PART).length).toBe(3)
    })
    it('empty row name', (): void => {
        const expr = '{a!b!}'
        const toks = reflex(expr)
        expect(toks.length).toBe(7)
        expect(toks.filter(x => x.type === RefTokenType.PART).length).toBe(3)
    })
})

describe('properties test', (): void => {
    it('equal to original test', (): void => {
        fc.assert(
            fc.property(fc.string(), (s: string): boolean => {
                const image = `{${s}}`
                const tokens = reflex(image)
                const actualString = tokens
                    .filter((t: RefToken | RefError): boolean =>
                isRefToken(t) || t.type === RefErrorType.UNRECOGNIZED,
            )
                    .map((t: RefToken | RefError): string => t.image)
                    .join('')
                return actualString === image
            }),
            {verbose: true},
        )
    })
})
