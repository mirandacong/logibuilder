// tslint:disable: no-magic-numbers
import {CommonModule} from '@angular/common'
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {MatAutocompleteModule} from '@angular/material/autocomplete'
import {MatNativeDateModule, MatRippleModule} from '@angular/material/core'
import {MatDatepickerModule} from '@angular/material/datepicker'
import {MatFormFieldModule} from '@angular/material/form-field'
import {MatIcon, MatIconModule} from '@angular/material/icon'
import {MatInputModule} from '@angular/material/input'
import {MatMenuModule} from '@angular/material/menu'
import {MatSelectModule} from '@angular/material/select'
import {BrowserModule, By} from '@angular/platform-browser'
import {UnitEnum} from '@logi-pb/src/saas/proto/basic/basic_pb'
import {
    Frequency as FrequencyEnum,
    HeaderInfoBuilder,
    ReportDateBuilder,
    StandardHeader,
    StandardHeaderBuilder,
} from '@logi/src/lib/template'
import {PickerHeaderModule} from '@logi/src/web/common/header-picker/picker'
import {IconComponent} from '@logi/src/web/testing'
import {NgMultiSelectDropDownModule} from 'ng-multiselect-dropdown'

import {DateRangeComponent} from './component'
import {PickerTitle} from './pipe'

// tslint:disable-next-line: max-func-body-length
describe('Source test: ', (): void => {
    let fixture: ComponentFixture<DateRangeComponent>
    let component: DateRangeComponent
    let curr: Date
    let info: StandardHeader
    beforeEach((): void => {
        TestBed
            .configureTestingModule({
                declarations: [DateRangeComponent, PickerTitle],
                imports: [
                    BrowserModule,
                    CommonModule,
                    MatNativeDateModule,
                    FormsModule,
                    MatAutocompleteModule,
                    MatDatepickerModule,
                    MatFormFieldModule,
                    MatIconModule,
                    MatInputModule,
                    MatMenuModule,
                    MatRippleModule,
                    MatSelectModule,
                    NgMultiSelectDropDownModule.forRoot(),
                    PickerHeaderModule,
                    ReactiveFormsModule,
                ],
            })
            .overrideModule(MatIconModule, {
                add: {
                    declarations: [IconComponent],
                    exports: [IconComponent],
                },
                remove: {
                    declarations: [MatIcon],
                    exports: [MatIcon],
                },
            })
        curr = new Date(2020, 9, 1)
        info = getInitInfo(curr)
        fixture = TestBed.createComponent(DateRangeComponent)
        component = fixture.componentInstance
    })
    it('should display all date range', (): void => {
        component.inputDate = info
        fixture.detectChanges()
        expect(component).toBeDefined()
        const caption = fixture.debugElement.queryAll(By.css('.caption'))
        expect(caption.length).toBe(6)
        const titles = ['最近财报日', '频率', '年度范围', '半年度范围', '季度范围', '月份范围']
        caption.forEach((title, index) => {
            expect(title.nativeElement.textContent).toBe(titles[index])
        })
        /**
         * test 最近财报日
         */
        const freqDate = fixture.debugElement.query(
            By.css('.mat-input-element.mat-form-field-autofill-control'),
        )
        expect(freqDate).not.toBeNull()
        expect(freqDate.nativeElement.value).toBe(
            // tslint:disable-next-line: ter-max-len
            `${info.reportDate.year}-${info.reportDate.month}-${info.reportDate.day}`,
        )

        /**
         * test 频率
         */
        const items = fixture.debugElement.queryAll(By.css('logi-option'))
        expect(items.length).toBe(4)
        const itemContent = ['年度', '半年度', '季度', '月份']
        items.forEach((item, index) => {
            expect(item.nativeElement.textContent).toBe(itemContent[index])
        })
    })
    it('should set header info range', (): void => {
        // @ts-ignore
        spyOn(component, '_setHeaderInfoRange')
        component.inputDate = info
        fixture.detectChanges()
        // @ts-ignore
        expect(component._setHeaderInfoRange)
            .toHaveBeenCalledTimes(info.headerInfos.length)
    })
    it('none dom picked title pipe test', () => {
        const pipe = new PickerTitle()
        expect(pipe.transform(FrequencyEnum.YEAR)).toBe('年度范围')
        expect(pipe.transform(FrequencyEnum.HALF_YEAR)).toBe('半年度范围')
        expect(pipe.transform(FrequencyEnum.QUARTER)).toBe('季度范围')
        expect(pipe.transform(FrequencyEnum.MONTH)).toBe('月份范围')
    })
})

function getInitInfo(curr: Date): StandardHeader {
    return new StandardHeaderBuilder()
        .headerInfos([
            new HeaderInfoBuilder()
                .startYear(curr.getFullYear() - 1)
                .endYear(curr.getFullYear() + 5)
                .startMonth('H1')
                .endMonth('H1')
                .frequency(FrequencyEnum.YEAR)
                .build(),
            new HeaderInfoBuilder()
                .startYear(curr.getFullYear() - 3)
                .endYear(curr.getFullYear() + 1)
                .startMonth('H1')
                .endMonth('H2')
                .frequency(FrequencyEnum.HALF_YEAR)
                .build(),
            new HeaderInfoBuilder()
                .startYear(curr.getFullYear() - 1)
                .endYear(curr.getFullYear() + 1)
                .startMonth('Q1')
                .endMonth('Q1')
                .frequency(FrequencyEnum.QUARTER)
                .build(),
            new HeaderInfoBuilder()
                .startYear(curr.getFullYear() - 1)
                .endYear(curr.getFullYear() + 1)
                .startMonth('M1')
                .endMonth('M1')
                .frequency(FrequencyEnum.MONTH)
                .build(),
        ])
        .reportDate(new ReportDateBuilder()
            .year(curr.getFullYear())
            .month(curr.getMonth() + 1)
            .day(curr.getDay())
            .build())
        .unit(UnitEnum.MILLION)
        .build()
}
