import {add, eq, sub} from '@logi/base/ts/common/date'
import {isDatetimeDelta} from '@logi/base/ts/common/datetime'
import {isException} from '@logi/base/ts/common/exception'
import {CompositeOpBuilder, KeyWord} from '@logi/src/lib/compute/op'
import {DateRange, toDateRange} from '@logi/src/lib/hierarchy/core'
// tslint:disable-next-line:no-wildcard-import
import * as t from 'io-ts'

import {Constant} from '../constant'
import {
    CellCoordinate,
    FormulaInfo,
    FormulaInfoBuilder,
    Head,
    Headless,
    HEADLESS,
    OpAndInNodes,
    SubFormulaInfo,
    SubFormulaInfoBuilder,
    ValidateRule,
    WalkInfo,
} from '../node'

import {Operator as BaseOperator, OperatorType} from './base'
import {TYPE3_REGISTRY} from './registry'
import {getOp, isIncluded, toSubOpInfos} from './utils'
import {getValidateRule} from './validate'

export class Operator extends BaseOperator {
    public static supportedOpNames(): readonly string[] {
        return Operator.__SUPPORTED_OP_NAMES__
    }
    public readonly opType: OperatorType = OperatorType.TYPE3

    protected readonly validateRules: readonly ValidateRule[] = VALIDATE_RULES

    // tslint:disable-next-line: prefer-function-over-method
    protected buildFormulaInfo(
        subFormulas: readonly SubFormulaInfo[],
    ): readonly FormulaInfo[] {
        if (subFormulas.length === 0)
            return []
        const heads = subFormulas.map((c: SubFormulaInfo):
            Head | Headless => c.head)
        const rootOp = getOp('id')
        const result: FormulaInfo[] = []
        heads.forEach((head: Head | Headless, i: number): void => {
            const formula = subFormulas[i]
            const op = new CompositeOpBuilder()
                .rootOp(rootOp)
                .inTypes([t.number])
                .outType(t.number)
                .subOpInfos(toSubOpInfos(formula.opAndInNodes))
                .build()
            const tuples: CellCoordinate[] = []
            formula.opAndInNodes.forEach((n: OpAndInNodes): void => {
                n[1].forEach((tuple: CellCoordinate): void => {
                    if (!isIncluded(tuples, tuple))
                        // tslint:disable: limit-indent-for-method-in-class
                        tuples.push(tuple)
                })
            })
            const formulaInfo = new FormulaInfoBuilder()
                .head(head)
                .op(op)
                .inNodes(tuples)
                .build()
            result.push(formulaInfo)
        })
        return result
    }

    /**
     * Type3 node has 2 children. The first child is a constant which should
     * be ignored in this procedure. The second child is a reference.
     */
    protected collectFormulaInfo(
        walkInfo: WalkInfo,
    ): readonly SubFormulaInfo[] {
        const child = this.children[1]
        const subInfos = walkInfo.get(child)
        if (subInfos === undefined)
            return []
        const subHeads = subInfos.map(
            (formulaInfo: FormulaInfo): Head | Headless => formulaInfo.head,
        )
        const offsetList = this._getOffsetList(subHeads)
        const result: SubFormulaInfo[] = []
        offsetList.forEach((offset: number | undefined, i: number): void => {
            if (offset === undefined)
                return
            const index = i + offset
            const subInfo = subInfos[index]

            if (subInfo === undefined)
                return
            const currInfo = subInfos[i]
            const op = currInfo.op
            const inNodes = currInfo.inNodes
            const subFormulaInfo = new SubFormulaInfoBuilder()
                .head(subInfo.head)
                .opAndInNodes([[op, inNodes]])
                .build()
            result.push(subFormulaInfo)
        })
        return result
    }
    private static __SUPPORTED_OP_NAMES__: readonly string[] = ['.lag', '.lead']

    /**
     * Get offset of each head after shift(lag or lead).
     */
    // tslint:disable-next-line: max-func-body-length
    private _getOffsetList(
        heads: readonly (Head | Headless)[],
    ): readonly (number | undefined)[] {
        const constant = this.children[0]
        if (!(constant instanceof Constant))
            return []
        const result: (number | undefined)[] = []
        const image = this.image.slice(1).toLowerCase()
        if (typeof constant.value === 'number') {
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < heads.length; i += 1)
                if (image === 'lag')
                    result.push(constant.value)
                else
                    result.push(-constant.value)
            return result
        }
        if (constant.value === KeyWord.NULL) {
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < heads.length; i += 1)
                result.push(0)
            return result
        }
        if (!isDatetimeDelta(constant.value))
            return result
        const dateRanges = heads.map((
            h: Head | Headless,
        ): DateRange | undefined => {
            if (h === HEADLESS)
                return
            const res = toDateRange(h)
            return isException(res) ? undefined : res
        })
        const timeDelta = constant.value
        heads.forEach((head: Head | Headless, i: number): void => {
            if (head === HEADLESS) {
                result.push(undefined)
                return
            }
            const headTime = dateRanges[i]
            if (headTime === undefined) {
                result.push(undefined)
                return
            }
            const targetStartTime = image === 'lead'
                ? sub(headTime.start, timeDelta)
                : add(headTime.start, timeDelta)
            const targetEndTime = image === 'lead'
                ? sub(headTime.end, timeDelta)
                : add(headTime.end, timeDelta)
            const targetHeads = heads.filter((
                // tslint:disable-next-line: ext-variable-name naming-convention
                _: Head | Headless,
                idx: number,
            ): boolean => {
                const dateRange = dateRanges[idx]
                if (dateRange === undefined)
                    return false
                return eq(dateRange.end, targetEndTime) &&
                    eq(dateRange.start, targetStartTime)
            })
            let index: number
            if (targetHeads.length === 0)
                index = -1
            else if (targetHeads.length === 1)
                index = heads.indexOf(targetHeads[0])
            // tslint:disable-next-line: brace-style
            else {
                const sameNameHeads = targetHeads
                    .filter((value: Head | Headless): boolean => {
                        if (value === HEADLESS)
                            return false
                        return value.name === head.name
                    })
                index = sameNameHeads.length === 1 ?
                    heads.indexOf(sameNameHeads[0]) :
                    heads.indexOf(targetHeads[0])
            }
            if (index < 0) {
                result.push(undefined)
                return
            }
            result.push(index - i)
        })
        return result
    }
}

const VALIDATE_RULES = TYPE3_REGISTRY.map(getValidateRule)
