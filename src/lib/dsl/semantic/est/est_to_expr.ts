import {assertIsDefined} from '@logi/base/ts/common/assert'
import {isDatetimeDelta} from '@logi/base/ts/common/datetime'
import {sprintf} from 'sprintf-js'

import {Associativity, getBinaryOpPrecedence} from './build_est'
import {isConstant} from './constant'
import {Node as Est} from './node'
import {isOperator, Operator, OperatorType} from './operator'
import {isReference} from './reference'

/**
 * Given an est and find the expression that can build this est.
 * Since the est (actually abstract syntax tree) does not contain all of the
 * information(specially the whitespaces and the case of functions or methods
 * in the expr) about an expression, it is basicly wrong that:
 *  expr1 === expr2
 *  where:
 *      const est = buildEst(expr1)
 *      const expr2 = extToExpr(est)
 *
 * What is more, the external operator will convert as soon as it's built. In
 * this case, we can not get the exact expr.
 *
 * We use this function to make a converter from the old grammar to new grammar.
 */
export function estToExpr(est: Readonly<Est>, hasBracket = false): string {
    if (isConstant(est)) {
        const constant = est
        return isDatetimeDelta(constant.value) ?
            constant.value.toIsoString().replace('P', '') :
            String(constant.value)
    }
    if (isReference(est))
        return `{${est.path.toString()}}`
    if (!isOperator(est))
        return ''
    const prec1 = getBinaryOpPrecedence(est.image)
    const input = est.children.map((child: Readonly<Est>): string => {
        if (!isOperator(child))
            return estToExpr(child)
        const prec2 = getBinaryOpPrecedence(child.image)
        if (prec1 === undefined || prec2 === undefined)
            return estToExpr(child)
        if (prec1[0] < prec2[0] ||
            (prec1[0] === prec2[0] && prec1[1] === Associativity.LEFT))
            return estToExpr(child)
        return estToExpr(child, true)
    })
    const pattern = getOperatorPattern(est)
    if (est.opType === OperatorType.TYPE3 ||
        est.opType === OperatorType.TYPE2 ||
        est.opType === OperatorType.TYPE8) {
        const ref = input.shift()
        assertIsDefined<string>(ref)
        input.push(ref)
    }
    return sprintf(hasBracket ? `(${pattern})` : pattern, ...input)
}

function getOperatorPattern(op: Operator): string {
    const binaryOp = [
        '*',
        '+',
        '-',
        '/',
        '::',
        '<',
        '<=',
        '=',
        '>',
        '>=',
    ]
    const image = op.image.trim()
    if (binaryOp.includes(image)) {
        if (image === '::')
            return `%s${image}%s`
        if (op.children.length === 1)
            return `${image} %s`
        return `%s ${image} %s`
    }
    const childrenCnt = op.children.length
    if (op.opType === OperatorType.TYPE3 ||
        op.opType === OperatorType.TYPE2 ||
        op.opType === OperatorType.TYPE8) {
        if (childrenCnt === 1)
            return `%s${image}()`
        // tslint:disable-next-line: no-magic-numbers
        return `%s${image}(%s${', %s'.repeat(childrenCnt - 2)})`
    }
    if (op.opType === OperatorType.TYPE6)
        return `%s${op.image}`
    if (childrenCnt === 0)
        return `${image}()`
    return `${image}(%s${', %s'.repeat(childrenCnt - 1)})`
}
