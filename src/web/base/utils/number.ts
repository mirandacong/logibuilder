export function normalizeExcelValue(num: number): string {
    if (isNaN(num))
        return '-'
    const absNum = Math.abs(num)
    const formatted = Number(absNum.toFixed(2)).toLocaleString('en-US')
    return num < 0 ? `(${formatted})` : formatted
}

export function isPositiveInteger(value: unknown): boolean {
    if (typeof value !== 'number')
        return false
    return /^\+?([1-9]\d*)$/.test(String(value))
}