export const PAGINATOR_PER_PAGE_LABEL = '每页显示 : '
export const PAGINATOR_NEXT_PAGE_LABEL = '下一页'
export const PAGINATOR_PREV_PAGE_LABEL = '上一页'

export function getRangeLabel(
    page: number,
    pageSize: number,
    length: number,
): string {
    if (length === 0 || pageSize === 0)
        return `0 共 ${length}`
    const start = page * pageSize
    const end = start < length ? Math.min(start + pageSize, length) :
        start + pageSize
    return `${start + 1} - ${end} 共 ${length}`
}

export function getRangeLabelWithoutTatol(
    page: number,
    pageSize: number,
    length: number,
): string {
    if (length === 0 || pageSize === 0)
        return '0'
    const start = page * pageSize
    const end = start < length ? Math.min(start + pageSize, length) :
        start + pageSize
    return `${start + 1} - ${end}`
}
