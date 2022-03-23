import * as GC from '@grapecity/spread-sheets'
import {
    toA1notation,
    toZeroBasedNotation,
} from '@logi/base/ts/common/index_notation'

export type CoordsRange = readonly [readonly [number, number], readonly [number, number]]

/**
 * Get the a1notation text (like A1:B1) of GC spread sheet range.
 */
export function getA1NotationRange(range: GC.Spread.Sheets.Range): string {
    const {row, col, rowCount, colCount} = range
    const start = `${toA1notation(col)}${row + 1}`
    const end = `${toA1notation(col + colCount - 1)}${row + rowCount}`
    return `${start}:${end}`
}

/**
 *   A  B  C
 * 1
 * 2       *
 * 3
 *
 * C2 => [1, 2]
 * B5 => [4 ,1]
 *
 * return [rowIndex, colIndex]
 * index start with 0.
 */
export function a1NotationToCoord(
    notation: string,
): readonly [number, number] | null {
    const groups = notation.match(/^(?<col>[A-Za-z]+)(?<row>[0-9]+)$/)?.groups
    if (groups === undefined || groups.col === undefined
        || groups.row === undefined || isNaN(Number(groups.row)))
        return null
    if (Number(groups.row) <= 0)
        return null
    const colNotation = groups.col
    const rowNotation = Number(groups.row)
    return [rowNotation - 1, toZeroBasedNotation(colNotation)]
}

/**
 * A2:C4 => [1, 0], [3, 2]]
 */
export function a1NotationsToCoordsRange(
    notations: string,
): CoordsRange | null {
    const a1notations = notations.split(':').map(s => s.trim())
    // tslint:disable-next-line: no-magic-numbers
    if (a1notations.length !== 2)
        return null
    const startNotation = a1notations[0]
    const endNotation = a1notations[1]
    const start = a1NotationToCoord(startNotation)
    const end = a1NotationToCoord(endNotation)
    if (!start || !end)
        return null
    return [
        [Math.min(start[0], end[0]), Math.min(start[1], end[1])],
        [Math.max(start[0], end[0]), Math.max(start[1], end[1])],
    ]
}

export function coordsRangeToA1Notations(coords: CoordsRange): string {
    const row = coords[0][0]
    const rowCount = coords[1][0] - coords[0][0] + 1
    const col = coords[0][1]
    const colCount = coords[1][1] - coords[0][1] + 1
    const start = `${toA1notation(col)}${row + 1}`
    const end = `${toA1notation(col + colCount - 1)}${row + rowCount}`
    return `${start}:${end}`
}
