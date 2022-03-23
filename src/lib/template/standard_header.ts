import {Builder} from '@logi/base/ts/common/builder'

export enum UnitEnum {
    UNIT_UNSPECIFIED = 0,
    /**
     * `亿元`
     */
    HUNDRED_MILLION = 1,
    /**
     * `百万元`
     */
    MILLION = 2,
    /**
     * `万元`
     */
    TEN_THOUSAND = 3,
}

export interface ReportDate {
    readonly year: number
    readonly month: number
    readonly day: number
}

class ReportDateImpl implements ReportDate {
    public year = 0
    public month = 0
    public day = 0
}

export class ReportDateBuilder extends Builder<ReportDate, ReportDateImpl> {
    public constructor(obj?: Readonly<ReportDate>) {
        const impl = new ReportDateImpl()
        if (obj)
            ReportDateBuilder.shallowCopy(impl, obj)
        super(impl)
    }

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
        return ReportDateBuilder.__DAA_PROPS__
    }

    protected static readonly __DAA_PROPS__: readonly string[] = [
        'year',
        'month',
        'day',
    ]
}

export function isReportDate(value: unknown): value is ReportDate {
    return value instanceof ReportDateImpl
}

export function assertIsReportDate(
    value: unknown
): asserts value is ReportDate {
    if (!(value instanceof ReportDateImpl))
        throw Error('Not a ReportDate!')
}

export enum Frequency {
    FREQUENCY_UNSPECIFIED = 0,
    QUARTER = 1,
    HALF_YEAR = 2,
    YEAR = 3,
    MONTH = 4,
}
/**
 * The frequency type and year range of the header.
 */
export interface HeaderInfo {
    readonly startYear: number
    readonly endYear: number
    readonly frequency: Frequency
    /**
     * Allow empty, H1~H2 or Q1~Q4
     */
    readonly startMonth: string
    /**
     * Allow empty, H1~H2 or Q1~Q4
     */
    readonly endMonth: string
}

class HeaderInfoImpl implements HeaderInfo {
    public startYear = 0
    public endYear = 0
    public frequency = 0
    public startMonth = ''
    public endMonth = ''
}

export class HeaderInfoBuilder extends Builder<HeaderInfo, HeaderInfoImpl> {
    public constructor(obj?: Readonly<HeaderInfo>) {
        const impl = new HeaderInfoImpl()
        if (obj)
            HeaderInfoBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public startYear(startYear: number): this {
        this.getImpl().startYear = startYear
        return this
    }

    public endYear(endYear: number): this {
        this.getImpl().endYear = endYear
        return this
    }

    public frequency(frequency: Frequency): this {
        this.getImpl().frequency = frequency
        return this
    }

    public startMonth(startMonth: string): this {
        this.getImpl().startMonth = startMonth
        return this
    }

    public endMonth(endMonth: string): this {
        this.getImpl().endMonth = endMonth
        return this
    }

    protected get daa(): readonly string[] {
        return HeaderInfoBuilder.__DAA_PROPS__
    }

    protected static readonly __DAA_PROPS__: readonly string[] = [
        'startYear',
        'endYear',
        'frequency',
    ]
}

export function isHeaderInfo(value: unknown): value is HeaderInfo {
    return value instanceof HeaderInfoImpl
}

export function assertIsHeaderInfo(
    value: unknown,
): asserts value is HeaderInfo {
    if (!(value instanceof HeaderInfoImpl))
        throw Error('Not a HeaderInfo!')
}
export interface StandardHeader {
    readonly name: string
    readonly reportDate: ReportDate
    /**
     * We can have quarter, half year or year header infos.
     */
    readonly headerInfos: readonly HeaderInfo[]
    readonly unit: UnitEnum
    equals(another: StandardHeader): boolean
}

class StandardHeaderImpl implements StandardHeader {
    public name = ''
    public reportDate!: ReportDate
    public headerInfos: readonly HeaderInfo[] = []
    public unit = 0
    public equals(another: StandardHeader): boolean {
        if (this.name != another.name)
            return false
        if (this.unit != another.unit)
            return false
        const ra = this.reportDate
        const rb = another.reportDate
        if (ra.day != rb.day || ra.month != rb.month || ra.year != rb.year)
            return false
        if (this.headerInfos.length != another.headerInfos.length)
            return false
        for (let i = 0; i < this.headerInfos.length; i ++) {
            const ha = this.headerInfos[i]
            const hb = another.headerInfos[i]
            if (ha.frequency != hb.frequency || ha.startYear != hb.startYear ||
                ha.endYear != hb.endYear || ha.startMonth != hb.startMonth ||
                ha.endMonth != hb.endMonth)
                return false
        }
        return true
    }
}

export class StandardHeaderBuilder extends Builder<StandardHeader, StandardHeaderImpl> {
    public constructor(obj?: Readonly<StandardHeader>) {
        const impl = new StandardHeaderImpl()
        if (obj)
            StandardHeaderBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public reportDate(reportDate: ReportDate): this {
        this.getImpl().reportDate = reportDate
        return this
    }

    public headerInfos(headerInfos: readonly HeaderInfo[]): this {
        this.getImpl().headerInfos = headerInfos
        return this
    }

    public unit(unit: UnitEnum): this {
        this.getImpl().unit = unit
        return this
    }

    protected get daa(): readonly string[] {
        return StandardHeaderBuilder.__DAA_PROPS__
    }

    protected static readonly __DAA_PROPS__: readonly string[] = [
        'reportDate',
    ]
}

export function isStandardHeader(value: unknown): value is StandardHeader {
    return value instanceof StandardHeaderImpl
}

export function assertIsStandardHeader(
    value: unknown,
): asserts value is StandardHeader {
    if (!(value instanceof StandardHeaderImpl))
        throw Error('Not a StandardHeader!')
}
