import {toTimeDelta} from '@logi/base/ts/common/datetime'
import {
    Exception,
    ExceptionBuilder,
    isException,
} from '@logi/base/ts/common/exception'
import {isKeyWord} from '@logi/src/lib/compute/op'
import {Token, TokenType} from '@logi/src/lib/dsl/lexer/v2'
import {Path, PathBuilder} from '@logi/src/lib/hierarchy/core'

import {Constant} from './constant'
import {Node as Est} from './node'
import {BuildInfoBuilder, buildOperator, Operator} from './operator'
import {Reference} from './reference'

/**
 * Use shunting-yard algo to build est.
 * The basic edition is here: https://en.wikipedia.org/wiki/Shunting-yard_algorithm
 * We refered here: https://blog.kallisti.net.nz/2008/02/extension-to-the-shunting-yard-algorithm-to-allow-variable-numbers-of-arguments-to-functions/
 */
export function buildEst(tokens: readonly Token[]): Readonly<Est> | Exception {
    const operands: Readonly<Est>[] = []
    const operators: Token[] = []
    const wereValues: boolean[] = []
    const argsCount: number[] = []
    // tslint:disable-next-line: cyclomatic-complexity max-func-body-length
    for (const t of tokens) {
        if (t.type === TokenType.WS)
            continue
        if (t.type === TokenType.COMMA) {
            while (getTopToken(operators)?.type !== TokenType.BRA) {
                const opToken = operators.pop()
                if (opToken === undefined)
                    return buildException()
                if (opToken.type === TokenType.UNARY_OP) {
                    const operand = operands.pop()
                    if (operand === undefined)
                        return buildException()
                    const o = buildOp([operand], opToken)
                    if (isException(o))
                        return buildException()
                    operands.push(o)
                    continue
                }
                if (opToken.type !== TokenType.OP)
                    return buildException()
                const operand2 = operands.pop()
                const operand1 = operands.pop()
                if (operand2 === undefined || operand1 === undefined)
                    return buildException()
                const op = buildOp([operand1, operand2], opToken)
                if (isException(op))
                    return op
                operands.push(op)
            }
            const w = wereValues.pop()
            if (w) {
                const arg = argsCount.pop()
                if (arg === undefined)
                    return buildException()
                argsCount.push(arg + 1)
            }
            wereValues.push(false)
            continue
        }
        if (t.type === TokenType.CONSTANT) {
            const num = Number(t.image)
            if (isNaN(num))
                return buildException()
            const operand = new Constant(num, t.image)
            operands.push(operand)
            if (wereValues.length > 0) {
                wereValues.pop()
                wereValues.push(true)
            }
            continue
        }
        if (t.type === TokenType.STRING) {
            const value = t.image
            const operand = new Constant(value, t.image)
            operands.push(operand)
            if (wereValues.length > 0) {
                wereValues.pop()
                wereValues.push(true)
            }
            continue
        }
        if (t.type === TokenType.DATE) {
            const timeDelta = toTimeDelta(t.image)
            if (isException(timeDelta))
                return timeDelta
            const operand = new Constant(timeDelta, t.image)
            operands.push(operand)
            if (wereValues.length > 0) {
                wereValues.pop()
                wereValues.push(true)
            }
            continue
        }
        if (t.type === TokenType.KEYWORD) {
            if (!isKeyWord(t.image))
                continue
            const operand = new Constant(t.image, t.image)
            operands.push(operand)
            if (wereValues.length > 0) {
                wereValues.pop()
                wereValues.push(true)
            }
            continue
        }
        // Slice is an unary operator. And its operand always on its left.
        if (t.type === TokenType.SLICE) {
            const ref = operands.pop()
            if (ref === undefined)
                return new ExceptionBuilder()
                    .message(`没有切片${t.image}的作用对象`)
                    .build()
            const op = buildOp([ref], t)
            if (isException(op))
                return new ExceptionBuilder()
                    .message(`没有切片${t.image}的作用对象`)
                    .build()
            operands.push(op)
            continue
        }
        if (t.type === TokenType.BRA) {
            operators.push(t)
            continue
        }
        if (t.type === TokenType.UNARY_OP) {
            operators.push(t)
            continue
        }
        if (t.type === TokenType.KET) {
            while (true) {
                const opToken = operators.pop()
                if (opToken === undefined)
                    return buildException()
                if (opToken.type === TokenType.BRA)
                    break
                if (opToken.type === TokenType.UNARY_OP) {
                    const operand = operands.pop()
                    if (operand === undefined)
                        return buildException()
                    const o = buildOp([operand], opToken)
                    if (isException(o))
                        return o
                    operands.push(o)
                    continue
                }
                if (opToken.type !== TokenType.OP)
                    return new ExceptionBuilder()
                        .message('解析公式失败，请检查公式是否合法')
                        .build()
                const op2 = operands.pop()
                const op1 = operands.pop()
                if (op2 === undefined || op1 === undefined)
                    return buildException()
                const op = buildOp([op1, op2], opToken)
                if (isException(op))
                    return op
                operands.push(op)
            }
            const topToken = getTopToken(operators)
            if (topToken === undefined)
                continue
            if (topToken.type === TokenType.FUNC ||
                topToken.type === TokenType.METHOD) {
                const top = operators.pop()
                let cnt = argsCount.pop()
                const w = wereValues.pop()
                if (top === undefined || cnt === undefined || w === undefined)
                    return buildException()
                if (w)
                    cnt += 1
                const args: Readonly<Est>[] = []
                while (cnt > 0) {
                    const a = operands.pop()
                    if (a === undefined)
                        return new ExceptionBuilder().message('error').build()
                    args.unshift(a)
                    cnt -= 1
                }
                const op = buildOp(args, top)
                if (isException(op))
                    return op
                operands.push(op)
                continue
            }
        }
        if (t.type === TokenType.FUNC || t.type === TokenType.METHOD) {
            operators.push(t)
            const argNum = t.type === TokenType.FUNC ? 0 : 1
            argsCount.push(argNum)
            if (wereValues.length >= 1) {
                wereValues.pop()
                wereValues.push(true)
            }
            wereValues.push(false)
            continue
        }
        if (t.type === TokenType.REF) {
            const ref = buildRef(t)
            if (isException(ref))
                return ref
            if (wereValues.length > 0) {
                wereValues.pop()
                wereValues.push(true)
            }
            operands.push(ref)
            continue
        }
        if (t.type === TokenType.OP) {
            let topToken = getTopToken(operators)
            if (topToken === undefined) {
                operators.push(t)
                continue
            }
            if (topToken.type === TokenType.UNARY_OP) {
                const operand = operands.pop()
                const operator = operators.pop()
                if (operand === undefined || operator === undefined)
                    return buildException()
                const op = buildOp([operand], operator)
                if (isException(op))
                    return op
                operands.push(op)
                operators.push(t)
                continue
            }
            if (topToken.type !== TokenType.OP) {
                operators.push(t)
                continue
            }
            const op1 = getBinaryOpPrecedence(t.image)
            let op2 = getBinaryOpPrecedence(topToken.image)
            if (op1 === undefined || op2 === undefined)
                return buildException()
            while (op1[0] < op2[0] || (op1[0] === op2[0] &&
                op1[1] === Associativity.LEFT)) {
                const op = operators.pop()
                const operand2 = operands.pop()
                const operand1 = operands.pop()
                if (op === undefined || operand2 === undefined ||
                    operand1 === undefined)
                    return buildException()
                const o = buildOp([operand1, operand2], op)
                if (isException(o))
                    return o
                operands.push(o)
                topToken = getTopToken(operators)
                if (topToken === undefined || topToken.type !== TokenType.OP)
                    break
                op2 = getBinaryOpPrecedence(topToken.image)
                if (op2 === undefined)
                    return buildException()
            }
            operators.push(t)
            continue
        }
    }
    while (operators.length > 0) {
        const opToken = operators.pop()
        const operand2 = operands.pop()
        if (opToken === undefined || operand2 === undefined)
            return buildException()
        const operand1 = operands.pop()
        const op = buildOp(
            operand1 !== undefined ? [operand1, operand2] : [operand2],
            opToken,
        )
        if (isException(op))
            return op
        operands.push(op)
    }
    if (operands.length === 1)
        return operands[0]
    return new ExceptionBuilder().message('公式不合法').build()
}

