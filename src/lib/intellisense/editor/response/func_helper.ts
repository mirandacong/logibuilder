import {isToken, lex, Token, TokenType} from '@logi/src/lib/dsl/lexer/v2'
import {
    Argument,
    getSignature,
    Signature,
} from '@logi/src/lib/dsl/semantic'
import {
    EditorDisplayUnit,
    FuncHelperResponse,
    FuncHelperResponseBuilder,
    HelperPart,
    HelperPartBuilder,
    HelperPartType as Type,
} from '@logi/src/lib/intellisense/editor/display'

import {TextStatus} from '../status/textbox'

export function getFuncHelperResponse(
    status: TextStatus,
): Readonly<FuncHelperResponse> | undefined {
    const offset = status.endOffset
    const currText = status.text
        .filter((t: string | EditorDisplayUnit): boolean =>
            typeof t === 'string')
        .join('')
    const funcHelper = getFunc(currText, offset)
    if (funcHelper === undefined)
        return
    const image = funcHelper[0].image
    const sign = getSignature(image)
    if (sign === undefined)
        return
    // tslint:disable-next-line: no-magic-numbers
    const funcIdx = funcHelper[2]
    const parts = getFuncParts(sign, funcHelper[1])
    return new FuncHelperResponseBuilder()
        .description(sign.description)
        .parts(parts)
        .imageIndex(funcIdx)
        .build()
}

// tslint:disable-next-line: max-func-body-length
function getFunc(
    expr: string,
    offset: number,
): readonly [Token, number, number] | undefined {
    let len = 0
    const funcs: Token[] = []
    const paras: number[] = []
    const brackets: number[] = []
    const toks = lex(expr)
    let skip = false
    for (const t of toks) {
        if (len >= offset)
            break
        len += t.image.length
        if (skip) {
            skip = false
            continue
        }
        if (!isToken(t))
            continue
        if (t.type === TokenType.FUNC || t.type === TokenType.METHOD) {
            skip = true
            funcs.push(t)
            paras.push(0)
            brackets.push(0)
            continue
        }
        if (t.type === TokenType.BRA) {
            brackets[brackets.length - 1] += 1
            continue
        }
        if (t.type === TokenType.KET) {
            if (brackets[brackets.length - 1] === 0) {
                funcs.pop()
                paras.pop()
                brackets.pop()
            } else
                brackets[brackets.length - 1] -= 1
            continue
        }
        if (t.type === TokenType.COMMA) {
            paras[paras.length - 1] += 1
            continue
        }
    }
    const token = funcs.pop()
    const paraPos = paras.pop()
    if (token === undefined || paraPos === undefined)
        return
    return [token, paraPos, toks.indexOf(token)]
}

// tslint:disable-next-line: max-func-body-length
function getFuncParts(
    sign: Signature,
    paramPos: number,
): readonly HelperPart[] {
    const parts: HelperPart[] = []
    const image = sign.image
    if (image.startsWith('.')) {
        const refPart = new HelperPartBuilder()
            .content('{ref}')
            .type(Type.REFERENCE)
            .build()
        const dotPart = new HelperPartBuilder()
            .content('.')
            .type(Type.DOT)
            .build()
        parts.push(refPart, dotPart)
    }
    const namePart = new HelperPartBuilder()
        .content(image.startsWith('.') ? image.slice(1) : image)
        .type(Type.NAME)
        .build()
    const leftBraPart = new HelperPartBuilder()
        .content('(')
        .type(Type.BRACKET)
        .build()
    parts.push(namePart, leftBraPart)

    const args = sign.args
    if (sign.infinite === undefined) {
        const argsParts = getArgsPart(args, paramPos)
        parts.push(...argsParts)
    } else
        if (paramPos <= sign.infinite.end) {
            const argsParts = getArgsPart(args, paramPos)
            parts.push(...argsParts)
            if (sign.infinite.end === sign.infinite.start) {
                const commaPart = new HelperPartBuilder()
                    .content(',')
                    .type(Type.COMMON)
                    .build()
                parts.push(commaPart)
                const infinitePart = new HelperPartBuilder()
                    .content('...')
                    .isCurrent(false)
                    .type(Type.INFINITE_ARG)
                    .build()
                parts.push(infinitePart)
            }
        } else {
            const infiniteParts = getInfinteParts(sign, paramPos)
            parts.push(...infiniteParts)
        }
    const rightBraPart = new HelperPartBuilder()
        .content(')')
        .type(Type.BRACKET)
        .build()
    parts.push(rightBraPart)
    return parts
}

// tslint:disable-next-line: max-func-body-length
function getInfinteParts(
    sign: Signature,
    currIdx: number,
): readonly HelperPart[] {
    if (sign.infinite === undefined)
        return []
    const result: HelperPart[] = []
    const start = sign.infinite.start
    const end = sign.infinite.end
    const round = Math.floor((currIdx - start) / (end - start + 1))
    const currParam = (currIdx - start) % (end - start + 1)
    // TODO: Support it!
    if (currParam > 1)
        return []
    for (let i = 0; i < start; i += 1) {
        const arg = sign.args[i]
        const argPart = new HelperPartBuilder()
            .content(arg.name)
            .type(Type.REQ_ARG)
            .isCurrent(false)
            .build()
        result.push(argPart)
        const commaPart = new HelperPartBuilder()
            .content(',')
            .type(Type.COMMON)
            .build()
        result.push(commaPart)
    }
    for (let j = 1; j <= round; j += 1)
        for (let k = start; k <= end; k += 1) {
            const arg = sign.args[k]
            const argPart = new HelperPartBuilder()
                .content(`${arg.name}${j}`)
                .type(Type.OPT_ARG)
                .isCurrent(false)
                .build()
            result.push(argPart)
            const commaPart = new HelperPartBuilder()
                .content(',')
                .type(Type.COMMON)
                .build()
            result.push(commaPart)
        }
    if (currParam === 0) {
        const content = sign.args.length === sign.infinite.end + 1 ?
            `[${sign.args[start].name}]` :
            `[${sign.args[start].name}_or_${sign.args[end + 1].name}]`
        const argPart = new HelperPartBuilder()
            .content(content)
            .isCurrent(true)
            .type(Type.OPT_ARG)
            .build()
        result.push(argPart)
    } else
        for (let i = 0; i <= currParam; i += 1) {
            const part = new HelperPartBuilder()
                .content(`${sign.args[i + start].name}${round + 1}`)
                .type(Type.OPT_ARG)
                .isCurrent(i === currParam)
                .build()
            result.push(part)
            const commaPart = new HelperPartBuilder()
                .content(',')
                .type(Type.COMMON)
                .build()
            result.push(commaPart)
        }
    return result
}

/**
 * Get the func helpler part without considering infinite parameters.
 */
function getArgsPart(
    args: readonly Argument[],
    currIdx: number,
): readonly HelperPart[] {
    const result: HelperPart[] = []
    args.forEach((arg: Argument, idx: number): void => {
        const argPart = new HelperPartBuilder()
            .content(arg.isRequired ? arg.name : `[${arg.name}]`)
            .type(arg.isRequired ? Type.REQ_ARG : Type.OPT_ARG)
            .isCurrent(idx === currIdx)
            .build()
        result.push(argPart)
        if (idx === args.length - 1)
            return
        const commaPart = new HelperPartBuilder()
            .content(',')
            .type(Type.COMMON)
            .build()
        result.push(commaPart)
    })
    return result
}
