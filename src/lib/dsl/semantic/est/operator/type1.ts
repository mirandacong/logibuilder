import {CompositeOpBuilder, Op} from '@logi/src/lib/compute/op'
// tslint:disable-next-line: no-wildcard-import
import * as t from 'io-ts'

import {
    CellCoordinate,
    FormulaInfo,
    FormulaInfoBuilder,
    Head,
    Headless,
    HEADLESS,
    Node,
    OpAndInNodes,
    SubFormulaInfo,
    SubFormulaInfoBuilder,
    ValidateRule,
    WalkInfo,
} from '../node'

import {Operator as BaseOperator, OperatorType} from './base'
import {TYPE1_REGISTRY} from './registry'
import {
    findFormulaInfo,
    getOp,
    intersect,
    isIncluded,
    toSubOpInfos,
} from './utils'
import {getValidateRule} from './validate'

type Header = readonly (Head | Headless)[]

export class Operator extends BaseOperator {
    public static supportedOpNames(): readonly string[] {
        return Operator.__SUPPORTED_OP_NAMES__
    }
    public readonly opType = OperatorType.TYPE1
    protected readonly validateRules: readonly ValidateRule[] = VALIDATE_RULES

    // tslint:disable-next-line: max-func-body-length
    protected buildFormulaInfo(
        subs: readonly SubFormulaInfo[],
    ): readonly FormulaInfo[] {
        /**
         * In this situation, there is nothing collected from
         * `colldectFormulaInfo`.
         */
        if (subs.length === 0)
            return []
        const heads = subs.map((c: SubFormulaInfo): Head | Headless => c.head)
        const subOps = subs.map((c: SubFormulaInfo): readonly OpAndInNodes[] =>
            c.opAndInNodes)
        const rootOp = this._getRootOp()
        /**
         * When the all the children is HEADLESS.
         */
        if (heads.length === 1 && heads[0] === HEADLESS) {
            const op = new CompositeOpBuilder()
                .rootOp(rootOp)
                .inTypes([t.number])
                .outType(t.number)
                .subOpInfos(toSubOpInfos(subOps[0]))
                .build()
            const tuples: CellCoordinate[] = []
            subOps[0].forEach((c: OpAndInNodes): void => {
                c[1].forEach((cell: CellCoordinate): void => {
                    if (!isIncluded(tuples, cell))
                        // tslint:disable: limit-indent-for-method-in-class
                        tuples.push(cell)
                })
            })
            const info = new FormulaInfoBuilder()
                .head(HEADLESS)
                .op(op)
                .inNodes(tuples)
                .build()
            return [info]
        }
        const result: FormulaInfo[] = []
        for (let i = 0; i < heads.length; i += 1) {
            const subOpAndInNodes = subOps[i]
            const op = new CompositeOpBuilder()
                .rootOp(rootOp)
                .inTypes([t.number])
                .outType(t.number)
                .subOpInfos(toSubOpInfos(subOpAndInNodes))
                .build()
            const tuples: CellCoordinate[] = []
            const childInNodes = subOps[i]
            childInNodes.forEach((child: OpAndInNodes): void => {
                const cells = child[1]
                cells.forEach((cell: CellCoordinate): void => {
                    if (!isIncluded(tuples, cell))
                        tuples.push(cell)
                })
            })
            const info = new FormulaInfoBuilder()
                .head(heads[i])
                .op(op)
                .inNodes(tuples)
                .build()
            result.push(info)
        }
        return result
    }

    // tslint:disable-next-line: max-func-body-length
    protected collectFormulaInfo(
        walkInfo: WalkInfo,
    ): readonly SubFormulaInfo[] {
        /**
         * Get the header of this node.
         */
        const subHeaders: readonly Header[] =
            this.children.map((c: Readonly<Node>): Header => {
                const infos = walkInfo.get(c)
                return infos?.map((v: FormulaInfo): Head | Headless => v.head)
                    ?? []
            })
        if (subHeaders.length === 0)
            return []
        const heads = subHeaders.reduce(intersect)

        /**
         * In this situation, this node is HEADLESS, it means all the children
         * of this node have no head.
         * `Check the details in the intersect function.`
         */
        if (heads.length === 1 && heads[0] === HEADLESS) {
            const opsAndInNodes: OpAndInNodes[] = []
            // tslint:disable-next-line: no-loop
            for (const child of this.children) {
                const subInfos = walkInfo.get(child)
                if (subInfos === undefined || subInfos.length === 0)
                    continue
                const subInfo =
                    findFormulaInfo(subInfos, heads[0])
                if (subInfo === undefined)
                    continue
                const op = subInfo.op
                const inNodes = subInfo.inNodes
                opsAndInNodes.push([op, inNodes])
            }
            return [new SubFormulaInfoBuilder()
                .head(HEADLESS)
                .opAndInNodes(opsAndInNodes)
                .build()]
        }

        /**
         * In this situation, it means children has heads but the intersection
         * is an empty set. `Check the details in the intersect function.`
         * Make sure this node won't pass anything to the upper Op.
         */
        if (heads.length === 0)
            return []

        /**
         * In this situation, this node has heads and collect the formula info
         * from children according to the head.
         */
        const result: SubFormulaInfo[] = []
        for (const head of heads) {
            const thisOp: OpAndInNodes[] = []
            // tslint:disable-next-line: no-loop
            for (const child of this.children) {
                const subInfo = walkInfo.get(child)
                if (subInfo === undefined || subInfo.length === 0)
                    continue
                const subHeads = subInfo.map((c: FormulaInfo):
                    Head | Headless => c.head)
                if (subHeads[0] === HEADLESS) {
                    const subOps: OpAndInNodes =
                        [subInfo[0].op, subInfo[0].inNodes]
                    thisOp.push(subOps)
                } else {
                    const sub = findFormulaInfo(subInfo, head)
                    if (sub === undefined)
                        continue
                    thisOp.push([sub.op, sub.inNodes])
                }
            }
            const subFormulaInfo = new SubFormulaInfoBuilder()
                .head(head)
                .opAndInNodes(thisOp)
                .build()
            result.push(subFormulaInfo)
        }
        return result
    }
    private static __SUPPORTED_OP_NAMES__: readonly string[] = [
        '!=',
        '&',
        '*',
        '+',
        '-',
        '/',
        '::',
        '<',
        '<=',
        '<>',
        '=',
        '>',
        '>=',
        'abs',
        'and',
        'average',
        'cos',
        'count',
        'date',
        'if',
        'iferror',
        'iserror',
        'log',
        'max',
        'min',
        'not',
        'or',
        'power',
        'round',
        'sin',
        'sum',
        'switch',
        'yearfrac',
    ]

    private _getRootOp(): Op {
        let imageOp: Op | undefined
        switch (this.image) {
        case '+':
            imageOp = (this.children.length > 1) ?
                getOp(this.image) : getOp('positive')
            break
        case '-':
            imageOp = (this.children.length > 1) ?
                getOp(this.image) : getOp('negative')
            break
        default:
            imageOp = getOp(this.image)
        }
        return imageOp
    }
}

const VALIDATE_RULES = TYPE1_REGISTRY.map(getValidateRule)
