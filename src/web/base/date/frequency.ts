import {getQuarter} from './month'

export type DateFreq = 'day' | 'week' | 'month' | 'quarter' | 'halfYear' | 'year'

/**
 * T4059
 */
const ONE_DAY_MS = 24 * 60 * 60 * 1000
const ONE_WEEK_MS = 7 * ONE_DAY_MS

/**
 * current和selected都是特定频度下的日期
 * 返回selected相对于current的偏移量
 */
export function getDistanceByDates(
    current: Date,
    selected: Date,
    freq: DateFreq,
): number {
    switch (freq) {
    case 'year': {
        const selectYear = selected.getFullYear()
        const baseYear = current.getFullYear()
        return (selectYear - baseYear)
    }
    case 'halfYear': {
        const getHalfYearIndex = (d: Date) => (d.getMonth() + 1) < 7 ? 0 : 1
        const getHalfYears = (d: Date) =>
            (d.getFullYear() - 1) * 2 + getHalfYearIndex(d)
        return (getHalfYears(selected) - getHalfYears(current))
    }
    case 'quarter': {
        const getQuarters = (d: Date) => getQuarter(d.toString())
            + (d.getFullYear() - 1) * 4
        return (getQuarters(selected) - getQuarters(current))
    }
    case 'month': {
        const getMonths = (d: Date) => (d.getFullYear() - 1) * 12 + d.getMonth()
        return getMonths(selected) - getMonths(current)
    }
    case 'week': {
        const getWeeks = (d: Date) => Math.round(d.getTime() / ONE_WEEK_MS)
        return getWeeks(selected) - getWeeks(current)
    }
    case 'day': {
        const getDates = (d: Date) => Math.round(d.getTime() / ONE_DAY_MS)
        return getDates(selected) - getDates(current)
    }
    default: return 0
    }
}

const MONTH_WEIGHT_MAP = new Map<DateFreq, number>([
    ['year', 12],
    ['halfYear', 6],
    ['quarter', 3],
    ['month', 1],
])

/**
 * 该方法根据当前时间 + 频率 + 长度, 计算出相对的财报日
 * 如 curr 为 2021-09-30(当天还未过完), freq为季度
 *  - distance 为 0 时返回 2021-06-30
 *  - distance 为 1 时返回 2021-09-30
 */
export function getDateByDistance(
    current: Date,
    distance: number,
    freq: DateFreq,
): Date {
    switch (freq) {
    case 'year':
    case 'halfYear':
    case 'quarter':
    case 'month': {
        const monthWeight = MONTH_WEIGHT_MAP.get(freq) ?? 0
        const baseMon = Math
            .floor(current.getMonth() / monthWeight) * monthWeight + monthWeight
        const base = new Date(current)
        base.setMonth(baseMon - 1)
        base.setDate(1)
        base.setMonth(base.getMonth() + 1 + (distance - 1) * monthWeight)
        base.setTime(base.getTime() - ONE_DAY_MS)
        return base
    }
    case 'week': {
        const targetTime = current.getTime() + (distance - 1) * ONE_WEEK_MS
        const target = new Date(targetTime)
        const offset = 5 - target.getDay()
        return new Date(target.getTime() + offset * ONE_DAY_MS)
    }
    case 'day': {
        const base = new Date(current)
        base.setDate(base.getDate() + distance - 1)
        return base
    }
    default: return current
    }
}

/**
 * 该方法根据当前时间和频率, 计算出最近的财报日
 * 如果今天 now 是 2021-09-30, 频率为季度, 那么最近财报日应是 2021-06-30
 */
export function getLatestDateFromNow(now: Date, freq: DateFreq): Date {
    return getDateByDistance(now, 0, freq)
}
