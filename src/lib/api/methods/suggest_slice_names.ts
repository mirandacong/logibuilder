import {
    FormulaBearer,
    getSubnodes,
    isRow,
    isTable,
    Node,
} from '@logi/src/lib/hierarchy/core'

export function suggestSliceNames(
    fb: Readonly<FormulaBearer>,
    currSliceName: string,
): readonly string[] {
    const table = fb.getTable()
    if (!isTable(table))
        return []
    const labels: string[] = []
    const cols: string[] = []
    const fbs = isRow(fb) ? table.cols : table.rows
    const queue: Readonly<Node>[] = [...fbs]
    while (queue.length !== 0) {
        const first = queue[0]
        labels.push(...first.labels)
        cols.push(first.name)
        queue.splice(0, 1)
        const subNodes = getSubnodes(first)
        queue.push(...subNodes)
    }
    const options: string[] = [...labels, ...cols]
    const sliceNames = fb.sliceExprs
        .map(s => s.name)
        .filter(s => s !== currSliceName)
    return Array
        .from(new Set(options))
        .filter(o => !sliceNames.includes(o) && o !== '')
}
