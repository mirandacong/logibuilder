import {assertIsDefined} from '@logi/base/ts/common/assert'
import {add, eq, le, lt, sub} from '@logi/base/ts/common/date'
import {DatetimeBuilder} from '@logi/base/ts/common/datetime'
import {Exception, isException} from '@logi/base/ts/common/exception'
import {
    Column,
    DateRange,
    DateRangeBuilder,
    FormulaBearer,
    Node,
    NodeType,
    Row,
    toDateRange,
} from '@logi/src/lib/hierarchy/core'

import {
    DistanceOp,
    DistanceType,
    Filter,
    FrequencyOp,
    FrequencyType,
    isConstant,
    isDistanceOp,
    isFrequencyOp,
    isLogicalOp,
    isSameTimeOp,
    LogicalOpType,
    SameTimeOp,
    SameType,
} from './op'
import {buildFilter} from './parse'

export function applyRowFilter(
    rows: readonly Readonly<Row>[],
    expr: string,
): Exception | readonly Readonly<Row>[] {
    const filter = buildFilter(expr)
    if (isException(filter))
        return filter
    return rows.filter((r: Readonly<Row>): boolean => matchFilter(r, filter))
}

export function applyColumnFilter(
    cols: readonly Readonly<Column>[],
    expr: string,
    curr?: Readonly<Column>,
): Exception | readonly Readonly<Column>[] {
    const filter = buildFilter(expr)
    if (isException(filter))
        return filter
    let range: DateRange
    if (curr !== undefined) {
        const r = toDateRange(curr)
        if (!isException(r))
            range = r
    }
    return cols.filter((
        c: Readonly<Column>,
    ): boolean => matchFilter(c, filter, range))
}

/**
 * Export this function only for tests.
 */
export function matchFilter(
    fb: Readonly<FormulaBearer>,
    filter: Filter,
    cwd?: DateRange,
): boolean {
    const tags = new Set<string>()
    const types = [
        NodeType.ROW,
        NodeType.COLUMN,
        NodeType.ROW_BLOCK,
        NodeType.COLUMN_BLOCK,
    ]
    let curr: Readonly<Node> = fb
    while (types.includes(curr.nodetype)) {
        tags.add(curr.name.toLowerCase())
        curr.labels.forEach((s: string) => tags.add(s.toLowerCase()))
        if (curr.parent === null)
            break
        // tslint:disable-next-line: no-type-assertion
        curr = curr.parent as Readonly<Node>
    }
    if (cwd === undefined)
        return match(tags, filter)
    const range = toDateRange(fb)
    if (isException(range))
        return false
    return match(tags, filter, cwd, range)
}

// tslint:disable-next-line: cyclomatic-complexity
function match(
    // tslint:disable-next-line: max-params
    tags: Set<string>,
    filter: Filter,
    cwd?: DateRange,
    range?: DateRange,
): boolean {
    if (isConstant(filter))
        return tags.has(filter.value.toLowerCase())
    if (isDistanceOp(filter)) {
        if (cwd === undefined || range === undefined)
            return false
        return matchDistanceOp(filter, cwd, range)
    }
    if (isSameTimeOp(filter)) {
        if (cwd === undefined || range === undefined)
            return false
        return matchSameTimeOp(filter, cwd, range)
    }
    if (isFrequencyOp(filter)) {
        if (range === undefined)
            return false
        return matchFrequencyOp(filter, range)
    }
    if (!isLogicalOp(filter))
        return false
    if (filter.opType === LogicalOpType.NOT) {
        const child = filter.children[0]
        assertIsDefined<Filter>(child)
        return !match(tags, child)
    }
    const c1 = filter.children[0]
    assertIsDefined<Filter>(c1)
    const c2 = filter.children[1]
    assertIsDefined<Filter>(c2)
    if (filter.opType === LogicalOpType.AND)
        return match(tags, c1, cwd, range) && match(tags, c2, cwd, range)
    if (filter.opType === LogicalOpType.OR)
        return match(tags, c1, cwd, range) || match(tags, c2, cwd, range)
    return false
}

/**
 * __dp1y__ Get all cols within one year before the current time, not including
 *          the current time.
 * __dpe1y__ Get all cols within one year before the current time, including the
 *           current time.
 * __dl1y__ Get all cols within one year after the current time, not including
 *          the current time.
 * __dle1y__ Get all cols within one year after the current time, including the
 *           current time.
 * __ds1y__ Get all cols within one year before and after the current time, not
 *           including the current time.
 * __dse1y__ Get all cols within one year before and after the current time,
 *           including the current time.
 */
