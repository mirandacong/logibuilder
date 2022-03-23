import {ComponentFixture, TestBed} from '@angular/core/testing'
import {MatRippleModule} from '@angular/material/core'
import {MatIconModule} from '@angular/material/icon'
import {MatMenuModule} from '@angular/material/menu'
import {BrowserModule, By} from '@angular/platform-browser'
import {NoopAnimationsModule} from '@angular/platform-browser/animations'
import {
    Frequency as FrequencyEnum,
    HeaderInfo,
    HeaderInfoBuilder,
} from '@logi/src/lib/template'
import {
    FrequencyPickerModule,
} from '@logi/src/web/common/header-picker/frequency-picker'
import {createMouseEvent, dispatchEvent} from '@logi/src/web/testing'

import {getClass, PickerHeaderComponent} from './component'
// tslint:disable-next-line: max-func-body-length
describe('Source test: ', (): void => {
    let fixture: ComponentFixture<PickerHeaderComponent>
    let component: PickerHeaderComponent
    beforeEach((): void => {
        TestBed.configureTestingModule({
            declarations: [
                PickerHeaderComponent,
            ],
            imports: [
                BrowserModule,
                FrequencyPickerModule,
                NoopAnimationsModule,
                MatIconModule,
                MatMenuModule,
                MatRippleModule,
            ],
        })
        fixture = TestBed.createComponent(PickerHeaderComponent)
        component = fixture.componentInstance
    })
    it('should display half year picker-header', (): void => {
        testEach(FrequencyEnum.HALF_YEAR)
    })
    it('should display year picker-header', (): void => {
        testEach(FrequencyEnum.YEAR)
    })
    it('should display quarter picker-header', (): void => {
        testEach(FrequencyEnum.QUARTER)
    })
    function testEach(freq: FrequencyEnum): void {
        component.headerInfo = getHeaderInfo(freq)
        fixture.detectChanges()
        expect(component).toBeDefined()
        const trigger = fixture.debugElement
            .query(By.css('.mat-menu-trigger.box'))
        // tslint:disable-next-line: no-type-assertion
        const el = trigger.nativeElement as HTMLElement
        const clientX1 = el.getBoundingClientRect().left
        const clientY1 = el.getBoundingClientRect().top
        const click = createMouseEvent('click', clientX1, clientY1)
        dispatchEvent(el, click)
        fixture.detectChanges()
        const a = fixture.debugElement.query(By.css(`.${getClass(freq)}`))
        expect(a).not.toBeNull()
    }
})

function getHeaderInfo(freq: FrequencyEnum): HeaderInfo {
    const curr = new Date(2020, 9, 1)
    const year = 5
    switch (freq) {
    case FrequencyEnum.YEAR:
        return new HeaderInfoBuilder()
            .startYear(curr.getFullYear() - year)
            .endYear(curr.getFullYear() + year)
            .frequency(freq)
            .build()
    case FrequencyEnum.HALF_YEAR:
        return new HeaderInfoBuilder()
            .startYear(curr.getFullYear() - year)
            .endYear(curr.getFullYear() + year)
            .frequency(freq)
            .startMonth('H1')
            .endMonth('H2')
            .build()
    case FrequencyEnum.QUARTER:
        return new HeaderInfoBuilder()
            .startYear(curr.getFullYear() - year)
            .endYear(curr.getFullYear() + year)
            .frequency(freq)
            .startMonth('Q1')
            .endMonth('Q4')
            .build()
    default:
        return new HeaderInfoBuilder()
            .startYear(curr.getFullYear() - year)
            .endYear(curr.getFullYear() + year)
            .frequency(FrequencyEnum.YEAR)
            .build()
    }
}
