import {isException} from '@logi/base/ts/common/exception'
import {CompositeOpBuilder} from '@logi/src/lib/compute/op'
import {
    applyColumnFilter,
    applyRowFilter,
} from '@logi/src/lib/dsl/semantic/filter'
import {assertIsTable, isRow} from '@logi/src/lib/hierarchy/core'
// tslint:disable-next-line: no-wildcard-import
import * as t from 'io-ts'

import {
    CellCoordinate,
    FormulaInfo,
    FormulaInfoBuilder,
    OpAndInNodes,
    SubFormulaInfo,
    SubFormulaInfoBuilder,
    ValidateRule,
    WalkInfo,
} from '../node'
import {Reference} from '../reference'

import {Operator as BaseOperator, OperatorType} from './base'
import {TYPE9_REGISTRY} from './registry'
import {getOp, isIncluded, toSubOpInfos} from './utils'
import {getValidateRule} from './validate'

/**
 * Type for {ref}[slice1::slice2], `::` is a `to` op.
 */
export class Operator extends BaseOperator {
    public readonly opType = OperatorType.TYPE9
    protected readonly validateRules: readonly ValidateRule[] = VALIDATE_RULES

    // tslint:disable-next-line: prefer-function-over-method
    protected buildFormulaInfo(
        subFormulaInfos: readonly SubFormulaInfo[],
    ): readonly FormulaInfo[] {
        return subFormulaInfos.map((
            subFormulaInfo: SubFormulaInfo,
        ): FormulaInfo => {
            const rootOp = getOp('to')
            const op = new CompositeOpBuilder()
                .rootOp(rootOp)
                .inTypes([t.number])
                .outType(t.number)
                .subOpInfos(toSubOpInfos(subFormulaInfo.opAndInNodes))
                .build()
            const tuples: CellCoordinate[] = []
            subFormulaInfo.opAndInNodes.forEach((sub: OpAndInNodes): void => {
                sub[1].forEach((inNodes: CellCoordinate): void => {
                    if (!isIncluded(tuples, inNodes))
                // tslint:disable-next-line: limit-indent-for-method-in-class
                        tuples.push(inNodes)
                })
            })
            return new FormulaInfoBuilder()
                .head(subFormulaInfo.head)
                .op(op)
                .inNodes(tuples)
                .build()
        })
    }

    // tslint:disable-next-line: max-func-body-length
    protected collectFormulaInfo(
        walkInfo: WalkInfo,
    ): readonly SubFormulaInfo[] {
        const ref = this.children[0]
        if (!(ref instanceof Reference))
            return []
        const node = ref.hierarchyNode
        if (node === undefined)
            return []
        const label = this.image.slice(1, this.image.length - 1)
        const range = label.split('::')
        // tslint:disable-next-line: no-magic-numbers
        if (range.length !== 2)
            return []
        const startLabel = range[0]
        const endLabel = range[1]
        const table = node.getTable()
        assertIsTable(table)
        const cols = table.getLeafCols()
        const rows = table.getLeafRows()
        const startHeader = isRow(node)
            ? applyColumnFilter(cols, startLabel)
            : applyRowFilter(rows, endLabel)
        if (isException(startHeader))
            return []
        const endHeader = isRow(node)
            ? applyColumnFilter(cols, endLabel)
            : applyRowFilter(rows, endLabel)
        if (isException(endHeader))
            return []
        if ((startLabel !== 'this' && startHeader.length !== 1) ||
            (endLabel !== 'this' && endHeader.length !== 1))
            return []
        const startIdx = cols.indexOf(startHeader[0])
        const endIdx = cols.indexOf(endHeader[0])
        const subFormulaInfos = walkInfo.get(this.children[0])
        if (subFormulaInfos === undefined)
            return []
        return subFormulaInfos.map((
            sub: FormulaInfo,
            idx: number,
        ): SubFormulaInfo => {
            const start = startLabel === 'this'
                ? subFormulaInfos[idx]
                : subFormulaInfos[startIdx]
            const end = endLabel === 'this'
                ? subFormulaInfos[idx]
                : subFormulaInfos[endIdx]
            return new SubFormulaInfoBuilder()
                .head(sub.head)
                .opAndInNodes(
                    [[start.op, start.inNodes], [end.op, end.inNodes]],
                )
                .build()
        })
    }
}

const VALIDATE_RULES = TYPE9_REGISTRY.map(getValidateRule)