// tslint:disable-next-line: max-func-body-length
function matchDistanceOp(
    filter: DistanceOp,
    cwd: DateRange,
    range: DateRange,
): boolean {
    const type = filter.distType
    const delta = filter.halfSize.date
    const s = cwd.start.date
    const e = cwd.end.date
    let targetRange!: DateRange
    if (type === DistanceType.PREVIOUS) {
        const ts = sub(s, delta)
        targetRange = new DateRangeBuilder()
            .start(new DatetimeBuilder()
                .year(ts.year)
                .month(ts.month)
                .day(ts.day)
                .build())
            .end(new DatetimeBuilder()
                .year(s.year)
                .month(s.month)
                .day(s.day)
                .build())
            .build()
        return le(targetRange.start, range.start)
            && lt(range.end, targetRange.end)
    }
    if (type === DistanceType.PREVIOUS_OR_EQUAL) {
        const ts = sub(s, delta)
        targetRange = new DateRangeBuilder()
            .start(new DatetimeBuilder()
                .year(ts.year)
                .month(ts.month)
                .day(ts.day)
                .build())
            .end(new DatetimeBuilder()
                .year(e.year)
                .month(e.month)
                .day(e.day)
                .build())
            .build()
        return le(targetRange.start, range.start)
            && le(range.end, targetRange.end)
    }
    if (type === DistanceType.LATTER) {
        const es = add(e, delta)
        targetRange = new DateRangeBuilder()
            .start(new DatetimeBuilder()
                .year(e.year)
                .month(e.month)
                .day(e.day)
                .build())
            .end(new DatetimeBuilder()
                .year(es.year)
                .month(es.month)
                .day(es.day)
                .build())
            .build()
        return lt(targetRange.start, range.start)
            && le(range.end, targetRange.end)
    }
    if (type === DistanceType.LATTER_OR_EQUAL) {
        const es = add(e, delta)
        targetRange = new DateRangeBuilder()
            .start(new DatetimeBuilder()
                .year(s.year)
                .month(s.month)
                .day(s.day)
                .build())
            .end(new DatetimeBuilder()
                .year(es.year)
                .month(es.month)
                .day(es.day)
                .build())
            .build()
        return le(targetRange.start, range.start)
            && le(range.end, targetRange.end)
    }
    if (type === DistanceType.SURROUND) {
        const es = add(e, delta)
        const ts = sub(s, delta)
        targetRange = new DateRangeBuilder()
            .start(new DatetimeBuilder()
                .year(ts.year)
                .month(ts.month)
                .day(ts.day)
                .build())
            .end(new DatetimeBuilder()
                .year(es.year)
                .month(es.month)
                .day(es.day)
                .build())
            .build()
        return le(targetRange.start, range.start)
            && le(range.end, targetRange.end)
            && !(eq(cwd.start, range.start) && eq(cwd.end, range.end))
    }
    if (type === DistanceType.SURROUND_OR_EQUAL) {
        const es = add(e, delta)
        const ts = sub(s, delta)
        targetRange = new DateRangeBuilder()
            .start(new DatetimeBuilder()
                .year(ts.year)
                .month(ts.month)
                .day(ts.day)
                .build())
            .end(new DatetimeBuilder()
                .year(es.year)
                .month(es.month)
                .day(es.day)
                .build())
            .build()
        return le(targetRange.start, range.start)
            && le(range.end, targetRange.end)
    }
    return false
}

/**
 * __sy__ Get the cols those are the same year as the current time.
 * __sq__ Get the cols those are the same quarter as the current time.
 * __sm__ Get the cols those are the same month as the current time.
 * __sr__ Get the cols those are the same frequency as the current time.
 */
function matchSameTimeOp(
    filter: SameTimeOp,
    cwd: DateRange,
    range: DateRange,
): boolean {
    const type = filter.sameType
    if (type === SameType.MONTH || type === SameType.QUATER)
        return cwd.start.month === range.start.month
            && cwd.end.month === range.end.month
    if (type === SameType.YEAR)
        return cwd.start.year === range.start.year
            && cwd.end.year === range.end.year
    if (type === SameType.RANGE) {
        const cwdDayDelta = cwd.end.day - cwd.start.day
        const cwdMonthDelta = cwd.end.month - cwd.start.month
        const cwdYearDelta = cwd.end.year - cwd.start.year
        const rangeDayDelta = range.end.day - range.start.day
        const rangeMonthDelta = range.end.month - range.start.month
        const rangeYearDelta = range.end.year - range.start.year
        return cwdDayDelta === rangeDayDelta
            && cwdMonthDelta === rangeMonthDelta
            && cwdYearDelta === rangeYearDelta
    }
    return true
}

/**
 * __fy__ Get all the columns whose frequency is the year.
 * __fhy__ Get all the columns whose frequency is the half year.
 * __fq__ Get all the columns whose frequency is the quarter.
 * __fm__ Get all the columns whose frequency is the month.
 */
function matchFrequencyOp(filter: FrequencyOp, range: DateRange): boolean {
    const delta = range.end.month - range.start.month + 1
    const frequecnyMap = new Map([
        // tslint:disable: no-magic-numbers
        [FrequencyType.YEAR, 12],
        [FrequencyType.HALF_YEAR, 6],
        [FrequencyType.QUARTER, 3],
        [FrequencyType.MONTH, 1],
    ])
    return frequecnyMap.get(filter.frequencyType) === delta
}
