import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export interface DateDelta {
    readonly year: number
    readonly month: number
    readonly day: number
}

export interface Date extends DateDelta {
    readonly weekday: Weekday
}

class DateImpl implements Date {
    public year = 0
    public month = 0
    public day = 0

    public get weekday(): Weekday {
        const date = new Date(`${this.year}-${this.month}-${this.day}`)
        return date.getDay()
    }
}

abstract class BaseDateBuilder<
    T extends DateDelta, S extends Impl<T>> extends Builder<T, S> {
    public year(year: number): this {
        this.getImpl().year = year
        return this
    }

    public month(month: number): this {
        this.getImpl().month = month
        return this
    }

    public day(day: number): this {
        this.getImpl().day = day
        return this
    }

    protected get daa(): readonly string[] {
        return BaseDateBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'year',
        'month',
        'day',
    ]
}

export class DateBuilder extends BaseDateBuilder<Date, DateImpl> {
    public constructor(obj?: Readonly<Date>) {
        const impl = new DateImpl()
        if (obj)
            DateBuilder.shallowCopy(impl, obj)
        super(impl)
    }
}

export class DateDeltaBuilder extends BaseDateBuilder<DateDelta, DateImpl> {
    public constructor(obj?: Readonly<DateDelta>) {
        const impl = new DateImpl()
        if (obj)
            DateDeltaBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    protected preBuildHook(): void {
        if (this.getImpl().year === undefined)
            this.getImpl().year = 0
        if (this.getImpl().month === undefined)
            this.getImpl().month = 0
        if (this.getImpl().day === undefined)
            this.getImpl().day = 0
    }
}

export const enum Weekday {
    SUN,
    MON,
    TUE,
    WED,
    THU,
    FRI,
    SAT,
}

/**
 * Only add year and month for the date and the date delta.
 * And the day only makes simple calculations and isn't normalized when larget
 * than max day in a month.
 */
export function add(time: Date, delta: DateDelta): Date {
    let newYear = time.year + delta.year
    let newMonth = time.month + delta.month
    const newDay = time.day + delta.day
    const monthCount = 12
    const year = Math.floor((newMonth - 1) / monthCount)
    newMonth = newMonth - year * monthCount
    newYear += year
    return new DateBuilder().year(newYear).month(newMonth).day(newDay).build()
}

/**
 * Only sub year and month for the date and the date delta.
 * And the day only makes simple calculations and isn't normalized when less
 * than min day in a month.
 */
export function sub(time: Date, delta: DateDelta): Date {
    let newYear = time.year - delta.year
    let newMonth = time.month - delta.month
    const newDay = time.day - delta.day
    const monthCount = 12
    const year = Math.floor((newMonth - 1) / monthCount)
    newMonth = newMonth - year * monthCount
    newYear += year
    return new DateBuilder().year(newYear).month(newMonth).day(newDay).build()
}

export function eq(d1: Date, d2: Date): boolean {
    return d1.year === d2.year &&
        d1.month === d2.month &&
        d1.day === d2.day
}

export function lt(d1: Date, d2: Date): boolean {
    if (d1.year < d2.year)
        return true
    if (d1.year > d2.year)
        return false
    if (d1.month < d2.month)
        return true
    if (d1.month > d2.month)
        return false
    if (d1.day < d2.day)
        return true
    return false
}

export function le(d1: Date, d2: Date): boolean {
    if (d1.year < d2.year)
        return true
    if (d1.year > d2.year)
        return false
    if (d1.month < d2.month)
        return true
    if (d1.month > d2.month)
        return false
    if (d1.day > d2.day)
        return false
    return true
}