function buildException(): Exception {
    return new ExceptionBuilder().message('解析失败，请检查语法是否正确').build()
}

function buildRef(refToken: Token): Reference | Exception {
    const path = toPath(refToken)
    return new Reference(path)
}

function buildOp(
    // tslint:disable-next-line: readonly-array
    operands: Readonly<Est>[],
    operator: Token,
): Readonly<Operator> | Exception {
    let args = operands
    if (operator.type === TokenType.METHOD && args.length > 1) {
        const newArgs = operands.slice(1, operands.length)
        args = [...newArgs, operands[0]]
    }
    const buildInfo = new BuildInfoBuilder()
        .children(args)
        .image(operator.image)
        .token(operator)
        .build()
    return buildOperator(buildInfo)
}

// tslint:disable-next-line: readonly-array
function getTopToken(toks: Token[]): Token | undefined {
    if (toks.length === 0)
        return
    return toks[toks.length - 1]
}

export function toPath(refToken: Token): Path {
    const image = refToken.image
    const path = PathBuilder
        .buildFromString(image.substring(1, image.length - 1))
    if (isException(path))
        return new PathBuilder().parts([]).build()
    return path
}

export function getBinaryOpPrecedence(
    image: string,
): readonly [number, Associativity] | void {
    switch (image) {
    case '>=':
    case '<=':
    case '>':
    case '<':
    case '<>':
    case '!=':
        return [0, Associativity.LEFT]
    case '+':
    case '-':
        return [1, Associativity.LEFT]
    case '*':
    case '/':
        // tslint:disable-next-line: no-magic-numbers
        return [2, Associativity.LEFT]
    case '^':
        // tslint:disable-next-line: no-magic-numbers
        return [4, Associativity.RIGHT]
    case '::':
        // tslint:disable-next-line: no-magic-numbers
        return [5, Associativity.LEFT]
    default:
    }
    return
}

export const enum Associativity {
    LEFT,
    RIGHT,
// tslint:disable-next-line: max-file-line-count
}
