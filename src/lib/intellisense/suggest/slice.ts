import {
    Column,
    FormulaBearer,
    isTable,
    Label,
    Row,
} from '@logi/src/lib/hierarchy/core'
import {
    BaseSeekerBuilder,
    EmptyStrategy,
    lcsLenMatch,
    Target,
} from '@logi/src/lib/intellisense/algo'

export function suggestSlice(
    node: Readonly<FormulaBearer>,
    input: string,
): readonly Target[] {
    const table = node.getTable()
    if (!isTable(table))
        return []
    const headers = table.getFbHeader(node)
    const labels: string[] = []
    const seeker = new BaseSeekerBuilder()
        .caseSensitive(false)
        .data(labels)
        .executor(lcsLenMatch)
        .emptyStrategy(EmptyStrategy.EMPTY)
        .build()
    headers.forEach((header: Readonly<Row | Column>): void => {
        header.labels.forEach((l: Label): void => {
            if (typeof l !== 'string')
                return
            if (!labels.includes(l))
                labels.push(l)
        })
    })
    return seeker.seek(input)
}
