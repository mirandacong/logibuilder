import {PanelItem, ViewPart, ViewType} from '@logi/src/lib/intellisense'
import {
    getViewPartClass,
} from '@logi/src/web/core/editor/logi-hierarchy/simple-editor/editor_base'

export const PART_MATCHED_CLASS = 'part-matched'

export function getItemString(item: PanelItem): string {
    const parts = item.parts
    const rowPart = parts.find((p: Readonly<ViewPart>): boolean =>
        p.type === ViewType.ROW || p.type === ViewType.COLUMN)
    /**
     * Function parts
     */
    if (rowPart === undefined)
        return parts.map(part => part.content).join('')

    const sortedParts = sortParts(parts)

    /**
     * Just one row part.
     */
    if (sortedParts.length === 1)
        return sortedParts[0].content

    let content = ''
    sortedParts.forEach((p: Readonly<ViewPart>, i: number): void => {
        if (p.type === undefined)
            return
        content += p.content
        if (i !== sortedParts.length - 1)
            content += '!'
    })
    return content
}

/**
 * Parts of `row1: Test model/Control/Revenue Breakup[proj]` will be:
 * [
 *     {content: 'Test Model', type: ViewType.BOOK},
 *     {content: 'Control', type: ViewType.SHEET},
 *     {content: 'Revenue Breakup', type: ViewType.TABLE},
 *     {content: 'row1', type: ViewType.ROW},
 *     {content: 'proj', type: ViewType.ROW_SELECTION},
 * ]
 */
export function renderViewParts(parts: readonly Readonly<ViewPart>[]): string {
    const rowPart = parts.find((p: Readonly<ViewPart>): boolean =>
        p.type === ViewType.ROW || p.type === ViewType.COLUMN)
    /**
     * Function parts
     */
    if (rowPart === undefined)
        return parts.map(matchedPart).join('')

    const sortedParts = sortParts(parts)

    /**
     * Just one row part.
     */
    if (sortedParts.length === 1)
        return matchedPart(sortedParts[0])

    let content = ''
    sortedParts.forEach((p: Readonly<ViewPart>, i: number): void => {
        if (p.type === undefined)
            return
        content += matchedPart(p)
        if (i !== sortedParts.length - 1)
            content += '!'
    })
    return content
}

function sortParts(
    parts: readonly Readonly<ViewPart>[],
): readonly Readonly<ViewPart>[] {
    const sortingParts = parts.slice()
    return sortingParts.sort(
        (prev: Readonly<ViewPart>, next: Readonly<ViewPart>): number => {
            if (prev.type === undefined || next.type === undefined)
                return 1
            if (prev.type === ViewType.ROW || prev.type === ViewType.COLUMN)
                return 1
            if (next.type === ViewType.ROW || next.type === ViewType.COLUMN)
                return -1
            return prev.type - next.type
        },
    )
}

function matchedPart(part: ViewPart): string {
    const clazz = getViewPartClass(part.type)
    if (part.matchedMap === undefined)
        return `<span class='${clazz}'>${part.content}</span>`

    const matched = Array.from(part.matchedMap.values())
    if (matched.length === 0)
        return `<span class='${clazz}'>${part.content}</span>`
    const content = part.content
        .split('')
        .map((c: string, i: number): string => {
            if (matched.includes(i))
                return `<span class='${PART_MATCHED_CLASS}'>${c}</span>`
            return c
        })
        .join('')
    return `<span class='${clazz}'>${content}</span>`
}
