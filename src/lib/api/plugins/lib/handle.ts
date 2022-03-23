import {Writable} from '@logi/base/ts/common/mapped_types'
import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {
    DepPayload,
    DepRange,
    isDepPayload,
    isUpdateDepExprPayload,
    isUpdateRdepExprPayload,
    Payload,
} from '@logi/src/lib/api/payloads'
import {
    ALL_TYPES,
    Book,
    FormulaBearer,
    getNodesVisitor,
    isBook,
    isFormulaBearer,
    Node,
    simplifyPath,
    SliceExpr,
    SliceExprBuilder,
} from '@logi/src/lib/hierarchy/core'

import {Replacement, ReplacementBuilder} from './replacement'
import {shallowCopy, updateRoot} from './utils'

export function updateExpr(
    book: Readonly<Book>,
    payloads: readonly Payload[],
): Readonly<Book> {
    const depPayloads = payloads.filter(isDepPayload)
    if (depPayloads.length === 0)
        return book
    const nodesMap = new Map<string, Readonly<Node>>()
    preOrderWalk(book, getNodesVisitor, ALL_TYPES).forEach((
        n: Readonly<Node>,
    ): void => {
        nodesMap.set(n.uuid, n)
    })
    const reps: Replacement[] = []

    const group = new Map<string, DepPayload[]>()
    depPayloads.forEach((p: DepPayload): void => {
        const list = group.get(p.uuid)
        if (list === undefined) {
            group.set(p.uuid, [p])
            return
        }
        list.push(p)
    })

    group.forEach((ps: DepPayload[], uuid: string): void => {
        const original = nodesMap.get(uuid)
        if (original === undefined)
            return
        const substitute = getSubstitute(original, ps, nodesMap)
        const r = new ReplacementBuilder()
            .original(original)
            .substitute(substitute)
            .build()
        reps.push(r)
    })
    const root = updateRoot(reps)
    if (!isBook(root))
        return book
    return root
}

function getSubstitute(
    original: Readonly<Node>,
    payloads: readonly DepPayload[],
    nodesMap: Map<string, Readonly<Node>>,
): Readonly<Node> {
    if (!isFormulaBearer(original))
        return original
    const substitute = shallowCopy(original)
    const payloadForFb: DepPayload[] = []
    const sliceMap = new Map<string, DepPayload[]>()
    payloads.forEach((p: DepPayload): void => {
        if (p.slice === undefined) {
            payloadForFb.push(p)
            return
        }
        const list = sliceMap.get(p.slice)
        if (list === undefined) {
            sliceMap.set(p.slice, [p])
            return
        }
        list.push(p)
    })
    // tslint:disable-next-line: no-type-assertion
    const writable = substitute as Writable<FormulaBearer>
    writable.expression = getNewExpr(
        payloadForFb,
        original,
        original.expression,
        nodesMap,
    )

    // tslint:disable-next-line: no-type-assertion
    const slices = writable.sliceExprs as SliceExpr[]
    sliceMap.forEach((ps: DepPayload[], uuid: string): void => {
        const idx = slices.findIndex(s => s.uuid === uuid)
        if (idx < 0)
            return
        const slice = slices[idx]
        const expr = getNewExpr(ps, original, slice.expression, nodesMap)
        const newSlice = new SliceExprBuilder(slice).expression(expr).build()
        slices.splice(idx, 1, newSlice)
    })

    return substitute
}

function getNewExpr(
    // tslint:disable-next-line: max-params
    payloads: readonly DepPayload[],
    original: Readonly<FormulaBearer>,
    oldExpr: string,
    nodesMap: Map<string, Readonly<Node>>,
): string {
    const refMap: [DepRange, string][] = []
    payloads.forEach((p: DepPayload): void => {
        if (isUpdateRdepExprPayload(p)) {
            const dep = nodesMap.get(p.dep)
            if (!isFormulaBearer(dep))
                return
            const path = simplifyPath(dep, original)
            const ref = `{${path.toString()}}`
            p.ranges.forEach(r => refMap.push([r, ref]))
        } else if (isUpdateDepExprPayload(p))
            p.depMap.forEach((
                [uuid, range]: readonly [string, DepRange],
            ): void => {
                const dep = nodesMap.get(uuid)
                if (!isFormulaBearer(dep))
                    return
                const path = simplifyPath(dep, original)
                const ref = `{${path.toString()}}`
                refMap.push([range, ref])
            })
    })
    const filtered: [DepRange, string][] = []
    refMap.forEach((map: [DepRange, string]): void => {
        const duplicate = filtered.find(f => f[0].start === map[0].start)
        if (duplicate !== undefined)
            return
        filtered.push(map)
    })
    let expr = oldExpr
    filtered.sort((a, b): number => b[0].start - a[0].start).forEach((
        [range, ref]: [DepRange, string],
    ): void => {
        expr = expr.slice(0, range.start) + ref + expr.slice(range.end)
    })
    return expr
}
