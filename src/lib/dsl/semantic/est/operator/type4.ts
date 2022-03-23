import {CompositeOpBuilder} from '@logi/src/lib/compute/op'
// tslint:disable-next-line: no-wildcard-import
import * as t from 'io-ts'

import {
    CellCoordinate,
    FormulaInfo,
    FormulaInfoBuilder,
    HEADLESS,
    Node,
    OpAndInNodes,
    SubFormulaInfo,
    SubFormulaInfoBuilder,
    ValidateRule,
    WalkInfo,
} from '../node'

import {Operator as BaseOperator, OperatorType} from './base'
import {TYPE4_REGISTRY} from './registry'
import {getOp, isIncluded, toSubOpInfos} from './utils'
import {getValidateRule} from './validate'

export class Operator extends BaseOperator {
    public static supportedOpNames(): readonly string[] {
        return Operator.__SUPPORTED_OP_NAMES__
    }
    public readonly opType = OperatorType.TYPE4
    protected validateRules: readonly ValidateRule[] = VALIDATE_RULES

    protected buildFormulaInfo(
        subs: readonly SubFormulaInfo[],
    ): readonly FormulaInfo[] {
        if (subs.length === 0)
            return []
        /**
         * As type4 node is Headless and it should has only one SubFormulaInfo.
         * Please check the details in `collectFormulaInfo`.
         */
        const subOps = subs[0]
        const image = this.image.toLowerCase()
        const rootOp = getOp(image)
        const op = new CompositeOpBuilder()
            .rootOp(rootOp)
            .inTypes([t.number])
            .outType(t.number)
            .subOpInfos(toSubOpInfos(subOps.opAndInNodes))
            .build()
        const tuples: CellCoordinate[] = []
        subOps.opAndInNodes.forEach((c: OpAndInNodes): void => {
            c[1].forEach((cell: CellCoordinate): void => {
                if (!isIncluded(tuples, cell))
                    tuples.push(cell)
            })
        })
        return [new FormulaInfoBuilder()
            .head(HEADLESS)
            .op(op)
            .inNodes(tuples)
            .build()]
    }

    /**
     * Type4 node is HEADLESS.
     */
    protected collectFormulaInfo(
        walkInfo: WalkInfo,
    ): readonly SubFormulaInfo[] {
        const result: OpAndInNodes[] = []
        this.children.forEach((child: Readonly<Node>): void => {
            const subInfo = walkInfo.get(child)
            subInfo?.forEach((c: FormulaInfo): void => {
                result.push([c.op, c.inNodes])
            })
        })
        if (result.length === 0)
            return []
        return [new SubFormulaInfoBuilder()
            .head(HEADLESS)
            .opAndInNodes(result)
            .build()]
    }
    private static __SUPPORTED_OP_NAMES__: readonly string[] = [
        'irr',
        'npv',
        'xirr',
        'xnpv',
    ]
}

const VALIDATE_RULES = TYPE4_REGISTRY.map(getValidateRule)
