import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core'
import {DateAdapter, NativeDateAdapter} from '@angular/material/core'
import {MatDatepickerInputEvent} from '@angular/material/datepicker'
import {assertIsString} from '@logi/base/ts/common/assert'
import {isString} from '@logi/base/ts/common/type_guard'
import {
    Frequency as FrequencyEnum,
    HeaderInfo,
    HeaderInfoBuilder,
    ReportDate,
    ReportDateBuilder,
    StandardHeader,
    StandardHeaderBuilder,
} from '@logi/src/lib/template'
import {trackByFnReturnItem} from '@logi/src/web/base/track-by'

import {Frequency, FrequencyBuilder} from './frequency'

const FREQUENCY_STR = new Map<FrequencyEnum, string>([
    [FrequencyEnum.YEAR, '年度'],
    [FrequencyEnum.HALF_YEAR, '半年度'],
    [FrequencyEnum.QUARTER, '季度'],
    [FrequencyEnum.MONTH, '月份'],
])

class CUSTOM_DATE_ADAPTER extends NativeDateAdapter {
    public format (date: Date): string {
        const result = `${date.getFullYear()}-${date
            .getMonth() + 1}-${date.getDate()}`
        return result
    }
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{provide: DateAdapter, useClass: CUSTOM_DATE_ADAPTER}],
    selector: 'logi-date-range',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class DateRangeComponent {
    @Input() public set inputDate (value: StandardHeader) {
        if (value === undefined)
            return
        this._initContent(value)
        if (value.reportDate !== undefined)
            this.curDate = new Date(
                value.reportDate.year,
                value.reportDate.month - 1,
                value.reportDate.day)
        this.datepicker = value
        if (value.headerInfos.length === 0)
            return
        value.headerInfos.forEach(this._setHeaderInfoRange.bind(this))
    }
    public constructor(
        private readonly _cd: ChangeDetectorRef,
    ) {
        const droplist: Frequency[] = []
        FREQUENCY_STR.forEach((value, key) => {
            const f = new FrequencyBuilder().id(key).text(value).build()
            droplist.push(f)
        })
        this.dropFreqList = droplist
        this._frequencies = []
    }
    @Output() public readonly outputDate$ = new EventEmitter<StandardHeader>()
    public datepicker!: StandardHeader
    public datePlaceholder = ''
    public curDate = new Date()
    public dropFreqList: readonly Frequency[] = []
    public selectedFreqList: readonly Frequency[] = []
    public trackByReturnItem = trackByFnReturnItem

    public onFinancialDateChange (event: MatDatepickerInputEvent<Date>): void {
        if (event.value === null)
            return
        const day = event.value.getDate()
        const mon = event.value.getMonth()
        const year = event.value.getFullYear()
        this._reportDate = new ReportDateBuilder()
            .year(year)
            .month(mon + 1)
            .day(day)
            .build()
        this._outputInfo()
    }

    // tslint:disable-next-line: readonly-array
    public onFreqChange (frequency: Frequency[]): void {
        this._frequencies = frequency
        this._outputInfo()
    }

    public onHeaderInfoChange (event: HeaderInfo): void {
        this._setHeaderInfoRange(event)
        this._outputInfo()
    }
    // tslint:disable-next-line: readonly-array
    private _frequencies: Frequency[] = []
    private _reportDate!: ReportDate
    private _startYear!: number
    private _endYear!: number
    private _startQuarter!: number
    private _endQuarter!: number
    private _startQuarterMonth!: string
    private _endQuarterMonth!: string
    private _startHalfYear!: number
    private _endHalfYear!: number
    private _startHalfMonth!: string
    private _endHalfMonth!: string

    private _startMYear!: number
    private _endMYear!: number
    private _startMMonth!: string
    private _endMMonth!: string
    private _setFrequency (value: readonly HeaderInfo[]): void {
        this._frequencies.splice(0, this._frequencies.length)
        value.forEach(header => {
            const text = FREQUENCY_STR.get(header.frequency)
            assertIsString(text)
            const frequency = new FrequencyBuilder()
                .id(header.frequency)
                .text(text)
                .build()
            const index = this._frequencies
                .findIndex(f => f.id === frequency.id)
            if (index !== -1)
                return
            this._frequencies.push(frequency)
        })
    }

    private _initContent (value: StandardHeader): void {
        this._setFinancialDate(value.reportDate)
        this._setFrequency(value.headerInfos)
        this.selectedFreqList = this.dropFreqList
            .filter(freq => this._frequencies.some(f => f.id === freq.id))
    }

    private _setFinancialDate (data?: ReportDate): void {
        if (data === undefined) {
            const curr = new Date()
            this.datePlaceholder = `${curr.getFullYear()}-${curr
                .getMonth() + 1}-${curr.getDate()}`
            this._reportDate = new ReportDateBuilder()
                .year(curr.getFullYear())
                .month(curr.getMonth() + 1)
                .day(curr.getDate())
                .build()
            return
        }
        this.datePlaceholder = `${data.year}-${data.month}-${data.day}`
        this._reportDate = data
    }

    // tslint:disable-next-line: max-func-body-length
    private _outputInfo (): void {
        const curr = new Date()
        const startYear = 5
        const endYear = 5
        const info: HeaderInfo[] = []
        // tslint:disable-next-line: max-func-body-length
        this._frequencies.forEach(frequency => {
            const f = frequency.id
            let headerInfo: HeaderInfo
            switch (f) {
            case FrequencyEnum.YEAR:
                headerInfo = new HeaderInfoBuilder()
                    .startYear(this._startYear)
                    .endYear(this._endYear)
                    .frequency(f)
                    .build()
                break
            case FrequencyEnum.HALF_YEAR:
                const syear = this._startHalfYear ?? curr
                    .getFullYear() - startYear
                const eyear = this._endHalfYear ?? curr.getFullYear() + endYear
                const smonth = this._startHalfMonth ?? 'H1'
                const emonth = this._endHalfMonth ?? 'H1'
                headerInfo = new HeaderInfoBuilder()
                    .startYear(syear)
                    .endYear(eyear)
                    .startMonth(smonth)
                    .endMonth(emonth)
                    .frequency(f)
                    .build()
                break
            case FrequencyEnum.QUARTER:
                const sQyear = this._startQuarter ?? curr
                    .getFullYear() - startYear
                const eQyear = this._endQuarter ?? curr.getFullYear() + endYear
                const sQmonth = this._startQuarterMonth ?? 'Q1'
                const eQmonth = this._endQuarterMonth ?? 'Q1'
                headerInfo = new HeaderInfoBuilder()
                    .startYear(sQyear)
                    .endYear(eQyear)
                    .startMonth(sQmonth)
                    .endMonth(eQmonth)
                    .frequency(f)
                    .build()
                break
            case FrequencyEnum.MONTH:
                const sMyear = this._startMYear ?? curr
                    .getFullYear() - startYear
                const eMyear = this._endMYear ?? curr.getFullYear() + endYear
                const sMmonth = this._startMMonth ?? 'M1'
                const eMmonth = this._endMMonth ?? 'M1'
                headerInfo = new HeaderInfoBuilder()
                    .startYear(sMyear)
                    .endYear(eMyear)
                    .startMonth(sMmonth)
                    .endMonth(eMmonth)
                    .frequency(f)
                    .build()
                break
            default:
                return
            }
            /**
             * change info
             */
            info.push(headerInfo)
        })
        if (this._reportDate === undefined)
            return
        this.datepicker = new StandardHeaderBuilder()
            .headerInfos(info)
            .reportDate(this._reportDate)
            .build()
        this.outputDate$.next(this.datepicker)
        this._cd.detectChanges()
    }

    private _setHeaderInfoRange (info: HeaderInfo): void {
        switch (info.frequency) {
        case FrequencyEnum.HALF_YEAR:
            this._startHalfYear = info.startYear
            this._endHalfYear = info.endYear
            this._startHalfMonth = info.startMonth
            this._endHalfMonth = info.endMonth
            break
        case FrequencyEnum.QUARTER:
            this._startQuarter = info.startYear
            this._endQuarter = info.endYear
            this._startQuarterMonth = info.startMonth
            this._endQuarterMonth = info.endMonth
            break
        case FrequencyEnum.MONTH:
            this._startMYear = info.startYear
            this._endMYear = info.endYear
            this._startMMonth = info.startMonth
            this._endMMonth = info.endMonth
            break
        case FrequencyEnum.YEAR:
            this._startYear = info.startYear
            this._endYear = info.endYear
            break
        default:
            return
        }
    }
}

export function getDefault (endDate?: string): StandardHeader {
    const startYear = 5
    const endYear = 5
    const curr = endDate === undefined ? new Date() : new Date(endDate)
    const reportDate = dateToReportDate(curr)
    const headerInfos = [
        new HeaderInfoBuilder()
            .startYear(curr.getFullYear() - startYear)
            .endYear(curr.getFullYear() + endYear)
            .frequency(FrequencyEnum.YEAR)
            .build(),
    ]
    return new StandardHeaderBuilder()
        .reportDate(reportDate)
        .headerInfos(headerInfos)
        .build()
}

function dateToReportDate (date: Date | string): ReportDate {
    const curr = isString(date) ? new Date(date) : date
    return new ReportDateBuilder()
        .year(curr.getFullYear())
        .month(curr.getMonth() + 1)
        .day(curr.getDate())
        .build()
}
