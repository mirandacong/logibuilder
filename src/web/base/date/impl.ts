import Long from 'long'

export function getTime(m: Long | null | undefined): string {
    if (m === undefined)
        return '—'
    if (m === null)
        return '—'
    if (m.lessThanOrEqual(0))
        return '—'
    /**
     * 1s = 1000ms
     */
    // tslint:disable-next-line: no-magic-numbers
    const multi = 1000
    const s = m.toNumber() * multi
    const date = new Date(s)
    const year = date.toISOString().split('T')[0]
    const time = date.toTimeString().split(' ')[0]
    return `${year}` + ` ${time}`
}

export function moreThan(time1: string, time2: string): boolean {
    const date1 = new Date(time1)
    const date2 = new Date(time2)
    if (date1.getFullYear() > date2.getFullYear())
        return true
    if (date1.getMonth() > date2.getMonth())
        return true
    if (date1.getDate() > date2.getDate())
        return true
    return false
}

export interface DateFormatConfig {
    readonly separator: string
    // month和day不足10时是否填充0
    readonly zeroFill: boolean
}

const DEFAULT_DATE_FORMAT_CONFIG: DateFormatConfig = {
    separator: '-',
    zeroFill: true,
}

/**
 * 获取当前日期, 形式如'2021-08-27'
 */
export function getCurrentDate(config = DEFAULT_DATE_FORMAT_CONFIG): string {
    return formatDate(new Date(), config)
}

export function formatDate(
    date: Date,
    config = DEFAULT_DATE_FORMAT_CONFIG,
): string {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    let monthStr = String(month)
    let dayStr = String(day)
    if (month <= 9 && config.zeroFill)
        monthStr = '0' + month
    if (day <= 9 && config.zeroFill)
        dayStr = '0' + day
    return `${year}${config.separator}${monthStr}${config.separator}${dayStr}`
}
