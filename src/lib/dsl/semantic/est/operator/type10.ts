import {isException} from '@logi/base/ts/common/exception'
import {CompositeOpBuilder} from '@logi/src/lib/compute/op'
import {
    applyColumnFilter,
    applyRowFilter,
} from '@logi/src/lib/dsl/semantic/filter'
import {isRow, isTable} from '@logi/src/lib/hierarchy/core'
// tslint:disable-next-line: no-wildcard-import
import * as t from 'io-ts'

import {
    CellCoordinate,
    FormulaInfo,
    FormulaInfoBuilder,
    HEADLESS,
    OpAndInNodes,
    SubFormulaInfo,
    SubFormulaInfoBuilder,
    ValidateRule,
    WalkInfo,
} from '../node'
import {Reference} from '../reference'

import {Operator as BaseOperator, OperatorType} from './base'
import {getOp, isIncluded, toSubOpInfos} from './utils'

export class Operator extends BaseOperator {
    public readonly opType = OperatorType.TYPE10
    protected readonly validateRules: readonly ValidateRule[] = []

    // tslint:disable-next-line: prefer-function-over-method
    protected buildFormulaInfo(
        subFormulaInfos: readonly SubFormulaInfo[],
    ): readonly FormulaInfo[] {
        return subFormulaInfos.map((
            subFormulaInfo: SubFormulaInfo,
        ): FormulaInfo => {
            const rootOp = getOp('array')
            const op = new CompositeOpBuilder()
                .rootOp(rootOp)
                .inTypes([t.number])
                .outType(t.number)
                .subOpInfos(toSubOpInfos(subFormulaInfo.opAndInNodes))
                .build()
            const tuples: CellCoordinate[] = []
            subFormulaInfo.opAndInNodes.forEach((oai: OpAndInNodes): void => {
                oai[1].forEach((inNodes: CellCoordinate): void => {
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

    protected collectFormulaInfo(
        walkInfo: WalkInfo,
    ): readonly SubFormulaInfo[] {
        const ref = this.children[0]
        if (!(ref instanceof Reference))
            return []
        const node = ref.hierarchyNode
        if (node === undefined)
            return []
        const subs = walkInfo.get(ref)
        if (subs === undefined)
            return []
        const label = this.image.slice(1, this.image.length - 1)
        const result: SubFormulaInfo[] = []
        const table = node.getTable()
        if (!isTable(table))
            return []
        const rows = table.getLeafRows()
        const cols = table.getLeafCols()
        subs.forEach((s: FormulaInfo): void => {
            if (s.head === HEADLESS)
                return
            const heads = isRow(node)
                ? applyColumnFilter(cols, label, s.head)
                : applyRowFilter(rows, label)
            if (isException(heads))
                return
            const targets = subs.filter(
                sub => sub.head !== HEADLESS && heads.includes(sub.head),
            )
            const f = new SubFormulaInfoBuilder()
                .head(s.head)
                .opAndInNodes(targets
                    .map(target => [target.op, target.inNodes]))
                .build()
            result.push(f)
        })
        return result
    }
}
