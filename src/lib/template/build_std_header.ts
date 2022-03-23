import {Frequency, HeaderInfo, ReportDate} from './standard_header'
import {
    Column,
    ColumnBlock,
    ColumnBlockBuilder,
    ColumnBuilder,
    Label,
    SliceExpr,
    SliceExprBuilder,
} from '@logi/src/lib/hierarchy/core'

type Header = ColumnBlock

/**
 * Create the header for dcf model.
 * For example, if the report date is 2018.08.01, and start year is 2017, end
 * year is 2018 for each frequency.
 * If frequency is year, the header is
 *      ------------
 *      | 17 | 18E |
 *      ------------
 * If frequency is half year, the header is
 *      ------------------------------
 *      | 17H1 | 17H2 | 18H1 | 18H2E |
 *      ------------------------------
 * If frequency is quarter, the header is
 *      -----------------------------------------------------------
 *      | 17Q1 | 17Q2 | 17Q3 | 17Q4 | 18Q1 | 18Q2 | 18Q3E | 18Q4E |
 *      -----------------------------------------------------------
 * if frequencies are multiple, for example, year and half year, the header is
 *      -----------------------------------------
 *      |             HY             |    FY    |
 *      -----------------------------------------
 *      | 17H1 | 17H2 | 18H1 | 18H2E | 17 | 18E |
 *      -----------------------------------------
 * The order are quarter, half year and year for multiple frequncies.
 */
// tslint:disable-next-line: max-func-body-length
export function buildStdHeader(
    reportDate: ReportDate,
    infos: readonly HeaderInfo[],
): Readonly<Header> {
    const sortedInfos = infos.slice().sort((
        a: HeaderInfo,
        b: HeaderInfo,
    ): number => frequencyLevel(b.frequency) - frequencyLevel(a.frequency))
    const headerCols: (Readonly<Column> | Readonly<ColumnBlock>)[] = []
    // tslint:disable-next-line: max-func-body-length
    sortedInfos.forEach((info: HeaderInfo, idx: number): void => {
        const cols: Readonly<Column>[] = []
        const monthRanges = getMonthRanges(info.frequency)
        const cbName = getColBlockName(info.frequency)
        let projStarted = false
        for (let year = info.startYear; year <= info.endYear; year += 1)
            monthRanges.forEach((month: string): void => {
                if (year === info.startYear &&
                    toMonthRange(month)[1] < toMonthRange(info.startMonth)[1])
                    return
                if (year === info.endYear &&
                    toMonthRange(month)[1] > toMonthRange(info.endMonth)[1])
                    return
                const labels: Label[] = []
                const hist = isHist(year, month, reportDate)
                if (hist)
                    labels.push('历史期')
                else
                    labels.push('预测期')
                if (isCurrent(year, month, reportDate, info.frequency))
                    labels.push(`当期${getLabelSuffix(info.frequency)}`)
                if (!projStarted && !hist) {
                    labels.push(`预测期开始${getLabelSuffix(info.frequency)}`)
                    projStarted = true
                }
                if (!hist && year === info.endYear
                    && toMonthRange(month)[1] ===
                        toMonthRange(info.endMonth)[1])
                    labels.push(`预测期结束${getLabelSuffix(info.frequency)}`)
                const slices = buildSlices(
                    info.frequency,
                    sortedInfos,
                    reportDate,
                    year,
                    month,
                )
                const col = new ColumnBuilder()
                    .name(`${year}${month}${hist ? '' : 'E'}`)
                    .labels(labels)
                    .sliceExprs(slices)
                    .build()
                cols.push(col)
            })
        if (sortedInfos.length === 1) {
            headerCols.push(...cols)
            return
        }
        const cb = new ColumnBlockBuilder().name(cbName).tree(cols).build()
        headerCols.push(cb)
        if (idx !== sortedInfos.length - 1) {
            const emptyCol = new ColumnBuilder().name('').build()
            headerCols.push(emptyCol)
        }
    })
    return new ColumnBlockBuilder().name('').tree(headerCols).build()
}

function getLabelSuffix(frequency: Frequency): string {
    switch (frequency) {
    case Frequency.QUARTER: return '_季度'
    case Frequency.HALF_YEAR: return '_半年度'
    case Frequency.MONTH: return '_月度'
    default:
        return ''
    }
}

function isCurrent(
    // tslint:disable-next-line: max-params
    year: number,
    monthRange: string,
    reportDate: ReportDate,
    frequency: Frequency,
): boolean {
    if (!isHist(year, monthRange, reportDate))
        return false
    let nextMonth = toMonthRange(monthRange)[1]
    switch (frequency) {
    case Frequency.QUARTER:
        // tslint:disable: no-magic-numbers
        nextMonth += 3
        break
    case Frequency.HALF_YEAR:
        nextMonth += 6
        break
    case Frequency.YEAR:
        nextMonth += 12
        break
    case Frequency.MONTH:
        nextMonth += 1
        break
    default:
    }
    let nextYear = year
    if (nextMonth > 12) {
        nextMonth -= 12
        nextYear += 1
    }
    if (nextYear < reportDate.year)
        return false
    if (nextYear > reportDate.year)
        return true
    if (nextMonth < reportDate.month)
        return false
    if (nextMonth > reportDate.month)
        return true
    const endDate = MONTH_END_DAY.get(nextMonth)
    return endDate !== reportDate.day
}

