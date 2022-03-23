// tslint:disable: no-magic-numbers
import {
    HelperPart,
    HelperPartType,
} from '@logi/src/lib/intellisense/editor/display'

import {TextStatusBuilder} from '../status/textbox'

import {getFuncHelperResponse} from './func_helper'

// tslint:disable: max-func-body-length
describe('func usage response test', (): void => {
    const text = '{a}.lag(1) + sum(1, average({a}, )) + power(1, 2, 3)'
    it('not in function', (): void => {
        /**
         * {a}.lag(1) +
         *          ^
         */
        const txt2 = new TextStatusBuilder()
            .text(Array.from(text))
            .endOffset(10)
            .build()
        const result2 = getFuncHelperResponse(txt2)
        expect(result2).toBeUndefined()
    })
    it('{a}.lag(1)', (): void => {
        const expectedStr = '{ref}.lag(时期)'
        /**
         * {a}.lag(1)
         *     ^
         */
        const txt = new TextStatusBuilder()
            .text(Array.from(text))
            .endOffset(5)
            .build()
        const result = getFuncHelperResponse(txt)
        expect(result).toBeDefined()
        if (result === undefined)
            return
        expect(result.parts.length).toBe(6)
        expect(result.imageIndex).toBe(1)
        expect(partToString(result.parts)).toBe(expectedStr)
        /**
         * {a}.lag(1)
         *         ^
         */
        const txt2 = new TextStatusBuilder()
            .text(Array.from(text))
            .endOffset(9)
            .build()
        const result2 = getFuncHelperResponse(txt2)
        expect(result2).toBeDefined()
        if (result2 === undefined)
            return
        expect(result2.parts.length).toBe(6)
        expect(result2.imageIndex).toBe(1)
        expect(partToString(result2.parts)).toBe(expectedStr)
        /**
         * {a}.lag(1)
         *        ^
         */
        const txt3 = new TextStatusBuilder()
            .text(Array.from(text))
            .endOffset(8)
            .build()
        const result3 = getFuncHelperResponse(txt3)
        expect(result3).toBeDefined()
        if (result3 === undefined)
            return
        const part = result3.parts
        expect(part[0].type).toBe(HelperPartType.REFERENCE)
        expect(part[1].type).toBe(HelperPartType.DOT)
        expect(part[2].type).toBe(HelperPartType.NAME)
        expect(part[3].type).toBe(HelperPartType.BRACKET)
        expect(part[4].type).toBe(HelperPartType.REQ_ARG)
        expect(part[4].isCurrent).toBe(true)
        expect(part[5].type).toBe(HelperPartType.BRACKET)
        expect(partToString(result3.parts)).toBe(expectedStr)
    })
    it('sum(1, average({a}, ))', (): void => {
        const expectedStr = 'sum(值,...)'
        /**
         * sum(1, average({a}, ))
         *  ^
         */
        const txt = new TextStatusBuilder()
            .text(Array.from(text))
            .endOffset(15)
            .build()
        const result = getFuncHelperResponse(txt)
        expect(result).toBeDefined()
        if (result === undefined)
            return
        expect(result.parts.length).toBe(6)
        expect(result.imageIndex).toBe(8)
        const part = result.parts
        expect(part[0].type).toBe(HelperPartType.NAME)
        expect(part[1].type).toBe(HelperPartType.BRACKET)
        expect(part[2].type).toBe(HelperPartType.REQ_ARG)
        expect(part[3].type).toBe(HelperPartType.COMMON)
        expect(part[4].type).toBe(HelperPartType.INFINITE_ARG)
        expect(part[5].type).toBe(HelperPartType.BRACKET)
        expect(partToString(result.parts)).toBe(expectedStr)
        /**
         * sum(1, average({a}, ))
         *     ^
         */
        const txt2 = new TextStatusBuilder()
            .text(Array.from(text))
            .endOffset(18)
            .build()
        const result2 = getFuncHelperResponse(txt2)
        expect(result2).toBeDefined()
        if (result2 === undefined)
            return
        expect(result2.imageIndex).toBe(8)
        expect(result2.parts[2].isCurrent).toBe(true)
        expect(partToString(result2.parts)).toBe(expectedStr)
        /**
         * sum(1, average({a}, ))
         *      ^
         */
        const txt3 = new TextStatusBuilder()
            .text(Array.from(text))
            .endOffset(19)
            .build()
        const result3 = getFuncHelperResponse(txt3)
        expect(result3).toBeDefined()
        if (result3 === undefined)
            return
        expect(result3.parts[4].isCurrent).toBe(true)
        expect(partToString(result3.parts)).toBe('sum(值1,[值])')
        /**
         * sum(1, average({a}, ))
         *                     ^
         */
        const txt4 = new TextStatusBuilder()
            .text(Array.from(text))
            .endOffset(20)
            .build()
        const result4 = getFuncHelperResponse(txt4)
        expect(result4).toBeDefined()
        if (result4 === undefined)
            return
        expect(result4.parts[4].isCurrent).toBe(true)
        expect(partToString(result4.parts)).toBe('sum(值1,[值])')
    })
    it('average({a}, )', (): void => {
        const expectedStr = 'average(值,...)'
        /**
         * average({a}, )
         * ^
         */
        const txt = new TextStatusBuilder()
            .text(Array.from(text))
            .endOffset(21)
            .build()
        const result = getFuncHelperResponse(txt)
        expect(result).toBeDefined()
        if (result === undefined)
            return
        expect(result.parts.length).toBe(6)
        const part = result.parts
        expect(part[0].type).toBe(HelperPartType.NAME)
        expect(part[1].type).toBe(HelperPartType.BRACKET)
        expect(part[2].type).toBe(HelperPartType.REQ_ARG)
        expect(part[3].type).toBe(HelperPartType.COMMON)
        expect(part[4].type).toBe(HelperPartType.INFINITE_ARG)
        expect(part[5].type).toBe(HelperPartType.BRACKET)
        expect(partToString(result.parts)).toBe(expectedStr)
        /**
         * average({a}, )
         *          ^
         */
        const txt2 = new TextStatusBuilder()
            .text(Array.from(text))
            .endOffset(30)
            .build()
        const result2 = getFuncHelperResponse(txt2)
        expect(result2).toBeDefined()
        if (result2 === undefined)
            return
        expect(result2.parts[2].isCurrent).toBe(true)
        expect(partToString(result2.parts)).toBe(expectedStr)
        /**
         * average({a}, )
         *            ^
         */
        const txt3 = new TextStatusBuilder()
            .text(Array.from(text))
            .endOffset(32)
            .build()
        const result3 = getFuncHelperResponse(txt3)
        expect(result3).toBeDefined()
        if (result3 === undefined)
            return
        expect(result3.parts[4].isCurrent).toBe(true)
        expect(partToString(result3.parts)).toBe('average(值1,[值])')
    })
    it('power(1, 2, 3)', (): void => {
        const expectedStr = 'power(基数,指数)'
        /**
         * power(1, 2, 3)
         * ^
         */
        const txt = new TextStatusBuilder()
            .text(Array.from(text))
            .endOffset(39)
            .build()
        const result = getFuncHelperResponse(txt)
        expect(result).toBeDefined()
        if (result === undefined)
            return
        expect(result.parts.length).toBe(6)
        const part = result.parts
        expect(part[0].type).toBe(HelperPartType.NAME)
        expect(part[1].type).toBe(HelperPartType.BRACKET)
        expect(part[2].type).toBe(HelperPartType.REQ_ARG)
        expect(part[3].type).toBe(HelperPartType.COMMON)
        expect(part[4].type).toBe(HelperPartType.REQ_ARG)
        expect(part[5].type).toBe(HelperPartType.BRACKET)
        expect(partToString(result.parts)).toBe(expectedStr)
        /**
         * power(1, 2, 3)
         *         ^
         */
        const txt2 = new TextStatusBuilder()
            .text(Array.from(text))
            .endOffset(47)
            .build()
        const result2 = getFuncHelperResponse(txt2)
        expect(result2).toBeDefined()
        if (result2 === undefined)
            return
        expect(result2.parts[4].isCurrent).toBe(true)
        expect(partToString(result2.parts)).toBe(expectedStr)
        /**
         * power(1, 2, 3)
         *             ^
         */
        const txt3 = new TextStatusBuilder()
            .text(Array.from(text))
            .endOffset(51)
            .build()
        const result3 = getFuncHelperResponse(txt3)
        expect(result3).toBeDefined()
        if (result3 === undefined)
            return
        result3.parts.forEach((s: HelperPart): void => {
            expect(s.isCurrent).toBe(false)
        })
        expect(partToString(result3.parts)).toBe(expectedStr)
    })
})

describe('function name index test', (): void => {
    it('same functions', (): void => {
        /**
         * power(1, 4) + power(2, 4) + power(5, 3)
         *                     ^
         */
        const expr = 'power(1, 4) + power(2, 4) + power(2, 3)'
        const textStatus = new TextStatusBuilder()
            .text(Array.from(expr))
            .endOffset(expr.indexOf('2'))
            .build()
        const result = getFuncHelperResponse(textStatus)
        expect(result).toBeDefined()
        if (result === undefined)
            return
        expect(result.imageIndex).toBe(10)
    })
})

function partToString(part: readonly HelperPart[]): string {
    return part.map((s: HelperPart): string => s.content).join('')
}
