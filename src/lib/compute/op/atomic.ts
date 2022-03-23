import {option} from 'fp-ts'
// tslint:disable-next-line: no-wildcard-import
import * as t from 'io-ts'
import {sprintf} from 'sprintf-js'

import {Builder} from './base'
import {Op, OpType} from './node'

interface AtomicOp extends Op {
    readonly excelFormulaFormat: string
    readonly functor: Functor
}

export class AtomicOpBuilder extends Builder<AtomicOp, AtomicOpImpl> {
    public constructor(obj?: Readonly<AtomicOp>) {
        const impl = new AtomicOpImpl()
        if (obj)
            AtomicOpBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    protected get daa(): readonly string[] {
        return [...Builder.__DAA_PROPS__,
            'functor', 'excelFormulaFormat', 'name']
    }

    //
    // Properties that AtomicOp adds on top of Op.
    //
    public functor(functor: Functor): this {
        this.getImpl().functor = functor

        return this
    }

    public excelFormulaFormat(formatString: string): this {
        this._getImpl().excelFormulaFormat = formatString

        return this
    }
}

// tslint:disable-next-line: unknown-instead-of-any
type Functor = (...args: readonly any[]) => any

/**
 * Safe to use definite assignment assertions because the builder class,
 * AtomicOpBuilder mandatorily verifies them.
 */
class AtomicOpImpl implements AtomicOp {
    public get optype(): OpType {
        return AtomicOpImpl.__OPTYPE__
    }

    public name!: string
    public inTypes!: readonly t.Mixed[]
    public outType!: t.Mixed

    public functor!: Functor

    /**
     * The format used in sprintf is explained here:
     *      https://github.com/alexei/sprintf.js
     */
    public excelFormulaFormat!: string
    public evaluate(...args: readonly unknown[]): unknown {
        if (args.includes(option.none))
            return option.none

        return this.functor(...args)
    }

    // tslint:disable-next-line: unknown-instead-of-any
    public excelFormula(...inputs: readonly any[]): string {
        /**
         * Safe to use type assertion below, it will be verified in
         * `AtomicOpBuilder.postVerifyHook()` when build this impl.
         */
        if (VARIADIC_FORMULA.includes(this.name))
            return this._getVariadicFormula([...inputs])
        if (RANGE_FORMULA.includes(this.name))
            return this._getRangeFormula([...inputs])
        if (CONDITION_FORMULA.includes(this.name))
            return this._getConditionFormula([...inputs])

        return sprintf(this.excelFormulaFormat, ...inputs)
    }
    private static readonly __OPTYPE__: OpType = OpType.ATOMIC
    private _getVariadicFormula(inputs: readonly string[]): string {
        const formulaFormat = this.excelFormulaFormat
        return sprintf(formulaFormat, [...inputs])
    }

    private _getRangeFormula(inputs: readonly string[]): string {
        const formulaFormat = this.excelFormulaFormat
        if (this.name === 'npv') {
            const rate = inputs[0] === undefined ? '1' : inputs[0]
            const range = a1NotationToRange(inputs.slice(1, inputs.length))
            return sprintf(formulaFormat, rate, range)
        }
        if (this.name === 'xirr') {
            // tslint:disable-next-line: no-magic-numbers
            const hasOpt = inputs.length % 2 === 1
            const rangeLen = hasOpt ?
                // tslint:disable-next-line: no-magic-numbers
                (inputs.length - 1) / 2 : inputs.length / 2
            const range1 = a1NotationToRange(inputs.slice(0, rangeLen))
            const range2 = a1NotationToRange(inputs
                .slice(rangeLen, hasOpt ? inputs.length - 1 : inputs.length),)
            if (hasOpt) {
                const last = inputs[inputs.length - 1]
                return sprintf(formulaFormat, range1, range2, last)
            }
            // The default value for the guess in `xirr`.
            // https://support.microsoft.com/zh-tw/office/xirr-%e5%87%bd%e6%95%b8-de1242ec-6477-445b-b11b-a303ad9adc9d
            const guess = 0.1
            return sprintf(formulaFormat, range1, range2, guess)
        }
        if (this.name === 'xnpv') {
            // tslint:disable-next-line: no-magic-numbers
            const rangeLen = (inputs.length - 1) / 2
            const range1 = a1NotationToRange(inputs.slice(1, rangeLen + 1))
            const range2 = a1NotationToRange(inputs
                .slice(rangeLen + 1, inputs.length + 1),)
            return sprintf(formulaFormat, inputs[0], range1, range2)
        }
        return sprintf(formulaFormat, a1NotationToRange([...inputs]))
    }

    private _getConditionFormula(inputs: readonly string[]): string {
        const formulaFormat = this.excelFormulaFormat
        return sprintf(
            formulaFormat,
            a1NotationToRange([...inputs.slice(0, inputs.length - 1)]),
            inputs[inputs.length - 1],
        )
    }
}

const RANGE_FORMULA: readonly string[] = [
    'irr',
    'npv',
    'xirr',
    'xnpv',
]

const CONDITION_FORMULA: readonly string[] = [
    'sumif',
    'averageif',
    'countif',
]

const VARIADIC_FORMULA: readonly string[] = [
    'average',
    'count',
    'max',
    'min',
    'sum',
    'switch',
    'array',
    'and',
    'or',
]

/**
 * Export this function only for test.
 *
 * Convert a1Notation to excel range.
 *
 * For example,
 *      ['C1', 'A1', 'D1', 'B1'] => 'A1:D1'
 *      ['A3', 'A1', 'A4', 'A2'] => 'A1:A4'
 *      ['A1', 'D2', 'C1', 'B1'] => 'A1:D2'
 */
// tslint:disable-next-line: readonly-array
export function a1NotationToRange(a1Notations: string[]): string {
    const sorted = a1Notations.sort()
    return `${sorted[0]}:${sorted[a1Notations.length - 1]}`
}
