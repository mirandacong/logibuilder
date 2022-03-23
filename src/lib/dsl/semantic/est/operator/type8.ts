import {
    CompositeOpBuilder,
    ConstantOpBuilder,
    Op,
    SubOpInfo,
} from '@logi/src/lib/compute/op'
// tslint:disable-next-line:no-wildcard-import
import * as t from 'io-ts'

import {
    CellCoordinate,
    FormulaInfo,
    FormulaInfoBuilder,
    Head,
    HEADLESS,
    Headless,
    OpAndInNodes,
    SubFormulaInfo,
    SubFormulaInfoBuilder,
    ValidateRule,
    WalkInfo,
} from '../node'

import {Operator as BaseOperator, OperatorType} from './base'
import {TYPE8_REGISTRY} from './registry'
import {findFormulaInfo, getOp, isIncluded, toSubOpInfos} from './utils'
import {getValidateRule} from './validate'

/**
 * Type8 operator has these characters:
 * Looks like this {ref}.xxx(...headless ops).
 * - Suffix
 * - The last sub op is a ref as shown .
 * - The paras are headless.
 * - The {ref} provides the header only. It is not involved in calculating the
 * value of a cell.
 */
export class Operator extends BaseOperator {
    public static supportedOpNames(): readonly string[] {
        return Operator.__SUPPORTED_OP_NAMES__
    }

    public readonly opType = OperatorType.TYPE8
    protected readonly validateRules: readonly ValidateRule[] = VALIDATE_RULES

    protected buildFormulaInfo(
        subs: readonly SubFormulaInfo[],
    ): readonly FormulaInfo[] {
        if (subs.length === 0)
            return []
        const heads = subs.map((c: SubFormulaInfo): Head | Headless => c.head)
        const result: FormulaInfo[] = []
        switch (this.image.slice(1)) {
        case 'linear':
            const len = heads.length
            const subOps = subs.map((
                c: SubFormulaInfo,
            ): readonly OpAndInNodes[] => c.opAndInNodes)
            heads.forEach((head: Head | Headless, idx: number): void => {
                const tuples: CellCoordinate[] = []
                const inNodes = subOps[idx]
                inNodes.forEach((c: OpAndInNodes): void => {
                    const cells = c[1]
                    cells.forEach((cell: CellCoordinate): void => {
                        // tslint:disable: limit-indent-for-method-in-class
                        if (!isIncluded(tuples, cell))
                            tuples.push(cell)
                    })
                })
                const op = getLinearRootOp(
                    idx,
                    len,
                    toSubOpInfos(subOps[idx]),
                    tuples.length,
                )
                result.push(new FormulaInfoBuilder()
                    .head(head)
                    .op(op)
                    .inNodes(tuples)
                    .build(),
                )
            })
            return result
        default:
            return []
        }
    }

    // tslint:disable-next-line: max-func-body-length
    protected collectFormulaInfo(
        walkInfo: WalkInfo,
    ): readonly SubFormulaInfo[] {
        const result: SubFormulaInfo[] = []
        const len = this.children.length
        const ref = this.children[len - 1]
        const info = walkInfo.get(ref)
        if (info === undefined)
            return []
        const heads = info.map((c: FormulaInfo): Head | Headless => c.head)
        heads.forEach((head: Head | Headless): void => {
            const thisOp: OpAndInNodes[] = []
            /**
             * The last one of the children is the ref. As is explained before,
             * it is not involed in calculating the value of a cell. Therefore,
             * it is no need to collect its formula info.
             */
            // tslint:disable-next-line: no-loop
            for (const child of this.children.slice(0, len - 1)) {
                const subInfo = walkInfo.get(child)
                if (subInfo === undefined || subInfo.length === 0)
                    continue
                const subHeads = subInfo.map((c: FormulaInfo):
                    Head | Headless => c.head)
                if (subHeads[0] === HEADLESS) {
                    const subOps: OpAndInNodes = [
                        subInfo[0].op,
                        subInfo[0].inNodes,
                    ]
                    // tslint:disable-next-line: no-type-assertion
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
        })
        return result
    }

    private static __SUPPORTED_OP_NAMES__: readonly string[] = ['.linear']
}

// tslint:disable-next-line: max-func-body-length
function getLinearRootOp(
    // tslint:disable-next-line: max-params
    i: number,
    len: number,
    subs: readonly Readonly<SubOpInfo>[],
    subInNodesLen: number,
): Op {
    // tslint:disable-next-line: no-magic-numbers
    if (subs.length !== 2)
        return getOp('empty')
    const div = getOp('/')
    const add = getOp('+')
    const mul = getOp('*')
    // `(%s*${len - i - 1}+%s*${i})/${len - 1}`
    const const1 = new ConstantOpBuilder()
        .value(len - i - 1)
        .inTypes([t.number])
        .outType(t.number)
        .build()
    const op4 = new CompositeOpBuilder()
        .name('')
        .rootOp(mul)
        .subOpInfos([subs[0], [const1, []]])
        .inTypes([t.number])
        .outType(t.number)
        .build()
    const const2 = new ConstantOpBuilder()
        .value(i)
        .inTypes([t.number])
        .outType(t.number)
        .build()
    const op5 = new CompositeOpBuilder()
        .name('')
        .rootOp(mul)
        .subOpInfos([subs[1], [const2, []]])
        .inTypes([t.number])
        .outType(t.number)
        .build()
    const inNodes: number[] = []
    for (let idx = 0; idx <= subInNodesLen - 1; idx += 1)
        inNodes.push(idx)
    const op3 = new CompositeOpBuilder()
        .name('')
        .rootOp(add)
        .inTypes([t.number])
        .outType(t.number)
        .subOpInfos([[op4, inNodes], [op5, inNodes]])
        .build()
    const op2 = new ConstantOpBuilder()
        .value(len - 1)
        .inTypes([t.number])
        .outType(t.number)
        .build()
    return new CompositeOpBuilder()
        .rootOp(div)
        .inTypes([t.number])
        .outType(t.number)
        .subOpInfos([[op3, inNodes], [op2, []]])
        .build()
}

const VALIDATE_RULES = TYPE8_REGISTRY.map(getValidateRule)