export function isHist(
    year: number,
    monthRange: string,
    reportDate: ReportDate,
): boolean {
    if (year < reportDate.year)
        return true
    if (year > reportDate.year)
        return false
    const month = toMonthRange(monthRange)[1]
    if (month < reportDate.month)
        return true
    if (month > reportDate.month)
        return false
    const endDay = MONTH_END_DAY.get(month)
    return reportDate.day === endDay
}

export const MONTH_END_DAY = new Map<number, number>([
    [1, 31],
    [2, 28],
    [3, 31],
    [4, 30],
    [5, 31],
    [6, 30],
    [7, 31],
    [8, 31],
    [9, 30],
    [10, 31],
    [11, 30],
    [12, 31],
])

/**
 * Get the last month of each month range.
 */
export function toMonthRange(rangeStr: string): readonly [number, number] {
    const q1MonthStart = 1
    const q2MonthStart = 4
    const q3MonthStart = 7
    const q4MonthStart = 10
    const q1MonthEnd = 3
    const q2MonthEnd = 6
    const q3MonthEnd = 9
    const q4MonthEnd = 12
    switch (rangeStr) {
    case 'Q1':
        return [q1MonthStart, q1MonthEnd]
    case 'Q2':
        return [q2MonthStart, q2MonthEnd]
    case 'Q3':
        return [q3MonthStart, q3MonthEnd]
    case 'Q4':
        return [q4MonthStart, q4MonthEnd]
    case 'H1':
        return [q1MonthStart, q2MonthEnd]
    case 'H2':
        return [q3MonthStart, q4MonthEnd]
    case '':
        return [q1MonthStart, q4MonthEnd]
    default:
    }
    const monthReg = /^M(\d{1,2})$/
    const res = rangeStr.match(monthReg)
    if (res === null)
        return [q1MonthStart, q4MonthEnd]
    const m = Number(res[1])
    return [m, m]
}

function buildSlices(
    // tslint:disable-next-line: max-params
    currFreq: Frequency,
    infos: readonly HeaderInfo[],
    reportDate: ReportDate,
    year: number,
    month: string,
): readonly SliceExpr[] {
    const targetHeader = getTargetSliceHeader(currFreq, infos)
    if (targetHeader === undefined)
        return []
    if (!shouldBuildSlice(year, month, targetHeader))
        return []
    const targetMonths = getTargetMonths(month, targetHeader.frequency)
    const cbName = getColBlockName(targetHeader.frequency)
    const refs = targetMonths.map((m: string): string => {
        const eSuffix = isHist(year, m, reportDate) ? '' : 'E'
        return `{${cbName}!${year}${m}${eSuffix}}`
    })
    return [
        new SliceExprBuilder()
            .name('流量')
            .expression(`SUM(${refs.join(', ')})`)
            .build(),
        new SliceExprBuilder()
            .name('存量')
            .expression(refs[refs.length - 1] ?? '')
            .build(),
    ]
}

function getTargetSliceHeader(
    currFreq: Frequency,
    sortedinfos: readonly HeaderInfo[],
): HeaderInfo | undefined {
    for (let i = sortedinfos.length - 1; i >= 0; i -= 1) {
        const info = sortedinfos[i]
        if (frequencyLevel(info.frequency) > frequencyLevel(currFreq))
            return info
    }
    return
}

// tslint:disable-next-line: cyclomatic-complexity
function shouldBuildSlice(
    year: number,
    month: string,
    info: HeaderInfo,
): boolean {
    if (year < info.startYear || year > info.endYear)
        return false
    if (year > info.startYear && year < info.endYear)
        return true
    const currRange = toMonthRange(month)
    if (year === info.startYear) {
        const infoRange = toMonthRange(info.startMonth)
        return currRange[0] >= infoRange[0]
    }
    if (year === info.endYear) {
        const infoRange = toMonthRange(info.endMonth)
        return currRange[1] <= infoRange[1]
    }
    return false
}

function getTargetMonths(month: string, target: Frequency): readonly string[] {
    const monthRanges = getMonthRanges(target)
    const range = toMonthRange(month)
    return monthRanges.filter((str: string): boolean => {
        const currRange = toMonthRange(str)
        return range[0] <= currRange[0] && currRange[1] <= range[1]
    })
}

function getColBlockName(frequency: Frequency): string {
    switch (frequency) {
    case Frequency.MONTH:
        return '月度'
    case Frequency.QUARTER:
        return '季度'
    case Frequency.HALF_YEAR:
        return '半年度'
    case Frequency.YEAR:
        return '年度'
    default:
        return ''
    }
}

function getMonthRanges(frequency: Frequency): readonly string[] {
    switch (frequency) {
    case Frequency.MONTH:
        return ['M1', 'M2', 'M3', 'M4', 'M5', 'M6',
            'M7', 'M8', 'M9', 'M10', 'M11', 'M12']
    case Frequency.QUARTER:
        return ['Q1', 'Q2', 'Q3', 'Q4']
    case Frequency.HALF_YEAR:
        return ['H1', 'H2']
    case Frequency.YEAR:
        return ['']
    default:
        return []
    }
}

function frequencyLevel(frequency: Frequency): number {
    switch (frequency) {
    case Frequency.YEAR:
        return 1
    case Frequency.HALF_YEAR:
        return 2
    case Frequency.QUARTER:
        return 3
    case Frequency.MONTH:
        return 4
    default:
        return 0
    }
}
