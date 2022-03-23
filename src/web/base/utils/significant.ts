/**
 * Set the number of significant figures
 * @param num cell value
 */
export function setSignificant(num: number): string {
    if (isNaN(num) || num === 0)
        return '-'
    const absNum = Math.abs(num)
    const formattedNum = Number(absNum.toFixed(2)).toLocaleString('en-US')
    return num < 0 ? `(${formattedNum})` : formattedNum
}
