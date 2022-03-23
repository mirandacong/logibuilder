import {isException} from '@logi/base/ts/common/exception'
import {Writable} from '@logi/base/ts/common/mapped_types'
import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {
    Error,
    isRefError,
    isToken,
    lex,
    lexSuccess,
    RefError,
    RefErrorType,
    reflex,
    RefToken,
    RefTokenType,
    Token,
    TokenType,
} from '@logi/src/lib/dsl/lexer/v2'
import {buildEst, Est, isOperator, Operator} from '@logi/src/lib/dsl/semantic'
import {
    Node,
    NodeType,
    PathBuilder,
    resolve,
} from '@logi/src/lib/hierarchy/core'

import {
    HoverInfo,
    lackCharInfo,
    multiNodesInfo,
    singleNodeInfo,
    undefinedRefInfo,
    unexpectedEndInfo,
    unrecorgnizedInfo,
    wrongParas,
} from './hover_info'
import {EditorDisplayUnit, EditorDisplayUnitBuilder} from './textbox/unit'
import {
    getErrorUnitType,
    getRefUnitType,
    getUnitType,
    UnitType,
} from './textbox/unit_type'

/**
 * Convert the display form to a inner used form.
 * In the mouse event, the content of textbox we communicate with the frontend
 * is an array of `EditorDisplayUnit`, but it is not convenient to apply some
 * actions like delete a char or set the offset. Therefore we use an other
 * pattern here, an array of `string | EditorDisplayUnit`. In this pattern,
 * string element is a character and and EditorDisplayUnit should always mean
 * an indivisable unit. When we move the offset or add or delete char, it is
 * easier.
 * Notice that the offset in frontend is based on the counts of a character,
 * we should convert it to the inner one.
 *
 * outer: +--+ +--+ +--+     DisplayUnit[]
 * inner: ++ ++ ++ +--+ ++   (string|DisplayUnit)[]
 */
export function toInnerText(
    display: readonly EditorDisplayUnit[],
): readonly (string | EditorDisplayUnit)[] {
    const result: (string | EditorDisplayUnit)[] = []
    display.forEach((c: EditorDisplayUnit): void => {
        if (!c.indivisible)
            if (c.tags.includes(UnitType.READ_BUFFER))
                result.push(...c.buffer.split(''))
            else
                result.push(...c.content.split(''))
        else
            if (c.tags.includes(UnitType.READ_BUFFER))
                result.push(...c.buffer.split(''))
            else
                result.push(c)
    })
    return result
}

/**
 * Convert the text in the textbox status to a display form.
 *
 * In the normal case, we should lex an expression to split the string and
 * get the units according to the token type. But if we have a indivisible part
 * which is should be displayed on the frontend, we can not simply lex a string.
 * In this case, we make a placeholder for the indivisable part and replace the
 * placeholder with a unit.
 */
// tslint:disable-next-line: max-func-body-length
export function toOuterText(
    text: readonly (string | EditorDisplayUnit)[],
    node: Readonly<Node>,
): readonly EditorDisplayUnit[] {
    if (text.every((value: string | EditorDisplayUnit): boolean =>
        typeof value !== 'string'))
        // tslint:disable-next-line: no-type-assertion
        return text as EditorDisplayUnit[]
    let i = 1
    const holder = 'InDiViSIbLe'
    const unitMap = new Map<string, EditorDisplayUnit>()
    const textArray: string[] = []
    text.forEach((c: string | EditorDisplayUnit): void => {
        if (typeof c !== 'string' && !c.indivisible) {
            textArray.push(...c.content.split(''))
            return
        }
        if (typeof c === 'string') {
            textArray.push(...c.split(''))
            return
        }
        const placeholder = `${holder}${i}${holder}`
        textArray.push(placeholder)
        i += 1
        unitMap.set(placeholder, c)
    })
    const tokens = lex(textArray.join(''))
    const result: EditorDisplayUnit[] = []
    const tokenToUnit = new Map<Token | Error, EditorDisplayUnit>()
    tokens.forEach((t: Token | Error): void => {
        const parts = t.image.split(`${holder}`)
        if (parts.length === 1) {
            if (t.type === TokenType.REF) {
                const refUnits = getRefUnits(t.image, node)
                result.push(...refUnits)
                return
            }
            const tokenUnit = toDisplayUnit(t)
            tokenToUnit.set(t, tokenUnit)
            result.push(tokenUnit)
            return
        }
        parts.forEach((p: string, idx: number): void => {
            if (p === '')
                return
            if (idx === 0 || idx === parts.length - 1) {
                const u = new EditorDisplayUnitBuilder()
                    .indivisible(false)
                    .content(p)
                    .tags([UnitType.UNKNOWN])
                    .build()
                result.push(u)
                return
            }
            const unit = unitMap.get(`${holder}${p}${holder}`)
            if (unit !== undefined)
                result.push(unit)
        })
    })
    /**
     * If lex has no error, check the functions and methods.
     */
    if (!lexSuccess(tokens))
        return squashError(result)
    const est = buildEst(tokens)
    if (isException(est))
        return result
    // tslint:disable-next-line: no-type-assertion
    const ops = preOrderWalk(est, (
        n: Readonly<Est>,
    ): readonly [readonly Operator[], readonly Readonly<Est>[]] => {
        if (!isOperator(n))
            return [[], []]
        return [[n], n.children]
    }) as readonly Operator[]
    ops.forEach((op: Operator): void => {
        const r = op.validate()
        if (!isException(r))
            return
        const unit = tokenToUnit.get(op.token)
        if (unit === undefined)
            return
        addTag(unit, UnitType.FUNC_ERROR)
        addHoverInfo(unit, wrongParas(r.message))
    })
    return result
}

