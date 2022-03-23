// tslint:disable: no-magic-numbers
import {isException} from '@logi/base/ts/common/exception'

import {lex} from './lex'
import {FilterType, isConstant, isLogicalOp, LogicalOpType} from './op'
import {parse} from './parse'
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

// tslint:disable-next-line: max-func-body-length
describe('parse test', (): void => {
    it('no logic op', (): void => {
        const expr = 'hist'
        const toks = lex(expr)
        const slicer = parse(toks)
        expect(isException(slicer)).toBe(false)
        if (isException(slicer))
            return
        expect(slicer.type).toBe(FilterType.CONSTANT)
        expect(isConstant(slicer)).toBe(true)
        if (!isConstant(slicer))
            return
        expect(slicer.value).toBe('hist')
    })
    it('one logic op', (): void => {
        const expr1 = 'hist and proj'
        const toks1 = lex(expr1)
        const slicer1 = parse(toks1)
        expect(isException(slicer1)).toBe(false)
        if (isException(slicer1))
            return
        expect(slicer1.type).toBe(FilterType.LOGICAL_OP)
        expect(isLogicalOp(slicer1)).toBe(true)
        if (!isLogicalOp(slicer1))
            return
        expect(slicer1.opType).toBe(LogicalOpType.AND)
        expect(slicer1.children.length).toBe(2)
        const child1 = slicer1.children[0]
        expect(isConstant(child1)).toBe(true)
        if (!isConstant(child1))
            return
        expect(child1.value).toBe('hist')
        const child2 = slicer1.children[1]
        expect(isConstant(child2)).toBe(true)
        if (!isConstant(child2))
            return
        expect(child2.value).toBe('proj')
        const expr2 = 'NOT hist'
        const toks2 = lex(expr2)
        const slicer2 = parse(toks2)
        expect(isException(slicer2)).toBe(false)
        if (isException(slicer2))
            return
        expect(isLogicalOp(slicer2)).toBe(true)
        if (!isLogicalOp(slicer2))
            return
        expect(slicer2.opType).toBe(LogicalOpType.NOT)
        expect(slicer2.children.length).toBe(1)
    })
    it('multi op', (): void => {
        const expr = 'NOT qr AND hist'
        const toks = lex(expr)
        const slicer = parse(toks)
        expect(isLogicalOp(slicer)).toBe(true)
        if (!isLogicalOp(slicer))
            return
        expect(slicer.opType).toBe(LogicalOpType.AND)
        expect(slicer.children.length).toBe(2)
        const child1 = slicer.children[0]
        expect(isLogicalOp(child1)).toBe(true)
        if (!isLogicalOp(child1))
            return
        expect(child1.opType).toBe(LogicalOpType.NOT)
    })
    it('bracket', (): void => {
        const expr = 'NOT (qr AND hist)'
        const toks = lex(expr)
        const slicer = parse(toks)
        expect(isLogicalOp(slicer)).toBe(true)
        if (!isLogicalOp(slicer))
            return
        expect(slicer.opType).toBe(LogicalOpType.NOT)
        expect(slicer.children.length).toBe(1)
        const child1 = slicer.children[0]
        expect(isLogicalOp(child1)).toBe(true)
        if (!isLogicalOp(child1))
            return
        expect(child1.opType).toBe(LogicalOpType.AND)
        expect(child1.children.length).toBe(2)
    })
})
