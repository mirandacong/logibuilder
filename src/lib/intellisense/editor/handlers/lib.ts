import {isException} from '@logi/base/ts/common/exception'
import {
    isFormulaBearer,
    Node,
    PathBuilder,
    resolve,
} from '@logi/src/lib/hierarchy/core'

import {toOuterText} from '../display/convert'
import {
    EditorDisplayUnit,
    EditorDisplayUnitBuilder,
} from '../display/textbox/unit'
import {UnitType} from '../display/textbox/unit_type'

/**
 * Return the editor display units when the textbox blurs.
 *
 * - Ellipsis the path and the brackets
 */
// tslint:disable-next-line: max-func-body-length
export function getBlurDisplay(
    units: readonly EditorDisplayUnit[],
): readonly EditorDisplayUnit[] {
    let buffer: EditorDisplayUnit[] = []
    let orig: EditorDisplayUnit | undefined
    let start = false
    const result: EditorDisplayUnit[] = []
    // tslint:disable-next-line: cyclomatic-complexity max-func-body-length
    units.forEach((unit: EditorDisplayUnit): void => {
        if (unit.tags.includes(UnitType.IDENTIFIER) &&
            !unit.tags.includes(UnitType.UNEXPECTED_END_ERROR)) {
            const content = unit.content.startsWith('.')
                ? unit.content.toLowerCase()
                : unit.content.toUpperCase()
            const u = new EditorDisplayUnitBuilder(unit)
                .content(content)
                .build()
            result.push(u)
            return
        }
        if (unit.tags.includes(UnitType.REF_EXPR_OP))
            start = true
        if (!start ||
            (orig !== undefined && (unit.tags.includes(UnitType.SELECTOR ||
                unit.tags.includes(UnitType.COMMA))))) {
            result.push(unit)
            return
        }
        if (orig !== undefined && unit.tags.includes(UnitType.LABEL_OP)) {
            const u = new EditorDisplayUnitBuilder(orig)
                .buffer(buffer.map(n => n.content).join(''))
                .tags([...orig.tags, UnitType.READ_BUFFER])
                .build()
            result.push(u)
            result.push(unit)
            buffer = []
            return
        }
        buffer.push(unit)
        if (unit.tags.includes(UnitType.REF)) {
            orig = unit
            return
        }
        if (orig !== undefined && unit.tags.includes(UnitType.LABEL_ED))
            orig = unit
        if (unit.tags.includes(UnitType.LABEL_ED)) {
            orig = unit
            return
        }
        if (!unit.tags.includes(UnitType.REF_EXPR_ED))
            return
        if (orig !== undefined) {
            const u = new EditorDisplayUnitBuilder(orig)
                .buffer(buffer.map(n => n.content).join(''))
                .tags([...orig.tags, UnitType.READ_BUFFER])
                .build()
            result.push(u)
        } else
            result.push(...buffer)
        orig = undefined
        start = false
        buffer = []
    })
    return result
}

export function string2BlurDisplay(
    expr: string,
    loc: Readonly<Node>,
): readonly EditorDisplayUnit[] {
    const units = toOuterText(expr.split(''), loc)
    return getBlurDisplay(units)
}

/**
 * Find out the path of a reference and resovle the path.
 */
export function traceReference(
    text: readonly (string | EditorDisplayUnit)[],
    offset: number,
    cwd: Readonly<Node>,
): readonly Readonly<Node>[] {
    /**
     * 1. Find out the string between {}.
     * 2. Resovle it.
     */
    let pre = false
    let next = false
    let i = offset
    while (i >= 0) {
        if (typeof text[i - 1] !== 'string')
            return []
        if (text[i - 1] === '{') {
            pre = true
            break
        }
        i -= 1
    }
    let j = offset
    while (j <= text.length + 1) {
        if (typeof text[j] !== 'string')
            return []
        if (text[j + 1] === '}') {
            next = true
            break
        }
        j += 1
    }
    if (!pre || !next)
        return []
    const pathString = text.slice(i, j + 1).join('')
    const path = PathBuilder.buildFromString(pathString)
    if (isException(path))
        return []
    return resolve(path, cwd).filter(isFormulaBearer)
}
