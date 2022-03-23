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
import {TYPE6_REGISTRY} from './registry'
import {getOp, isIncluded, toSubOpInfos} from './utils'
import {getValidateRule} from './validate'

/**
 * Type for {ref}[slice]. [slice] is a op and {ref} is its a child.
 */
export class Operator extends BaseOperator {
    public readonly opType = OperatorType.TYPE6
    protected readonly validateRules: readonly ValidateRule[] = VALIDATE_RULES

    // tslint:disable-next-line: prefer-function-over-method
    protected buildFormulaInfo(
        subFormulaInfos: readonly SubFormulaInfo[],
    ): readonly FormulaInfo[] {
        return subFormulaInfos
            .map((subFormulaInfo: SubFormulaInfo): FormulaInfo => {
                const rootOp = getOp('id')
                const op = new CompositeOpBuilder()
                    .rootOp(rootOp)
                    .inTypes([t.number])
                    .outType(t.number)
                    .subOpInfos(toSubOpInfos(subFormulaInfo.opAndInNodes))
                    .build()
                const tuples: CellCoordinate[] = []
                subFormulaInfo.opAndInNodes
                    .forEach((sub: OpAndInNodes): void => {
                        // tslint:disable: limit-indent-for-method-in-class
                        sub[1].forEach((inNodes: CellCoordinate): void => {
                            if (!isIncluded(tuples, inNodes))
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
        /**
         * Safe to use type assertion below, checked by validator.
         */
        const ref = this.children[0]
        if (!(ref instanceof Reference))
            return []
        const node = ref.hierarchyNode
        if (node === undefined)
            return []
        const label = this.image.slice(1, this.image.length - 1)
        const table = node.getTable()
        if (!isTable(table))
            return []
        const header = isRow(node)
            ? applyColumnFilter(table.getLeafCols(), label)
            : applyRowFilter(table.getLeafRows(), label)
        if (isException(header))
            return []
        const subFormulaInfos = walkInfo.get(this.children[0])
        if (subFormulaInfos === undefined)
            return []
        const infos = subFormulaInfos.filter((info: FormulaInfo): boolean => {
            if (info.head === HEADLESS)
                return false
            return header.includes(info.head)
        })
        if (infos.length === 1)
            return [
                new SubFormulaInfoBuilder()
                    .head(HEADLESS)
                    .opAndInNodes([[infos[0].op, infos[0].inNodes]])
                    .build(),
            ]

        return infos.map((info: FormulaInfo): SubFormulaInfo =>
                new SubFormulaInfoBuilder()
                    .head(info.head)
                    .opAndInNodes([[info.op, info.inNodes]])
                    .build())
    }
}

const VALIDATE_RULES = TYPE6_REGISTRY.map(getValidateRule)
