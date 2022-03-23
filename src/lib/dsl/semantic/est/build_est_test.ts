import {isToken, lex, lexSuccess} from '@logi/src/lib/dsl/lexer/v2'
import {
    assertIsEst,
    Constant,
    Operator,
    OperatorType,
    Type,
} from '@logi/src/lib/dsl/semantic/est'

import {buildEst, toPath} from './build_est'

// tslint:disable-next-line: max-func-body-length
describe('build est', (): void => {
    it('leaf est', (): void => {
        const ref = '{a[[b]]}'
        const toks = lex(ref)
        expect(lexSuccess(toks)).toBe(true)
        if (!lexSuccess(toks))
            return
        const est = buildEst(toks)
        assertIsEst(est)
        expect(est.type).toBe(Type.REFERENCE)
    })
    it('slice', (): void => {
        const expr = '{a}[slice]'
        const toks = lex(expr)
        expect(lexSuccess(toks)).toBe(true)
        if (!lexSuccess(toks))
            return
        const est = buildEst(toks)
        assertIsEst(est)
        expect(est.type).toBe(Type.OPERATOR)
        const opNode = est as Operator
        expect(opNode.opType).toBe(OperatorType.TYPE6)
    })
    it('function', (): void => {
        const expr = 'sum({row1}, {row2})'
        const toks = lex(expr)
        expect(lexSuccess(toks)).toBe(true)
        if (!lexSuccess(toks))
            return
        const est = buildEst(toks)
        assertIsEst(est)
        expect(est.type).toBe(Type.OPERATOR)
    })
    it('method', (): void => {
        const expr = '{a}.lag(1)'
        const toks = lex(expr)
        expect(lexSuccess(toks)).toBe(true)
        if (!lexSuccess(toks))
            return
        const est = buildEst(toks)
        assertIsEst(est)
        expect(est.type).toBe(Type.OPERATOR)
        const opNode = est as Operator
        const child0 = opNode.children[0]
        expect(child0.type).toBe(Type.CONSTANT)
        expect((child0 as Constant).value).toBe(1)
    })
    it('op', (): void => {
        const expr = '{a} + 2 * 3'
        const toks = lex(expr)
        expect(lexSuccess(toks)).toBe(true)
        if (!lexSuccess(toks))
            return
        const est = buildEst(toks)
        assertIsEst(est)
        expect(est.type).toBe(Type.OPERATOR)
        const opNode = est as Operator
        expect(opNode.image).toBe('+')
    })
    it('ref range', (): void => {
        const expr = 'average({row1}::{row10})'
        const toks = lex(expr)
        expect(lexSuccess(toks)).toBe(true)
        if (!lexSuccess(toks))
            return
        const est = buildEst(toks)
        assertIsEst(est)
        expect(est.type).toBe(Type.OPERATOR)
        const opNode = est as Operator
        expect(opNode.image).toBe('average')
        const child = opNode.children[0]
        expect(child.type).toBe(Type.OPERATOR)
        const childOp = child as Operator
        expect(childOp.image).toBe('::')
    })
    it('nested', (): void => {
        const expr = 'sum(1, 2, {abc}.average()).lag(1y)'
        const toks = lex(expr)
        expect(lexSuccess(toks)).toBe(true)
        if (!lexSuccess(toks))
            return
        const est = buildEst(toks)
        assertIsEst(est)
        expect(est.type).toBe(Type.OPERATOR)
        const opNode = est as Operator
        expect(opNode.image).toBe('.lag')
        // tslint:disable-next-line: no-magic-numbers
        expect(opNode.children.length).toBe(2)
    })
    it('slice + op', (): void => {
        const expr = '({row1} + {row2})[hist]'
        const toks = lex(expr)
        expect(lexSuccess(toks)).toBe(true)
        if (!lexSuccess(toks))
            return
        const est = buildEst(toks)
        assertIsEst(est)
        expect(est.type).toBe(Type.OPERATOR)
        const opNode = est as Operator
        expect(opNode.opType).toBe(OperatorType.TYPE6)
        expect(opNode.children.length).toBe(1)
        expect(opNode.children[0].type).toBe(Type.OPERATOR)
    })
    it('unary op', (): void => {
        const expr = '-{abc} + {def}'
        const toks = lex(expr)
        expect(lexSuccess(toks)).toBe(true)
        if (!lexSuccess(toks))
            return
        const est = buildEst(toks)
        assertIsEst(est)
        expect(est.type).toBe(Type.OPERATOR)
        const opNode = est as Operator
        expect(opNode.image).toBe('+')
    })
    it('{a} / {b} - 1', (): void => {
        const expr = '{a} / {b} - 1'
        const toks = lex(expr)
        expect(lexSuccess(toks)).toBe(true)
        if (!lexSuccess(toks))
            return
        const est = buildEst(toks)
        assertIsEst(est)
        expect(est.type).toBe(Type.OPERATOR)
    })
})

describe('to path test', (): void => {
    it('one label', (): void => {
        const ref = '{a[[b]]}'
        const toks = lex(ref)
        expect(toks.length).toBe(1)
        const refToken = toks[0]
        expect(isToken(refToken)).toBe(true)
        if (!isToken(refToken))
            return
        const path = toPath(refToken)
        const part = path.parts[0]
        expect(part.labels.length).toBe(1)
        expect(part.labels[0]).toBe('b')
        expect(part.name).toBe('a')
    })
    it('labels', (): void => {
        const ref = '{name[[b, c, d]]}'
        const toks = lex(ref)
        expect(toks.length).toBe(1)
        const refToken = toks[0]
        expect(isToken(refToken)).toBe(true)
        if (!isToken(refToken))
            return
        const path = toPath(refToken)
        const part = path.parts[0]
        // tslint:disable-next-line: no-magic-numbers
        expect(part.labels.length).toBe(3)
        expect(part.labels).toEqual(['b', 'c', 'd'])
    })
})
