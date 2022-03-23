// tslint:disable-next-line: no-wildcard-import
import * as fc from 'fast-check'
import {readdirSync, readFileSync} from 'fs'
import {join} from 'path'

import {Error, ErrorType} from './error'
import {lex} from './lexer'
import {toToksText} from './test_utils'
import {isToken, Token} from './token'

describe('lexer test', (): void => {
    // tslint:disable: mocha-no-side-effect-code
    const path = join(__dirname, 'test_data')
    const srcs = readdirSync(path).filter((
        m: string,
    ): boolean => m.endsWith('.txt'))
    srcs.forEach((src: string): void => {
        it(src, (): void => {
            const content = readFileSync(join(path, src), 'utf-8')
            const tokenParts: (readonly (Token | Error)[])[] = []
            content.split('\n').forEach((t: string) => {
                if (t.startsWith('#') || t.match(/^ +$/) || t === '')
                    return
                const originalTokens = lex(t
                    .replace(/^'/g, '')
                    .replace(/'$/g, ''),
                )
                tokenParts.push(originalTokens)
            })
            const actualContent = toToksText(tokenParts)
            const expected = src.replace(/\.txt$/, '.toks')
            const expectedContent = readFileSync(join(path, expected), 'utf8')
            expect(actualContent).toEqual(expectedContent)
        })
    })
})

describe('properties test', (): void => {
    it('equal to original test', (): void => {
        fc.assert(
            fc.property(fc.string(), (s: string): boolean => {
                const tokens = lex(s)
                const actualString = tokens
                    .filter((t: Token | Error): boolean =>
                isToken(t) || t.type === ErrorType.UNRECORGNIZED,
            )
                    .map((t: Token | Error): string => t.image)
                    .join('')
                return actualString === s
            }),
            {verbose: true},
        )
    })
})