// tslint:disable-next-line: max-func-body-length
function squashError(
    units: readonly EditorDisplayUnit[],
): readonly EditorDisplayUnit[] {
    const len = units.length
    let errorTag: UnitType | undefined
    let hoverMsg: HoverInfo | undefined
    const result: EditorDisplayUnit[] = []
    let unrecognized: EditorDisplayUnit[] = []
    for (let i = len - 1; i >= 0; i -= 1) {
        const unit = units[i]
        if (unit.tags.includes(UnitType.UNEXPECTED_END_ERROR)) {
            errorTag = UnitType.UNEXPECTED_END_ERROR
            hoverMsg = unexpectedEndInfo()
            continue
        }
        if (unit.tags.includes(UnitType.UNRECOGNIZE_ERROR)) {
            unrecognized.unshift(unit)
            continue
        }
        if (unit.tags.includes(UnitType.EXPECTED_ERROR)) {
            errorTag = UnitType.EXPECTED_ERROR
            hoverMsg = lackCharInfo(unit.content)
            continue
        }
        if (unrecognized.length > 0) {
            const u = new EditorDisplayUnitBuilder()
                .hoverInfo(unrecorgnizedInfo())
                .content(unrecognized.map(e => e.content).join(''))
                .tags([UnitType.UNRECOGNIZE_ERROR])
                .build()
            result.unshift(u)
            unrecognized = []
            hoverMsg = undefined
            errorTag = undefined
        }
        if (errorTag === undefined) {
            result.unshift(unit)
            continue
        }
        const newUnit = new EditorDisplayUnitBuilder(unit)
            .tags([...unit.tags, errorTag])
            .hoverInfo(hoverMsg === undefined ? unit.hoverInfo : hoverMsg)
            .build()
        result.unshift(newUnit)
        hoverMsg = undefined
        errorTag = undefined
    }
    if (unrecognized.length > 0) {
        const u = new EditorDisplayUnitBuilder()
            .hoverInfo(unrecorgnizedInfo())
            .content(unrecognized.map(e => e.content).join(''))
            .tags([UnitType.UNRECOGNIZE_ERROR])
            .build()
        result.unshift(u)
    }
    return result
}

/**
 * Get a display unit from a token.
 */
export function toDisplayUnit(
    token: Token | Error,
    tags: readonly UnitType[] = [],
    hoverMsg?: HoverInfo,
): EditorDisplayUnit {
    const type = isToken(token) ? getUnitType(token.type) :
        getErrorUnitType(token.type)
    const builder = new EditorDisplayUnitBuilder()
        .content(token.image)
        .tags([type, ...tags])
        .indivisible(false)
    if (hoverMsg !== undefined)
        builder.hoverInfo(hoverMsg)
    return builder.build()
}

