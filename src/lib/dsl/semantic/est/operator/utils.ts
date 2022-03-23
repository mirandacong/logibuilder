import {isException} from '@logi/base/ts/common/exception'
import {Op, OP_REGISTRY, SubOpInfo} from '@logi/src/lib/compute/op'
import {Column, isRow, Row, toDateRange} from '@logi/src/lib/hierarchy/core'

import {
    CellCoordinate,
    FormulaInfo,
    Head,
    HEADLESS,
    Headless,
    OpAndInNodes,
} from '../node'

/**
 * Get the builtin op via a name.
 */
export function getOp(name: string): Readonly<Op> {
    const lowerName = name.toLowerCase()
    const alias = OP_MAP.filter(
        (n: readonly [readonly string[], string]): boolean =>
        n[0].includes(lowerName),
    )
    const defaultOp = 'id'
    const id = OP_REGISTRY.get(defaultOp) as Op
    if (alias.length === 0) {
        const result = OP_REGISTRY.get(lowerName)
        return result === undefined ? id : result
    }

    const op = OP_REGISTRY.get(alias[0][1])
    return op === undefined ? id : op
}

const OP_MAP: readonly (readonly [readonly string[], string])[] = [
    [['+'], 'add'],
    [['<>', '!='], 'ne'],
    [['-'], 'sub'],
    [['*'], 'mul'],
    [['/'], 'div'],
    [['>'], 'gt'],
    [['<'], 'lt'],
    [['>='], 'ge'],
    [['<='], 'le'],
    [['='], 'eq'],
    [['::'], 'to'],
    [['&'], 'concat'],
]

/**
 * Convert walkInfoList into subOpInfos
 */
// tslint:disable-next-line: max-func-body-length
export function toSubOpInfos(
    walkInfoList: readonly OpAndInNodes[],
): readonly Readonly<SubOpInfo>[] {
    const set = new Set<string>()
    walkInfoList.forEach((walkInfo: OpAndInNodes): void => {
        walkInfo[1].forEach((
            tuple: readonly [Readonly<Row>, Readonly<Column>],
        ): void => {
            set.add(`${tuple[0].uuid}-${tuple[1].uuid}`)
        })
    })
    const list = Array.from(set)

    return walkInfoList.map((info: OpAndInNodes): Readonly<SubOpInfo> => {
        const op = info[0]
        // If the op is undefined, we can infer that there is no atomic in expr
        // and there is only one element in expr list, this element is a ref
        // cst.
        if (op === undefined) {
            const tuple = info[1][0]
            /**
             * Safe to use type assertion below, `getPath` always
             * return a abs path, there will not return an exception
             * when join two abs nodes.
             */

            return list.indexOf(`${tuple[0].uuid}-${tuple[1].uuid}`)
        }
        const argMap: number[] = info[1].map(
            (tuple: readonly [Readonly<Row>, Readonly<Column>]): number =>
                /**
                 * Safe to use type assertion below, `getPath` always
                 * return a abs path, there will not return an exception
                 * when join two abs nodes.
                 */
                list.indexOf(`${tuple[0].uuid}-${tuple[1].uuid}`),
        )

        return [op, argMap] as Readonly<SubOpInfo>
    })
}

/**
 * Make a intersect of two headers.
 * NOTE: the intersect of two headers is not `absolutely equal`, please see
 * `equals` for more information, so the return header is the objects in first
 * parameter `h1`.
 * The impl of `FormulaBearer.intersectHeader`.
 * Decompose this function because the `est` need this function.
 */
export function intersect(
    h1: readonly (Head | Headless)[],
    h2: readonly (Head | Headless)[],
): readonly (Headless | Head)[] {
    if (h1.length === 0 || h2.length === 0)
        return []
    if (h1[0] === HEADLESS && h2[0] === HEADLESS)
        return [HEADLESS]
    if (h1[0] === HEADLESS || h2[0] === HEADLESS)
        return h1[0] === HEADLESS ? h2 as Head[] : h1 as Head[]
    const result: Head[] = []

    const header1 = h1 as Head[]
    const header2 = h2 as Head[]
    header1.forEach((p: Head): void => {
        if (header2.find((l: Head): boolean => equals(p, l)) !== undefined)
            result.push(p)
    })

    return result
}

/**
 * Check a value is included by values array or not.
 */
export function isIncluded(
    values: readonly CellCoordinate[],
    v: CellCoordinate,
): boolean {
    return values.find((j: CellCoordinate): boolean =>
        v[0] === j[0] && v[1] === j[1]) !== undefined
}

export function findFormulaInfo(
    infos: readonly FormulaInfo[],
    head: Head | Headless,
): FormulaInfo | undefined {
    if (head === HEADLESS)
        return infos.length === 1 && infos[0].head === HEADLESS ?
            infos[0] : undefined
    // tslint:disable-next-line: no-loop-statement
    for (const info of infos)
        // Safe to use type assertion as we have checked below.
        if (equals(info.head as Head, head))
            return info
    return
}

/**
 * So far the condition of `equals` is that
 *      1. Get the path of `l1` and `l2`.
 *      2. Cur out the `l1` and `l2` path from `Row(Column)Block` to
 *         `Row`, for example, a path of `l1` is `book/sheet/row block1/row
 *         block2/row`, the result is `row block1/row block2/row`.
 *      3. Compare the string of two results.
 *
 * NOTE: Export this function only for test.
 */
export function equals(l1: Head, l2: Head): boolean {
    /**
     * Only the row headers at the same table can be matched.
     */
    if (isRow(l1) && isRow(l2))
        return l1 === l2
    if (l1.uuid === l2.uuid)
        return true
    if (l1.nodetype !== l2.nodetype)
        return false
    const range1 = toDateRange(l1)
    const range2 = toDateRange(l2)
    if (isException(range1) && isException(range2))
        return l1.name === l2.name
    if (isException(range1) || isException(range2))
        return false
    return (range1.start === range2.start) && (range1.end === range2.end)
}
