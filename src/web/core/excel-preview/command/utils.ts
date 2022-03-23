// tslint:disable-next-line: ter-max-len
// tslint:disable-next-line: no-import-side-effect no-wildcard-import ordered-imports
import * as GC from '@grapecity/spread-sheets'

import GcSpread = GC.Spread.Sheets

export function isSameColSelection(
    selections: readonly GcSpread.Range[],
): boolean {
    for (let i = 0; i < selections.length - 1; i += 1)
        if (
            selections[i].rowCount !== selections[i + 1].rowCount ||
            selections[i].row !== selections[i + 1].row
        )
            return false
    return true
}

export function isSameRowSelection(
    selections: readonly GcSpread.Range[],
): boolean {
    for (let i = 0; i < selections.length - 1; i += 1)
        if (
            selections[i].colCount !== selections[i + 1].colCount ||
            selections[i].col !== selections[i + 1].col
        )
            return false
    return true
}

export function getLeftMostSelection(
    selections: readonly GcSpread.Range[],
): GcSpread.Range {
    let sel = selections[0]
    for (let i = 1; i < selections.length; i += 1)
        if (selections[i].col < sel.col)
            sel = selections[i]
    return sel
}
