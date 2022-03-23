import {assertIsDefined} from '@logi/base/ts/common/assert'
import {toTimeDelta} from '@logi/base/ts/common/datetime'
import {
    Exception,
    ExceptionBuilder,
    isException,
} from '@logi/base/ts/common/exception'

import {lex} from './lex'
import {
    Constant,
    DistanceOp,
    DistanceType,
    Filter,
    FrequencyOp,
    FrequencyType,
    LogicalOp,
    LogicalOpType,
    SameTimeOp,
    SameType,
} from './op'
import {assertIsToken, Token, Type} from './token'

export function buildFilter(expr: string): Filter | Exception {
    const toks = lex(expr)
    return parse(toks)
}

// tslint:disable-next-line: max-func-body-length cyclomatic-complexity
export function parse(tokens: readonly Token[]): Exception | Filter {
    const operators: Token[] = []
    const operands: Filter[] = []
    // tslint:disable-next-line: no-loop
    for (const t of tokens) {
        if (t.type === Type.BRA) {
            operators.push(t)
            continue
        }
        // WS is not supposed to be here. Check the last step in the `lex`
        // function.
        if (t.type === Type.WS)
            continue
        if (t.type === Type.VALUE) {
            const slicer = new Constant(t.image)
            operands.push(slicer)
            continue
        }
        if (t.type === Type.UNARY) {
            const f = getUnaryFilter(t)
            if (isException(f))
                return f
            operands.push(f)
            continue
        }
        if (t.type === Type.KET) {
            let topOp = getTopOp(operators)
            if (topOp === undefined)
                return new ExceptionBuilder().message('存在未匹配括号').build()
            while (topOp.type !== Type.BRA) {
                const op = operators.pop()
                assertIsToken(op)
                const slicer = getLogicalFilter(op, operands)
                if (isException(slicer))
                    return slicer
                operands.push(slicer)
                topOp = getTopOp(operators)
                if (topOp === undefined)
                    return new ExceptionBuilder().message('存在未匹配括号').build()
            }
            // Pop the left bracket
            operators.pop()
            continue
        }
        if (operators.length === 0) {
            operators.push(t)
            continue
        }
        let top = getTopOp(operators)
        assertIsToken(top)
        while (getPrecedence(top) >= getPrecedence(t)) {
            const op = operators.pop()
            assertIsToken(op)
            const slice = getLogicalFilter(op, operands)
            if (isException(slice))
                return slice
            operands.push(slice)
            top = getTopOp(operators)
            if (top === undefined)
                break
        }
        operators.push(t)
    }
    while (operators.length > 0) {
        const op = operators.pop()
        assertIsToken(op)
        const slice = getLogicalFilter(op, operands)
        if (isException(slice))
            return slice
        operands.push(slice)
    }
    if (operands.length !== 1) {
        const expr = tokens.map((t: Token): string => t.image).join('')
        return new ExceptionBuilder().message(`解析切片出错：${expr}`).build()
    }
    return operands[0]
}

// tslint:disable-next-line: readonly-array
function getTopOp(operators: Token[]): Token | undefined {
    if (operators.length === 0)
        return
    return operators[operators.length - 1]
}

// tslint:disable-next-line: readonly-array
function getLogicalFilter(op: Token, operands: Filter[]): Filter | Exception {
    let opType!: LogicalOpType
    if (op.type === Type.OR)
        opType = LogicalOpType.OR
    else if (op.type === Type.NOT)
        opType = LogicalOpType.NOT
    else if (op.type === Type.AND)
        opType = LogicalOpType.AND
    assertIsDefined<LogicalOpType>(opType)
    switch (op.type) {
    case Type.AND:
    case Type.OR:
        const operand2 = operands.pop()
        const operand1 = operands.pop()
        if (operand2 === undefined || operand1 === undefined)
            return new ExceptionBuilder()
                .message(`逻辑运算符${op.image}缺少参数`)
                .build()
        return new LogicalOp([operand1, operand2], opType)
    case Type.NOT:
        const operand = operands.pop()
        if (operand === undefined)
            return new ExceptionBuilder()
                .message(`逻辑运算符${op.image}缺少参数`)
                .build()
        return new LogicalOp([operand], opType)
    default:
    }
    // tslint:disable-next-line: no-throw-unless-asserts
    throw Error('Not implemented')
}

// tslint:disable-next-line: cyclomatic-complexity
function getUnaryFilter(op: Token): Filter | Exception {
    const image = op.image.toLowerCase()
    const r1 = image.match(/^__d([pls])(e?)(\d+[ymq])__$/)
    if (r1 !== null) {
        // tslint:disable-next-line: no-magic-numbers
        const eq = r1[2] !== ''
        let type!: DistanceType
        if (r1[1] === 'l')
            type = eq ? DistanceType.LATTER_OR_EQUAL : DistanceType.LATTER
        else if (r1[1] === 'p')
            type = eq ? DistanceType.PREVIOUS_OR_EQUAL : DistanceType.PREVIOUS
        else if (r1[1] === 's')
            type = eq ? DistanceType.SURROUND_OR_EQUAL : DistanceType.SURROUND
        // tslint:disable-next-line: no-magic-numbers
        const delta = toTimeDelta(r1[3])
        if (isException(delta))
            return delta
        return new DistanceOp(type, delta)
    }
    const r2 = image.match(/^__s([ymqr])__$/)
    if (r2 !== null) {
        let t = SameType.YEAR
        if (r2[1] === 'm')
            t = SameType.MONTH
        else if (r2[1] === 'q')
            t = SameType.QUATER
        else if (r2[1] === 'r')
            t = SameType.RANGE
        return new SameTimeOp(t)
    }
    const r3 = image.match(/^__f(y|hy|q|m)__$/)
    if (r3 !== null) {
        const fre = r3[1]
        let t!: FrequencyType
        if (fre === 'y')
            t = FrequencyType.YEAR
        else if (fre === 'hy')
            t = FrequencyType.HALF_YEAR
        else if (fre === 'q')
            t = FrequencyType.QUARTER
        else if (fre === 'm')
            t = FrequencyType.MONTH
        return new FrequencyOp(t)
    }
    return new ExceptionBuilder()
        .message(`${image} is not a legal internal filter op.`)
        .build()
}

function getPrecedence(token: Token): number {
    switch (token.type) {
    case Type.AND:
        // tslint:disable-next-line: no-magic-numbers
        return 5
    case Type.NOT:
        // tslint:disable-next-line: no-magic-numbers
        return 10
    case Type.OR:
        return 1
    default:
    }
    return 0
}
