import {Exception, ExceptionBuilder} from '@logi/base/ts/common/exception'
import {KeyWord} from '@logi/src/lib/compute/op'

import {isConstant} from '../constant'
import {Node, Type, ValidateRule} from '../node'
import {isReference} from '../reference'

import {isOperator, Operator, OperatorType} from './base'
import {getSignature} from './registry'
import {ArgType, Argument, Signature} from './signature'

export function getValidateRule(sign: Signature): ValidateRule {
    return (node: Node): Exception | void => {
        if (!isOperator(node))
            return
        const image = node.image
        if (sign.image.toLowerCase() !== image.toLowerCase())
            return
        const lenResult = checkArgumentLength(node, sign)
        if (lenResult !== undefined)
            return lenResult
        return checkArgumentType(node, sign)
    }
}

function checkArgumentLength(
    node: Operator,
    sign: Signature,
): Exception | void {
    const image = node.image
    const length = image.startsWith('.')
        ? node.children.length - 1
        : node.children.length
    const reqLen = sign.args.filter((
        a: Argument,
    ): boolean => a.isRequired).length
    const optLen = sign.args.length - reqLen
    if (sign.infinite !== undefined && length < reqLen)
        return new ExceptionBuilder()
            .message(`${image} 至少需要 ${reqLen} 个参数.`)
            .build()
    if (sign.infinite !== undefined)
        return
    if (optLen === 0 && length !== reqLen)
        return new ExceptionBuilder()
            .message(`${image} 需要 ${reqLen} 个参数.`)
            .build()
    if (optLen === 0)
        return
    if (length < reqLen)
        return new ExceptionBuilder()
            .message(`${image} 至少需要 ${reqLen} 个参数`)
            .build()
    if (length > reqLen + optLen)
        return new ExceptionBuilder()
            .message(`${image} 至多需要 ${reqLen + optLen} 个参数`)
            .build()
}

function checkArgumentType(node: Operator, sign: Signature): Exception | void {
    const length = sign.image.startsWith('.')
        ? node.children.length - 1
        : node.children.length
    for (let i = 0; i < length; i += 1) {
        const child = node.children[i]
        if (isConstant(child) && child.value === KeyWord.NONE)
            return new ExceptionBuilder().message(`第 ${i + 1} 个参数不能为空.`).build()
        const arg = sign.args[i] ?? sign.args[sign.args.length - 1]
        type ValidateCallBack = (node: Readonly<Node>) => boolean
        const callBacks = arg.allowType.map((
            type: ArgType,
        ): ValidateCallBack => {
            switch (type) {
            case ArgType.ARRAY: return isArray
            case ArgType.DATE: return isDate
            case ArgType.NUMBER: return isNumber
            case ArgType.BOOLEAN: return isCondition
            case ArgType.MATRIX: return isMatrix
            default: return (): boolean => false
            }
        })
        const isLegal = callBacks.reduce(
            (result: boolean, callBack: ValidateCallBack): boolean =>
                result || callBack(child),
            false,
        )
        if (!isLegal)
            return new ExceptionBuilder()
                .message(`${sign.image} 的第 ${i + 1} 个参数的类型应该为`
                    + `${getTypesString(arg.allowType)}.`)
                .build()
    }
    if (!sign.image.startsWith('.'))
        return
    const ref = node.children[node.children.length - 1]
    if (isConstant(ref))
        return new ExceptionBuilder()
            .message(`${sign.image} 前需要一个引用{foo}.`)
            .build()
}

function getTypesString(types: readonly ArgType[]): string {
    return types
        .map((type: ArgType): string => {
            switch (type) {
            case ArgType.ARRAY: return '数组'
            case ArgType.DATE: return '日期'
            case ArgType.NUMBER: return '数字'
            case ArgType.BOOLEAN: return '布尔值'
            case ArgType.MATRIX: return '矩阵'
            default: return ''
            }
        })
        .join(' 或 ')
}

function isCondition(node: Readonly<Node>): boolean {
    if (!isOperator(node))
        return false
    const returnType = getReturnType(node)
    return returnType.includes(ArgType.BOOLEAN)
}

function isArray(node: Readonly<Node>): boolean {
    if (node.type === Type.CONSTANT)
        return false
    if (!isOperator(node))
        return true
    const returnType = getReturnType(node)
    return returnType.includes(ArgType.ARRAY)
}

function isNumber(node: Readonly<Node>): boolean {
    if (node.type === Type.CONSTANT)
        return true
    /**
     * TODO (jiabao): refactor the following if statement, the following check
     * is undemanding, when build the est, there is no hierarchy-node in
     * reference est, so not enough information in the following if statement.
     */
    if (isReference(node))
        return true
    if (!isOperator(node))
        return true
    const returnType = getReturnType(node)
    return returnType.includes(ArgType.NUMBER)
}

function isDate(node: Readonly<Node>): boolean {
    return isConstant(node)
}

function isMatrix(node: Readonly<Node>): boolean {
    if (!isOperator(node))
        return false
    const returType = getReturnType(node)
    return returType.includes(ArgType.MATRIX)
}

function getReturnType(node: Readonly<Operator>): readonly ArgType[] {
    let sign: Signature | undefined
    // tslint:disable-next-line: prefer-conditional-expression
    if (node.opType === OperatorType.TYPE6)
        sign = getSignature('[]')
    else if (node.opType === OperatorType.TYPE9)
        sign = getSignature('[::]')
    else
        sign = getSignature(node.image)
    return sign === undefined ? [] : sign.returnType
}
