import {FormulaBearer, SliceExpr} from '@logi/src/lib/hierarchy/core'

export function canMoveSlicesVertically(
    fb: Readonly<FormulaBearer>,
    slices: readonly Readonly<SliceExpr>[],
    isUp: boolean,
): boolean {
    const allSlices = fb.sliceExprs
    for (const s of slices)
        if (allSlices.indexOf(s) < 0)
            return false
    const compare = isUp
        ? allSlices.slice(0, slices.length)
        : allSlices.slice(allSlices.length - slices.length)
    return !compare.every((s: Readonly<SliceExpr>): boolean =>
        slices.includes(s))
}
