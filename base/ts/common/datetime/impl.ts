// tslint:disable: max-classes-per-file
/**
 * This datetime is same with datetime in python.
 *      https://docs.python.org/3/library/datetime.html
 *      https://github.com/python/cpython/blob/master/Lib/datetime.py
 */

// tslint:disable-next-line: no-wildcard-import
import {Builder} from '@logi/base/ts/common/builder'
import {
    Date,
    DateBuilder,
    DateDelta,
    DateDeltaBuilder,
    Weekday,
} from '@logi/base/ts/common/date'
import {Exception, ExceptionBuilder} from '@logi/base/ts/common/exception'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {
    Time,
    TimeBuilder,
    TimeDelta,
    TimeDeltaBuilder,
} from '@logi/base/ts/common/time'

export interface Datetime extends Date, Time, DatetimeDelta {
    readonly time: Time
    readonly date: Date
}

export interface DatetimeDelta extends DateDelta, TimeDelta {
    readonly time: TimeDelta
    readonly date: DateDelta
    toIsoString(): string
}

class DatetimeDeltaImpl implements DatetimeDelta {
    public time!: Time
    public date!: Date
    // tslint:disable-next-line: no-unnecessary-method-declaration
    public toIsoString(): string {
        /**
         * See https://github.com/iamkun/dayjs/blob/17221ec149161e5e87a7b34fb8562d3781913216/src/plugin/duration/index.js#L84
         */
        const year = this.year ? `${this.year}Y` : ''
        const month = this.month ? `${this.month}M` : ''
        const day = this.day ? `${this.day}D` : ''
        const hour = this.hour ? `${this.hour}H` : ''
        const min = this.minute ? `${this.minute}M` : ''
        let seconds = this.second || 0
        if (this.millisecond)
            // tslint:disable-next-line: no-magic-numbers
            seconds += this.millisecond / 1000
        const sec = seconds ? `${seconds}S` : ''
        const time = (hour || min || sec) ? 'T' : ''
        const result = `P${year}${month}${day}${time}${hour}${min}${sec}`
        return result === 'P' ? 'P0D' : result
    }

    public get year(): number {
        return this.date.year
    }

    public get month(): number {
        return this.date.month
    }

    public get day(): number {
        return this.date.day
    }

    public get hour(): number {
        return this.time.hour
    }

    public get minute(): number {
        return this.time.minute
    }

    public get second(): number {
        return this.time.second
    }

    public get millisecond(): number {
        return this.time.millisecond
    }

    public get microsecond(): number {
        return this.time.microsecond
    }
}

class DatetimeImpl extends DatetimeDeltaImpl implements Datetime {
    public time!: Time
    public date!: Date
    public get weekday(): Weekday {
        return this.date.weekday
    }
}

abstract class BaseDatetimeBuilder<
    T extends DatetimeDelta, S extends Impl<T>> extends Builder<T, S> {
    public abstract timeBuilder: TimeBuilder | TimeDeltaBuilder
    public abstract dateBuilder: DateBuilder | DateDeltaBuilder
    public year(year: number): this {
        this.dateBuilder.year(year)
        return this
    }

    public month(month: number): this {
        this.dateBuilder.month(month)
        return this
    }

    public day(day: number): this {
        this.dateBuilder.day(day)
        return this
    }

    public hour(hour: number): this {
        this.timeBuilder.hour(hour)
        return this
    }

    public minute(minute: number): this {
        this.timeBuilder.minute(minute)
        return this
    }

    public second(second: number): this {
        this.timeBuilder.second(second)
        return this
    }

    public millisecond(millisecond: number): this {
        this.timeBuilder.millisecond(millisecond)
        return this
    }

    public microsecond(microsecond: number): this {
        this.timeBuilder.microsecond(microsecond)
        return this
    }

    protected preBuildHook(): void {
        const time = this.timeBuilder.build()
        const date = this.dateBuilder.build()
        this.getImpl().time = new TimeBuilder()
            .hour(time.hour)
            .minute(time.minute)
            .second(time.second)
            .millisecond(time.millisecond)
            .microsecond(time.microsecond)
            .build()
        this.getImpl().date = new DateBuilder()
            .year(date.year)
            .month(date.month)
            .day(date.day)
            .build()
    }
}

/**
 * See https://github.com/iamkun/dayjs/blob/17221ec149161e5e87a7b34fb8562d3781913216/src/plugin/duration/index.js#L6
 */
// tslint:disable-next-line: ter-max-len
const DURATION_REGEX = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/

export class DatetimeBuilder extends
    BaseDatetimeBuilder<Datetime, DatetimeImpl> {
    public constructor() {
        super(new DatetimeImpl())
    }
    public timeBuilder = new TimeBuilder()
    public dateBuilder = new DateBuilder()
}

export class DatetimeDeltaBuilder extends
    BaseDatetimeBuilder<DatetimeDelta, DatetimeImpl> {
    public constructor() {
        super(new DatetimeImpl())
    }
    public timeBuilder = new TimeDeltaBuilder()
    public dateBuilder = new DateDeltaBuilder()
    public fromIsoString(str: string): this {
        const d = str.match(DURATION_REGEX)
        if (d === null)
            return this
        // tslint:disable: no-magic-numbers
        const year = Number(d[2] ?? 0)
        const month = Number(d[3] ?? 0)
        const day = Number(d[5] ?? 0)
        const hour = Number(d[6] ?? 0)
        const minute = Number(d[7] ?? 0)
        const seconds = Number(d[8] ?? 0)
        const sec = Math.floor(seconds)
        const millisec = seconds * 1000 - sec * 1000
        this
            .year(year)
            .month(month)
            .day(day)
            .hour(hour)
            .minute(minute)
            .second(sec)
            .millisecond(millisec)
        return this
    }
}

export function isDatetimeDelta(obj: unknown): obj is DatetimeDelta {
    return obj instanceof DatetimeDeltaImpl
}

/**
 * Export this function only for test.
 */
export function toTimeDelta(dateTime: string): DatetimeDelta | Exception {
    const yearRegexp = /^(\d+)y$/g
    const halfYearRegexp = /^(\d+)hy$/g
    const quarterRegexp = /^(\d+)q$/g
    const monthRegexp = /^(\d+)m$/g
    const dayRegexp = /^(\d+)d$/g
    const lowercaseDate = dateTime.toLowerCase()
    const yearMatch = yearRegexp.exec(lowercaseDate)
    if (yearMatch !== null)
        return new DatetimeDeltaBuilder().year(Number(yearMatch[1])).build()
    const halfYearMatch = halfYearRegexp.exec(lowercaseDate)
    if (halfYearMatch !== null) {
        const halfYearToMonth = 6
        return new DatetimeDeltaBuilder()
            .month(Number(halfYearMatch[1]) * halfYearToMonth)
            .build()
    }
    const quarterMatch = quarterRegexp.exec(lowercaseDate)
    if (quarterMatch !== null) {
        const quarterToMonth = 3
        return new DatetimeDeltaBuilder()
            .month(Number(quarterMatch[1]) * quarterToMonth)
            .build()
    }
    const monthMatch = monthRegexp.exec(lowercaseDate)
    if (monthMatch !== null)
        return new DatetimeDeltaBuilder().month(Number(monthMatch[1])).build()
    const dayMatch = dayRegexp.exec(lowercaseDate)
    if (dayMatch !== null)
        return new DatetimeDeltaBuilder().day(Number(dayMatch[1])).build()
    return new ExceptionBuilder()
        .message(`The datetime ${dateTime} is not a valid format.`)
        .build()
}
