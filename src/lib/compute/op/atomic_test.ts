// tslint:disable:no-backbone-get-set-outside-model
// tslint:disable:no-magic-numbers
// tslint:disable-next-line: no-wildcard-import
import * as t from 'io-ts'

import {a1NotationToRange, AtomicOpBuilder} from './atomic'
import {Op} from './node'
import {OP_REGISTRY} from './registry'

// tslint:disable-next-line:max-func-body-length
describe('Atomic op test', (): void => {
    it('Name test', (): void => {
        const c1 = new AtomicOpBuilder()
            .functor((a: number, b: number, c: number): number =>
                 a + b * c)
            .inTypes([t.number, t.number, t.number])
            .outType(t.number)
            .excelFormulaFormat('(%s+%s*%s)')
            .build()
        expect(c1.name).toBe('ATOMIC')
        const c2 = new AtomicOpBuilder()
            .functor((a: number, b: number, c: number): number =>
                 a + b * c)
            .inTypes([t.number, t.number, t.number])
            .outType(t.number)
            .excelFormulaFormat('(%s+%s*%s)')
            .build()
        expect(c2.name).toBe('ATOMIC')
    })
    it('From registry test', (): void => {
        const op = OP_REGISTRY.get('add')
        expect(op).toBeDefined()
        const add = op as Op
        expect(add.evaluate(1, 2)).toBe(3)
        expect(add.excelFormula(1, 2)).toBe('1+2')
    })
    it('Build test', (): void => {
        const op = new AtomicOpBuilder()
            .name('myop')
            .functor((a: number, b: number, c: number): number =>
                 a + b * c)
            .inTypes([t.number, t.number, t.number])
            .outType(t.number)
            .excelFormulaFormat('(%s+%s*%s)')
            .build()
        expect(op.evaluate(1, 2, 3)).toBe(7)
        expect(op.excelFormula(1, 2, 3)).toBe('(1+2*3)')
    })
    it('Build without functor, expect to throw error', (): void => {
        const builder = new AtomicOpBuilder()
            .name('myop')
            .inTypes([t.number, t.number, t.number])
            .outType(t.number)
            .excelFormulaFormat('(%s+%s*%s)')
        expect((): Readonly<Op> => builder.build()).toThrow()
    })
    it('Build without excelFormulaFormat, expect to throw error', (): void => {
        const builder = new AtomicOpBuilder()
            .name('myop')
            .functor((a: number, b: number, c: number): number => a + b * c)
            .inTypes([t.number, t.number, t.number])
            .outType(t.number)
        expect((): Readonly<Op> => builder.build()).toThrow()
    })
    it('Build without inTypes, expect to throw error', (): void => {
        const builder = new AtomicOpBuilder()
            .name('myop')
            .functor((a: number, b: number, c: number): number => a + b * c)
            .outType(t.number)
            .excelFormulaFormat('(%s+%s*%s)')
        expect((): Readonly<Op> => builder.build()).toThrow()
    })
    it('Build without outType, expect to throw error', (): void => {
        const builder = new AtomicOpBuilder()
            .name('myop')
            .functor((a: number, b: number, c: number): number => a + b * c)
            .inTypes([t.number, t.number, t.number])
            .excelFormulaFormat('(%s+%s*%s)')
        expect((): Readonly<Op> => builder.build()).toThrow()
    })
    it('sum and average test', (): void => {
        const data = [1, 2, 3]
        const sum = OP_REGISTRY.get('sum')
        expect(sum).toBeDefined()
        expect((sum as Op).evaluate(...data)).toEqual(6)
    })
    it('average test', (): void => {
        const op = OP_REGISTRY.get('average')
        expect(op).toBeDefined()
        const average = op as Op
        expect(average.evaluate(...[1, 2, 3])).toEqual(2)
        expect(average.evaluate(...[1, 2])).toEqual(1.5)
        expect(average.evaluate(...[1])).toEqual(1)
    })
    it('max test', (): void => {
        const op = OP_REGISTRY.get('max')
        expect(op).toBeDefined()
        const maxOp = op as Op
        expect(maxOp.evaluate(1, 2, 3)).toEqual(3)
        expect(maxOp.excelFormula(1, 2, 3)).toEqual('max(1,2,3)')
        expect(maxOp.evaluate(1, 2)).toEqual(2)
        expect(maxOp.excelFormula(1, 2)).toEqual('max(1,2)')
        expect(maxOp.evaluate(1)).toEqual(1)
        expect(maxOp.excelFormula(1)).toEqual('max(1)')
    })
    it('min test', (): void => {
        const op = OP_REGISTRY.get('min')
        expect(op).toBeDefined()
        const minOp = op as Op
        expect(minOp.evaluate(1, 2, 3)).toEqual(1)
        expect(minOp.excelFormula(1, 2, 3)).toEqual('min(1,2,3)')
        expect(minOp.evaluate(1, 2)).toEqual(1)
        expect(minOp.excelFormula(1, 2)).toEqual('min(1,2)')
        expect(minOp.evaluate(1)).toEqual(1)
        expect(minOp.excelFormula(1)).toEqual('min(1)')
    })
    it('round test', (): void => {
        const op = OP_REGISTRY.get('round')
        expect(op).toBeDefined()
        const roundOp = op as Op
        expect(roundOp.evaluate(112.335, 1)).toEqual(112.3)
        expect(roundOp.excelFormula(112.335, 1)).toEqual('round(112.335,1)')
        expect(roundOp.evaluate(112.335, 2)).toEqual(112.34)
        expect(roundOp.evaluate(112.335, -1)).toEqual(110)
        expect(roundOp.evaluate(112.335, -2)).toEqual(100)
    })
    it('rank test', (): void => {
        const op = OP_REGISTRY.get('rank')
        expect(op).toBeDefined()
        const rankOp = op as Op
        expect(rankOp.evaluate(1, [1, 2, 3], 1)).toEqual(1)
        expect(rankOp.evaluate(1, [1, 2, 3], 0)).toEqual(3)
        expect(rankOp.evaluate(2, [1, 2, 3], 1)).toEqual(2)
        expect(rankOp.evaluate(2, [1, 2, 3], 0)).toEqual(2)
        expect(rankOp.evaluate(3, [1, 2, 3], 1)).toEqual(3)
        expect(rankOp.evaluate(3, [1, 2, 3], 0)).toEqual(1)
        expect(rankOp.excelFormula(3, [1, 2, 3], 0))
            .toEqual('rank(3,(1,2,3),0)')
    })
    it('count test', (): void => {
        const op = OP_REGISTRY.get('count')
        expect(op).toBeDefined()
        const countOp = op as Op
        expect(countOp.evaluate(1, 2, 3)).toEqual(3)
        expect(countOp.evaluate(1, 2)).toEqual(2)
        expect(countOp.evaluate(1, 2, '', [])).toEqual(2)
        expect(countOp.evaluate(1, 2, Date(), '', true)).toEqual(2)
        expect(countOp.excelFormula('A1', 'A2', 'A3'))
            .toEqual('count(A1,A2,A3)')
    })
    it('xirr test', (): void => {
        const op = OP_REGISTRY.get('xirr')
        expect(op).toBeDefined()
        // tslint:disable-next-line: no-type-assertion
        const xirrOp = op as Op
        const addrs = ['(A1)', '(B1)', '(C1)', '(A2)', '(B2)', '(C2)', '(SCALAR)']
        expect(xirrOp.excelFormula(...addrs))
            .toBe('xirr((A1):(C1), (A2):(C2), (SCALAR))')
        const addrs2 = ['(A1)', '(B1)', '(C1)', '(A2)', '(B2)', '(C2)']
        expect(xirrOp.excelFormula(...addrs2))
            .toBe('xirr((A1):(C1), (A2):(C2), 0.1)')
    })
})

describe('test a1Notation to excel range', (): void => {
    it('a1Notation in one row', (): void => {
        const notations = ['C1', 'A1', 'D1', 'B1']
        const range = a1NotationToRange(notations)
        expect(range).toBe('A1:D1')
    })
    it('a1Notation in one col', (): void => {
        const notations = ['A3', 'A1', 'A4', 'A2']
        const range = a1NotationToRange(notations)
        expect(range).toBe('A1:A4')
    })
    it('a1Notation in a matrix', (): void => {
        const notations = ['A1', 'D2', 'C1', 'B1']
        const range = a1NotationToRange(notations)
        expect(range).toBe('A1:D2')
    })
})
