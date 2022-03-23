import {Datetime, DatetimeBuilder} from '@logi/base/ts/common/datetime'
import {
    Exception,
    ExceptionBuilder,
    Type,
} from '@logi/base/ts/common/exception'

import {Column} from '../column'
import {isNode, Node} from '../node'
import {Row} from '../row'
import {isTable} from '../table'

import {DateRange, DateRangeBuilder} from './date_range'

/**
 * Convert a head to dateRange, for example the header like following
 *         2016         2017
 *     Q1 Q2 Q3 Q4  Q1 Q2 Q3 Q4
 * Each Q* is a head, so if the input is the Q2 of 2017, the `toDatetime`
 * result is [2017-04-01 to 2017-06-01].
 * We don't use [2017-04-01 to 2017-06-30] because `06-30` add 6 month equals
 * `12-30` but actually we want `12-31` when lead(2q).
 */
export function toDateRange(
    head: Readonly<Row | Column>,
): DateRange | Exception {
    // something like ['2019', 'Q1']
    const timeSeries: string[] = []
    let curr: Readonly<Node> = head
    while (!isTable(curr)) {
        timeSeries.unshift(curr.name)
        if (!isNode(curr.parent))
            break
        curr = curr.parent
    }
    return fromTimeseries(timeSeries)
}

const RANGE_MAP = new Map<string, DateRange>()

/**
 * Export this function only for test.
 */
export function fromTimeseries(
    timeSeries: readonly string[],
): DateRange | Exception {
    const normalized = timeSeries
        .map((s: string): string => s.replace(/e|E/gi, ''))
        .join('')
        .toLowerCase()
        .replace(/^(qr|hy|fy|月度|季度|半年度|年度)/, '')
    const exist = RANGE_MAP.get(normalized)
    if (exist !== undefined)
        return exist
    /**
     * matched[0]: full string
     * matched[1]: year
     * matched[2]: q[1-4] or h[1-2] or fy
     */
    const regex = /^([0-9]+)(q[1-4]|h[1-2]|m[0-9]{1,2}|fy|年)?$/
    const matched = regex.exec(normalized)
    if (matched === null)
        return new ExceptionBuilder()
            .message(`${timeSeries.join('')} 请先设置正确的表格列或设为标量`)
            .type(Type.COL_DATE)
            .build()
    const year = normalizedYear(Number(matched[1]))
    const monthPos = 2
    const monthRange = getMonthRange(matched[monthPos] ?? '')
    const range = new DateRangeBuilder()
        .start(buildDatetime(year, monthRange[0]))
        .end(buildDatetime(year, monthRange[1]))
        .build()
    RANGE_MAP.set(normalized, range)
    return range
}

function buildDatetime(year: number, month: number): Datetime {
    return new DatetimeBuilder()
        .year(year)
        .month(month)
        .day(1)
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .microsecond(0)
        .build()
}

export function normalizedYear(raw: number): number {
    const maxAbbrYear = 99
    if (raw > maxAbbrYear)
        return raw
    const divide = 80
    const currCentury = 2000
    const lastCentury = 1900
    return raw < divide ? currCentury + raw : lastCentury + raw
}

/**
 * Month is q[1-4] or h[1-2] or fy or ''.
 * q1: [1, 3]
 * q2: [4, 6]
 * q3: [7, 9]
 * q4: [10, 12]
 * h1: [1, 6]
 * h2: [7, 12]
 * fy or '': [1, 12]
 */
function getMonthRange(month: string): readonly [number, number] {
    if (month.startsWith('h')) {
        // one half year = six months
        const sixMonths = 6
        const halfStart = sixMonths * (Number(month[1]) - 1) + 1
        const halfDelta = 5
        return [halfStart, halfStart + halfDelta]
    }
    if (month.startsWith('q')) {
        // one quarter = three months
        const threeMonths = 3
        const quarterStart = threeMonths * (Number(month[1]) - 1) + 1
        const quarterDelta = 2
        return [quarterStart, quarterStart + quarterDelta]
    }
    if (month.startsWith('m')) {
        const monthStart = (Number(month.slice(1)))
        return [monthStart, monthStart]
    }
    const yearStart = 1
    const yearEnd = 12
    return [yearStart, yearEnd]
}
