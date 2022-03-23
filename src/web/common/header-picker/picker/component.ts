import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild,
} from '@angular/core'
import {MatMenuTrigger} from '@angular/material/menu'
import {HeaderInfo, Frequency as FrequencyEnum} from '@logi/src/lib/template'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-picker-header',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class PickerHeaderComponent {
    @Input() public set headerInfo(headerInfo: Readonly<HeaderInfo>) {
        this.info = headerInfo
        this._update(headerInfo)
    }
    public constructor(
        private readonly _cd: ChangeDetectorRef,
    ) {}
    @Output() public readonly headerInfoChange$ = new EventEmitter<HeaderInfo>()
    public start = ''
    public end = ''
    public getMenuClass = getClass
    public info!: Readonly<HeaderInfo>

    public onHeaderInfoChange(headerInfo: HeaderInfo): void {
        this._menu.closeMenu()
        this._update(headerInfo)
        this.headerInfoChange$.next(headerInfo)
    }

    @ViewChild(MatMenuTrigger) private _menu!: MatMenuTrigger

    private _update(info: HeaderInfo): void {
        if (info === undefined)
            return
        const startYear = info.startYear.toString()
        const endYear = info.endYear.toString()
        const startMonth = info.startMonth
        const endMonth = info.endMonth
        switch (info.frequency) {
        case FrequencyEnum.HALF_YEAR:
            this.start = `${startYear} ${startMonth}`
            this.end = `${endYear} ${endMonth}`
            break
        case FrequencyEnum.QUARTER:
            this.start = `${startYear} ${startMonth}`
            this.end = `${endYear} ${endMonth}`
            break
        case FrequencyEnum.YEAR:
            this.start = `${startYear}`
            this.end = `${endYear}`
            break
        case FrequencyEnum.MONTH:
            this.start = `${startYear} ${startMonth}`
            this.end = `${endYear} ${endMonth}`
            break
        default:
        }
        this._cd.detectChanges()
    }
}
export function getClass(freq: FrequencyEnum): string {
    switch (freq) {
    case FrequencyEnum.HALF_YEAR:
        return 'picker-header-half-year'
    case FrequencyEnum.QUARTER:
        return 'picker-header-quarter'
    case FrequencyEnum.YEAR:
        return 'picker-header-year'
    case FrequencyEnum.MONTH:
        return 'picker-header-month'
    default:
        return ''
    }
}
