import {CompositeOpBuilder} from '@logi/src/lib/compute/op'
// tslint:disable-next-line:no-wildcard-import
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

import {Operator as BaseOperator, OperatorType} from './base'
import {TYPE2_REGISTRY} from './registry'
import {getOp, isIncluded, toSubOpInfos} from './utils'
import {getValidateRule} from './validate'

const HAS_HEAD_TYPE: readonly OperatorType[] = [
    OperatorType.TYPE9,
    OperatorType.TYPE10,
]

const HAS_HEAD_METHOD: readonly string[] = [
    '.latter',
    '.previous',
    '.years',
    '.halfyears',
    '.quarters',
    '.months',
]

export class Operator extends BaseOperator {
    public static supportedOpNames(): readonly string[] {
        return Operator.__SUPPORTED_OP_NAMES__
    }
    public readonly opType = OperatorType.TYPE2
    protected readonly validateRules: readonly ValidateRule[] = VALIDATE_RULES

    // tslint:disable-next-line: max-func-body-length
    protected buildFormulaInfo(
        subFormulaInfos: readonly SubFormulaInfo[],
    ): readonly FormulaInfo[] {
        if (subFormulaInfos.length === 0)
            return []
        const child = this.children[0]
        if (child instanceof BaseOperator &&
            ((HAS_HEAD_TYPE.includes(child.opType)) ||
            HAS_HEAD_METHOD.includes(child.image))) {
            const result: FormulaInfo[] = []
            subFormulaInfos.forEach((subInfo: SubFormulaInfo): void => {
                const root = getOp(this.image.slice(1))
                const operator = new CompositeOpBuilder()
                    .rootOp(root)
                    .inTypes([t.number])
                    .outType(t.number)
                    .subOpInfos(toSubOpInfos(subInfo.opAndInNodes))
                    .build()
                const inNodes: CellCoordinate[] = []
                subInfo.opAndInNodes.forEach((sub: OpAndInNodes): void => {
                    sub[1].forEach((cells: CellCoordinate): void => {
                        // tslint:disable limit-indent-for-method-in-class
                        if (!isIncluded(inNodes, cells))
                            inNodes.push(cells)
                    })
                })
                if (inNodes.length === 0)
                    return
                const f = new FormulaInfoBuilder()
                    .head(subInfo.head)
                    .op(operator)
                    .inNodes(inNodes)
                    .build()
                result.push(f)
            })
            return result
        }

        const subs = subFormulaInfos[0]
        const rootOp = getOp(this.image.slice(1))
        const op = new CompositeOpBuilder()
            .rootOp(rootOp)
            .inTypes([t.number])
            .outType(t.number)
            .subOpInfos(toSubOpInfos(subs.opAndInNodes))
            .build()
        const tuples: CellCoordinate[] = []
        subs.opAndInNodes.forEach((sub: OpAndInNodes): void => {
            sub[1].forEach((inNodes: CellCoordinate): void => {
                if (!isIncluded(tuples, inNodes))
                    tuples.push(inNodes)
            })
        })
        return [new FormulaInfoBuilder()
            .head(HEADLESS)
            .op(op)
            .inNodes(tuples)
            .build()]
    }

    /**
     * The head of type2 node is HEADLESS and type2 has only one child.
     * All the formulaInfos from this child should be collected.
     */
    protected collectFormulaInfo(
        walkInfo: WalkInfo,
    ): readonly SubFormulaInfo[] {
        const child = this.children[0]
        const opAndInNodes: OpAndInNodes[] = []
        const childInfo = walkInfo.get(child)
        if (childInfo === undefined || childInfo.length === 0)
            return []
        if (child instanceof BaseOperator &&
            ((HAS_HEAD_TYPE.includes(child.opType)) ||
            HAS_HEAD_METHOD.includes(child.image)))
            return childInfo.map((sub: FormulaInfo): SubFormulaInfo =>
                new SubFormulaInfoBuilder()
                    .head(sub.head)
                    .opAndInNodes([[sub.op, sub.inNodes]])
                    .build())
        childInfo.forEach((subInfo: FormulaInfo): void => {
            opAndInNodes.push([subInfo.op, subInfo.inNodes])
        })
        return [new SubFormulaInfoBuilder()
            .head(HEADLESS)
            .opAndInNodes(opAndInNodes)
            .build()]
    }

    private static __SUPPORTED_OP_NAMES__: readonly string[] = [
        '.abs',
        '.average',
        '.count',
        '.max',
        '.min',
        '.sum',
    ]
}

const VALIDATE_RULES = TYPE2_REGISTRY.map(getValidateRule)