// tslint:disable-next-line: max-func-body-length
function getRefUnits(
    image: string,
    loc: Readonly<Node>,
): readonly EditorDisplayUnit[] {
    const result: EditorDisplayUnit[] = []
    const refToks = reflex(image)
    let first = true
    let refUnit!: EditorDisplayUnit
    let hov: HoverInfo | undefined
    /**
     * Step1: reflex the image and get the initial units.
     */
    refToks.slice().reverse().forEach((tok: RefToken | RefError): void => {
        if (isRefError(tok)) {
            if (tok.type === RefErrorType.UNRECOGNIZED)
                result.unshift(new EditorDisplayUnitBuilder()
                    .content(tok.image)
                    .tags([UnitType.UNRECOGNIZE_ERROR])
                    .hoverInfo(unrecorgnizedInfo())
                    .build())
            else if (tok.type === RefErrorType.EXPECTED)
                hov = lackCharInfo(tok.image)
            return
        }
        const tag = first && tok.type === RefTokenType.PART ?
            UnitType.REF : getRefUnitType(tok.type)
        if (tok.type === RefTokenType.PART)
            first = false
        const unit = new EditorDisplayUnitBuilder()
            .content(tok.image)
            .indivisible(false)
            .tags([tag])
            .build()
        if (hov !== undefined) {
            addHoverInfo(unit, hov)
            hov = undefined
        }
        result.unshift(unit)
        if (tag === UnitType.REF)
            refUnit = unit
    })
    /**
     * Step2: Add the resolve information to the units.
     */
    const path = PathBuilder
        .buildFromString(image.substring(1, image.length - 1))
    if (isException(path) || refUnit === undefined)
        return result
    const nodes = resolve(path, loc)
    if (nodes.length === 0) {
        result.forEach(unit => addTag(unit, UnitType.UNDEFINED_REF))
        addHoverInfo(refUnit, undefinedRefInfo())
    } else if (nodes.length > 1) {
        addTag(refUnit, UnitType.MULTI_REF)
        addHoverInfo(refUnit, multiNodesInfo(nodes))
    } else {
        const target = nodes[0]
        const tag = getRefTag(target, loc)
        addTag(refUnit, tag)
        addHoverInfo(refUnit, singleNodeInfo(target))
    }
    return result
}

function addTag(unit: EditorDisplayUnit, tag: UnitType): void {
    // tslint:disable-next-line: no-type-assertion
    const writable = unit as Writable<EditorDisplayUnit>
    if (!unit.tags.includes(tag))
        writable.tags = [...unit.tags, tag]
}

function addHoverInfo(unit: EditorDisplayUnit, info: HoverInfo): void {
    // tslint:disable-next-line: no-type-assertion
    const writable = unit as Writable<EditorDisplayUnit>
    writable.hoverInfo = info
}

/**
 * Get the tag indicating where the reference is from.
 */
export function getRefTag(
    target: Readonly<Node>,
    base: Readonly<Node>,
): UnitType {
    if (target.uuid === base.uuid)
        return UnitType.SELF
    if (base.findParent(NodeType.TABLE) === target.findParent(NodeType.TABLE))
        return UnitType.THIS_TABLE
    if (base.findParent(NodeType.SHEET) === target.findParent(NodeType.SHEET))
        return UnitType.THIS_SHEET
    return UnitType.OTHER_SHEET
}

/**
 * Given a outer displayed pattern and an outer offset, get the inner offset.
 */
export function convertInnerOffset(
    outerText: readonly EditorDisplayUnit[],
    outer: number,
): number {
    if (outer === 0)
        return 0
    let target = outer
    let currOffset = 0
    for (const unit of outerText) {
        let oldTarget = target
        if (unit.indivisible)
            target -= unit.content.length - 1
        else if (unit.tags.includes(UnitType.READ_BUFFER)) {
            oldTarget = target
            target += unit.buffer.length - unit.content.length
        }
        currOffset += oldTarget === target ?
            unit.content.length :
            unit.buffer.length
        if (currOffset > target)
            // '{'
            return unit.tags.includes(UnitType.REF) && target !== oldTarget ?
                oldTarget + 1 : oldTarget
        if (currOffset === target)
            return target
    }
    return target
}

export function convertOuterOffset(
    text: readonly (string | EditorDisplayUnit)[],
    inner: number,
): number {
    if (inner < 0)
        return inner
    let currOffset = 0
    let outerOffset = 0
    while (currOffset < inner && currOffset < text.length) {
        const c = text[currOffset]
        if (typeof c === 'string')
            outerOffset += c.length
        else
            outerOffset += c.content.length
        currOffset += 1
    }
    return outerOffset
// tslint:disable-next-line: max-file-line-count
}
