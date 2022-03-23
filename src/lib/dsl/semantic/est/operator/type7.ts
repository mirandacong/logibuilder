import {isException} from '@logi/base/ts/common/exception'
import {ConstantOpBuilder, Op} from '@logi/src/lib/compute/op'
import {toDateRange} from '@logi/src/lib/hierarchy/core'
// tslint:disable-next-line: no-wildcard-import
import * as t from 'io-ts'

import {
    FormulaInfo,
    FormulaInfoBuilder,
    Head,
    HEADLESS,
    Headless,
    Node,
    OpAndInNodes,
    SubFormulaInfo,
    SubFormulaInfoBuilder,
    ValidateRule,
    WalkInfo,
} from '../node'

import {Operator as BaseOperator, OperatorType} from './base'
import {TYPE7_REGISTRY} from './registry'
import {findFormulaInfo, intersect} from './utils'
import {getValidateRule} from './validate'

type Header = readonly (Head | Headless)[]

export class Operator extends BaseOperator {
    public static supportedOpNames(): readonly string[] {
        return Operator.__SUPPORTED_OP_NAMES__
    }
    public readonly opType = OperatorType.TYPE7
    protected readonly validateRules: readonly ValidateRule[] = VALIDATE_RULES

    // tslint:disable-next-line: prefer-function-over-method
    // tslint:disable-next-line: max-func-body-length
    protected buildFormulaInfo(
        subs: readonly SubFormulaInfo[],
    ): readonly FormulaInfo[] {
        if (subs.length === 0)
            return []
        const heads = subs.map((c: SubFormulaInfo): Head | Headless => c.head)
        if (heads.length === 1 && heads[0] === HEADLESS)
            return []
        if (heads.find((head: Head | Headless): boolean => head === HEADLESS))
            return []
        // tslint:disable-next-line: no-type-assertion
        return (heads as Head[]).map((head: Head): FormulaInfo => {
            const dateRange = toDateRange(head)
            const defaultOp = new ConstantOpBuilder()
                .inTypes([t.number])
                .outType(t.number)
                .value(0)
                .build()
            if (isException(dateRange))
                return new FormulaInfoBuilder()
                    .head(head)
                    .op(defaultOp)
                    .inNodes([])
                    .build()
            let op: Op
            switch (this.image.slice(1)) {
            case 'year': {
                op = new ConstantOpBuilder()
                    .inTypes([t.number])
                    .outType(t.number)
                    .value(dateRange.start.year)
                    .build()
                break
            }
            case 'day': {
                op = new ConstantOpBuilder()
                    .inTypes([t.number])
                    .outType(t.number)
                    .value(dateRange.start.day)
                    .build()
                break
            }
            default:
                op = defaultOp
            }
            return new FormulaInfoBuilder()
                .head(head)
                .op(op)
                .inNodes([])
                .build()
        })
    }

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
        const heads = subHeaders.reduce(intersect)
        if (heads.length === 0)
            return []
        if (heads.length === 1 && heads[0] === HEADLESS)
            return []

        const result: SubFormulaInfo[] = []
        // tslint:disable-next-line: no-loop
        for (const head of heads) {
            const thisOps: OpAndInNodes[] = []
            const child = this.children[0]
            const subInfo = walkInfo.get(child)
            if (subInfo === undefined || subInfo.length === 0)
                continue
            const subHead = subInfo[0].head
            if (subHead === HEADLESS) {
                const subOps: OpAndInNodes =
                    [subInfo[0].op, subInfo[0].inNodes]
                thisOps.push(subOps)
            } else {
                const sub = findFormulaInfo(subInfo, head)
                if (sub === undefined)
                    continue
                thisOps.push([sub.op, sub.inNodes])
            }
            const subFormulaInfo = new SubFormulaInfoBuilder()
                .head(head)
                .opAndInNodes(thisOps)
                .build()
            result.push(subFormulaInfo)
        }
        return result
    }

    private static __SUPPORTED_OP_NAMES__: readonly string[] = [
        '.year',
        '.day',
    ]
}

const VALIDATE_RULES = TYPE7_REGISTRY.map(getValidateRule)
