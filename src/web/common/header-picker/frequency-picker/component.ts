import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    HostListener,
    Input,
    Output,
} from '@angular/core'
import {
    Frequency as FrequencyEnum,
    HeaderInfoBuilder,
} from '@logi/src/lib/template'
import {HeaderInfo} from '@logi/src/lib/template'

import {FrequencyItem, FrequencyItemBuilder} from './item'

export const YEARS_LENGTH = 7
export const YEARS_INSIDE_LENGTH = 4
const MIN_START_YEAR = 0
const MAX_END_YEAR = 100

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-frequency-picker',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class FrequencyPickerComponent {
    @Input() public set headerInfo(info: Readonly<HeaderInfo>) {
        this.info = info
        this._init()
    }
    public info!: Readonly<HeaderInfo>
    @Output() public readonly headerInfoChange$ = new EventEmitter<HeaderInfo>()
    public frequencyEnum = FrequencyEnum
    public startYear = -1
    public endYear = -1
    /**
     * When init component and has startItem and endItem, set the two fields
     * below.
     * If select a item, set `startItem` to item, `endItem` to undefined.
     * If select a item and `startItem` is not undefined, set `startItem` and
     * `endItem` correctly, emit result.
     */
    public startItem?: FrequencyItem
    public endItem?: FrequencyItem
    public startItems: readonly FrequencyItem[] = []
    public endItems: readonly FrequencyItem[] = []
    // tslint:disable-next-line: readonly-array
    public years: (readonly FrequencyItem[])[] = []

    @HostListener('click', ['$event']) public onClickTable = stopPop

    public hoverItem(item: FrequencyItem): void {
        this._currItem = item
    }

    public isOver(item: FrequencyItem): boolean {
        if (this.startItem === undefined)
            return false
        const otherItem = this.endItem ?? this._currItem
        if (otherItem === undefined)
            return false
        let start: FrequencyItem
        let end: FrequencyItem
        if (this.startItem.greaterThan(otherItem)) {
            start = otherItem
            end = this.startItem
        } else {
            start = this.startItem
            end = otherItem
        }
        return item.greaterThan(start) && item.lessThan(end)
    }

    public isShowLeft(item: FrequencyItem): boolean {
        if (this.startItem !== undefined && this.endItem !== undefined)
            return item.equals(this.endItem)
        if (this.startItem !== undefined && this.endItem === undefined &&
            this._currItem !== undefined)
            return item.equals(this._currItem) ?
                item.greaterThan(this.startItem) :
                (item.equals(this.startItem) &&
                item.greaterThan(this._currItem))
        return false
    }

    public isShowRight(item: FrequencyItem): boolean {
        if (this.startItem !== undefined && this.endItem !== undefined)
            return item.equals(this.startItem)
        if (this.startItem !== undefined && this.endItem === undefined &&
            this._currItem !== undefined)
            return item.equals(this._currItem) ?
                item.lessThan(this.startItem) :
                (item.equals(this.startItem) &&
                item.lessThan(this._currItem))
        return false
    }

    public selectItem(item: FrequencyItem): void {
        if (this.startItem === undefined) {
            this.startItem = item
            return
        }
        if (this.startItem !== undefined && this.endItem !== undefined) {
            this.startItem = item
            this.endItem = undefined
            return
        }
        if (this.startItem !== undefined && this.endItem === undefined)
            if (this.startItem.greaterThan(item)) {
                this.endItem = this.startItem
                this.startItem = item
            } else
                this.endItem = item
        this._emitHeaderInfo()
    }

    public onBack(): void {
        if (this.info.frequency === FrequencyEnum.YEAR) {
            this.startYear -= YEARS_INSIDE_LENGTH * YEARS_LENGTH
            this.endYear -= YEARS_INSIDE_LENGTH * YEARS_LENGTH
            this._limit()
            this._updateYears()
        } else {
            this.startYear -= 1
            this.endYear -= 1
            this._limit()
            this._updateMonthItems()
        }
    }

    public onForward(): void {
        if (this.info.frequency === FrequencyEnum.YEAR) {
            this.startYear += YEARS_INSIDE_LENGTH * YEARS_LENGTH
            this.endYear += YEARS_INSIDE_LENGTH * YEARS_LENGTH
            this._limit()
            this._updateYears()
        } else {
            this.startYear += 1
            this.endYear += 1
            this._limit()
            this._updateMonthItems()
        }
    }

    // tslint:disable-next-line: ter-max-len
    // tslint:disable-next-line: ext-variable-name naming-convention prefer-function-over-method
    public trackByFn(_: number, item: unknown): unknown {
        return item
    }

    private _currItem?: FrequencyItem
    private _emitHeaderInfo(): void {
        if (this.startItem === undefined || this.endItem === undefined)
            return
        const newHeaderInfo = new HeaderInfoBuilder()
            .endMonth(this.endItem.month)
            .endYear(this.endItem.year)
            .frequency(this.info.frequency)
            .startMonth(this.startItem.month)
            .startYear(this.startItem.year)
            .build()
        this.headerInfoChange$.next(newHeaderInfo)
    }

    private _init(): void {
        if (this.info.frequency === FrequencyEnum.YEAR) {
            this.startYear = this.info.startYear - YEARS_INSIDE_LENGTH * 1
            this.endYear = this.info.startYear -
                YEARS_INSIDE_LENGTH * 1 + YEARS_LENGTH * YEARS_INSIDE_LENGTH - 1
            this.startItem = new FrequencyItemBuilder()
                .month('H1')
                .year(this.info.startYear)
                .build()
            this.endItem = new FrequencyItemBuilder()
                .month('H1')
                .year(this.info.endYear)
                .build()
            this._updateYears()
        } else {
            this.startYear = this.info.startYear
            this.endYear = this.info.startYear + 1
            this.startItem = new FrequencyItemBuilder()
                .month(this.info.startMonth)
                .year(this.info.startYear)
                .build()
            this.endItem = new FrequencyItemBuilder()
                .month(this.info.endMonth)
                .year(this.info.endYear)
                .build()
            this._updateMonthItems()
        }
    }

    private _updateMonthItems(): void {
        const startItems: FrequencyItem[] = []
        const endItems: FrequencyItem[] = []
        this._getMonth().forEach(month => {
            const startItemBuilder = new FrequencyItemBuilder()
                .year(this.startYear)
                .month(month)
            startItems.push(startItemBuilder.build())
            const endItemBuilder = new FrequencyItemBuilder()
                .year(this.endYear)
                .month(month)
            endItems.push(endItemBuilder.build())
        })
        this.startItems = startItems
        this.endItems = endItems
    }

    private _getMonth(): readonly string[] {
        const getList = (r: number, tag: string) => Array.from(Array(r), (
        // tslint:disable-next-line: ext-variable-name naming-convention
            _,
            i,
        ) => `${tag}${i + 1}`)
        switch (this.info.frequency) {
        case FrequencyEnum.HALF_YEAR:
            return getList(2, 'H')
        case FrequencyEnum.QUARTER:
            return getList(4, 'Q')
        case FrequencyEnum.MONTH:
            return getList(12, 'M')
        default:
            return []
        }
    }

    private _updateYears(): void {
        this.years = []
        let i = 0
        while (i < YEARS_LENGTH) {
            const inside: FrequencyItem[] = []
            let j = 0
            while (j < YEARS_INSIDE_LENGTH) {
                const year = this.startYear + j + (i * YEARS_INSIDE_LENGTH)
                inside.push(
                    new FrequencyItemBuilder().year(year).month('H1').build(),
                )
                j += 1
            }
            i += 1
            this.years.push(inside)
        }
    }

    private _limit(): void {
        if (this.startYear < MIN_START_YEAR) {
            this.startYear = MIN_START_YEAR
            this.endYear = this.info.frequency === FrequencyEnum.YEAR ?
                YEARS_INSIDE_LENGTH * YEARS_LENGTH : 1
            return
        }
        const date = new Date().getFullYear()
        if (this.endYear > date + MAX_END_YEAR) {
            this.endYear = date + MAX_END_YEAR
            this.startYear = this.info.frequency === FrequencyEnum.YEAR ?
                this.endYear - YEARS_INSIDE_LENGTH * YEARS_LENGTH :
                this.endYear - 1
        }
    }
}

function stopPop(event: MouseEvent): void {
    event.stopPropagation()
}
