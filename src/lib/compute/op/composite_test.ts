// tslint:disable:max-func-body-length
// tslint:disable: no-backbone-get-set-outside-model
// tslint:disable:no-magic-numbers
// tslint:disable:mocha-no-side-effect-code
import {lexSuccess, lex} from '@logi/src/lib/dsl/lexer/v2'
import {assertIsEst, buildEst} from '@logi/src/lib/dsl/semantic'
// tslint:disable-next-line: no-wildcard-import
import * as t from 'io-ts'

import {AtomicOpBuilder} from './atomic'
import {CompositeOpBuilder, SubOpInfo} from './composite'
import {ConstantOpBuilder} from './constant'
import {Op} from './node'
import {OP_REGISTRY} from './registry'

describe('Composite op test', (): void => {
    it('Name test', (): void => {
        const add = OP_REGISTRY.get('add') as Op
        const c1 = new CompositeOpBuilder()
            .inTypes([t.number, t.number, t.number])
            .outType(t.number)
            .rootOp(add)
            .subOpInfos([1])
            .build()
        expect(c1.name).toBe('COMPOSITE')
        const c2 = new CompositeOpBuilder()
            .inTypes([t.number, t.number, t.number])
            .outType(t.number)
            .rootOp(add)
            .subOpInfos([1])
            .build()
        expect(c2.name).toBe('COMPOSITE')
    })
    // tslint:disable-next-line:no-suspicious-comment
    // TODO (zhongming): Use jinja2 template (create a new Bazel rule for it) to
    // generate the highly repetitive code below.
    it('f(add(x,y), y^2, 2*x, z), f=(a*b+c*d)', (): void => {
        const root = new AtomicOpBuilder()
            .name('id')
            // tslint:disable-next-line: max-params
            .functor((a: number, b: number, c: number, d: number):
               number => a * b + c * d)
            .inTypes([t.number, t.number, t.number, t.number])
            .outType(t.number)
            .excelFormulaFormat('(%s*%s+%s*%s)')
            .build()
        const arg1 = OP_REGISTRY.get('add') as Op
        const arg2 = new AtomicOpBuilder()
            .name('id')
            .functor((a: number): number => a * a)
            .inTypes([t.number])
            .outType(t.number)
            .excelFormulaFormat('(%s^2)')
            .build()
        const arg3 = new AtomicOpBuilder()
            .name('id')
            .functor((a: number): number => a * 2)
            .inTypes([t.number])
            .outType(t.number)
            .excelFormulaFormat('(%s*2)')
            .build()
        const subOpInfos: SubOpInfo[] =
            [[arg1, [0, 1]], [arg2, [1]], [arg3, [0]], 2]

        const composite = new CompositeOpBuilder()
            .name('mycomposite')
            .inTypes([t.number, t.number, t.number])
            .outType(t.number)
            .rootOp(root)
            .subOpInfos(subOpInfos)
            .build()
        expect(composite.evaluate(1, 2, 3)).toBe(18)
        expect(composite.excelFormula(1, 2, 3)).toBe('(1+2*(2^2)+(1*2)*3)')
    })
    it('Composite op in composite op', (): void => {
        const op1 = OP_REGISTRY.get('mul') as Op
        const op2 = new CompositeOpBuilder()
            .name('op2')
            .inTypes([t.number, t.number])
            .outType(t.number)
            .rootOp(OP_REGISTRY.get('add') as Op)
            .subOpInfos([[op1, [0, 1]], 2])
            .build()
        const op3 = new CompositeOpBuilder()
            .name('op3')
            .inTypes([t.number, t.number])
            .outType(t.number)
            .rootOp(OP_REGISTRY.get('sub') as Op)
            .subOpInfos([[op2, [0, 1, 2]], 3])
            .build()
        expect(op3.evaluate(1, 2, 3, 4)).toBe(1)
    })
    it('Composite op with constant op', (): void => {
        const op1 = OP_REGISTRY.get('add') as Op
        const op2 = new ConstantOpBuilder()
            .name('const')
            .inTypes([t.number])
            .outType(t.number)
            .value(3)
            .build()
        const op3 = new CompositeOpBuilder()
            .name('op3')
            .inTypes([t.number, t.number])
            .outType(t.number)
            .rootOp(OP_REGISTRY.get('sub') as Op)
            .subOpInfos([[op1, [0, 1]], [op2, []]])
            .build()
        expect(op3.evaluate(1, 2)).toBe(0)
    })
    it('Build without subOpInfo, expect to throw error', (): void => {
        const builder = new CompositeOpBuilder()
            .name('mycomposite')
            .inTypes([t.number, t.number, t.number])
            .outType(t.number)
            .rootOp(OP_REGISTRY.get('add') as Op)
        expect((): unknown => builder.build()).toThrow()
    })
    it('Build without rootOp, expect to throw error', (): void => {
        const builder = new CompositeOpBuilder()
            .name('mycomposite')
            .inTypes([t.number, t.number, t.number])
            .outType(t.number)
            .subOpInfos([1])
        expect((): unknown => builder.build()).toThrow()
    })
})

const DATA: readonly (readonly [string, string])[] = [
    // Inner lower precedence.
    ['((1+2)*4)' , '(1+2)*4'],
    ['1*(2+3)*4' , '1*(2+3)*4'],
    // Inner bigger precedence.
    ['(1)', '1'],
    ['(1+2)' , '1+2'],
    ['1+(2*3)+4' , '1+2*3+4'],
    // Left associativity.
    ['1-(2+3)' , '1-(2+3)'],
    ['(2+3)-1' , '2+3-1'],
    ['1+(-1+1)' , '1+(-1+1)'],
    ['(2+3*4)-1' , '2+3*4-1'],
    ['1/(2*3)' , '1/(2*3)'],
    ['(2*3)/1' , '2*3/1'],
    // Right associativity.
    // ['(2^3)^3' , '(2^3)^3'],
    // Complex.
    // ['2^(3^3)' , '2^3^3'],
    ['-(1)' , '-1'],
    ['1*(-1)' , '1*-1'],
    ['1+(-1)' , '1+-1'],
    ['1*(-1+1)' , '1*(-1+1)'],
    ['2-(-(1))' , '2--1'],
]
describe('test bracket', (): void => {
    DATA.forEach((d: readonly [string, string]): void => {
        it(`Test ${d[0]}`, (): void => {
            const expr = d[0]
            const toks = lex(expr)
            expect(lexSuccess(toks)).toBe(true)
            if (!lexSuccess(toks))
                return
            const est = buildEst(toks)
            assertIsEst(est)
            const op = est.getFormulaInfo()[0].op
            expect(op?.excelFormula()).toBe(d[1])
        })
    })
})
