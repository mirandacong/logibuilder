// tslint:disable: no-magic-numbers
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {MatRippleModule} from '@angular/material/core'
import {MatIconModule} from '@angular/material/icon'
import {MatMenuModule} from '@angular/material/menu'
import {BrowserModule, By} from '@angular/platform-browser'
import {
    Frequency as FrequencyEnum,
    HeaderInfoBuilder,
} from '@logi/src/lib/template'

import {
    FrequencyPickerComponent,
    YEARS_INSIDE_LENGTH,
    YEARS_LENGTH,
} from './component'
import {FrequencyItemBuilder} from './item'

// tslint:disable-next-line: max-func-body-length
describe('Source test: ', (): void => {
    let fixture: ComponentFixture<FrequencyPickerComponent>
    let component: FrequencyPickerComponent
    beforeEach((): void => {
        TestBed.configureTestingModule({
            declarations: [FrequencyPickerComponent],
            imports: [
                BrowserModule,
                MatIconModule,
                MatMenuModule,
                MatRippleModule,
            ],
        })
        fixture = TestBed.createComponent(FrequencyPickerComponent)
        component = fixture.componentInstance
    })
    it('should display year view', (): void => {
        const curr = new Date(2020, 9, 1)
        const year = 5
        const info = new HeaderInfoBuilder()
            .startYear(curr.getFullYear() - year)
            .endYear(curr.getFullYear() + year)
            .frequency(FrequencyEnum.YEAR)
            .build()
        component.headerInfo = info
        fixture.detectChanges()
        expect(component).toBeDefined()
        const overs = fixture.debugElement
            .queryAll(By.css('.background.item-over'))
        expect(overs.length).toEqual(5)
        const right = fixture.debugElement
            .queryAll(By.css('.background.over-right'))
        expect(right.length).toEqual(3)
        const left = fixture.debugElement
            .queryAll(By.css('.background.over-left'))
        expect(left.length).toEqual(3)

        const basicView = fixture.debugElement.queryAll(By.css('.year-view'))
        expect(basicView.length).toBe(YEARS_INSIDE_LENGTH * YEARS_LENGTH)
        const start = curr.getFullYear() - year - YEARS_INSIDE_LENGTH
        basicView.forEach((cell, index) => {
            expect(cell.nativeElement.textContent).toBe(`${start + index}`)
        })

        spyOn(component.headerInfoChange$, 'next')
        // tslint:disable-next-line: no-type-assertion
        const a = basicView[0].nativeElement as HTMLElement
        a.click()
        // tslint:disable-next-line: no-type-assertion
        const b = basicView[YEARS_LENGTH * 2].nativeElement as HTMLElement
        b.click()
        expect(component.startItem).toEqual(new FrequencyItemBuilder()
            .year(start)
            .month('H1')
            .build(),
        )
        expect(component.endItem).toEqual(new FrequencyItemBuilder()
            .year(start + YEARS_LENGTH * 2)
            .month('H1')
            .build(),
        )
        expect(component.headerInfoChange$.next).toHaveBeenCalled()
        expect(component.headerInfoChange$.next).toHaveBeenCalledTimes(1)
    })
    it('should display half year view', (): void => {
        const curr = new Date(2020, 9, 1)
        const info = new HeaderInfoBuilder()
            .startYear(curr.getFullYear() - 1)
            .endYear(curr.getFullYear())
            .frequency(FrequencyEnum.HALF_YEAR)
            .startMonth('H1')
            .endMonth('H2')
            .build()
        component.headerInfo = info
        fixture.detectChanges()
        expect(component).toBeDefined()
        const overs = fixture.debugElement
            .queryAll(By.css('.other-background.item-over'))
        expect(overs.length).toEqual(2)
        const right = fixture.debugElement
            .queryAll(By.css('.other-background.over-right'))
        expect(right.length).toEqual(1)
        const left = fixture.debugElement
            .queryAll(By.css('.other-background.over-left'))
        expect(left.length).toEqual(1)

        const half = ['H1', 'H2', 'H1', 'H2']
        const basicView = fixture.debugElement.queryAll(By.css('.other-view'))
        expect(basicView.length).toEqual(half.length)
        basicView.forEach((cell, index) => {
            expect(cell.nativeElement.textContent).toBe(half[index])
        })
        spyOn(component.headerInfoChange$, 'next')
        // tslint:disable-next-line: no-type-assertion
        const a = basicView[0].nativeElement as HTMLElement
        a.click()
        // tslint:disable-next-line: no-type-assertion
        const b = basicView[3].nativeElement as HTMLElement
        b.click()
        expect(component.startItem).toEqual(new FrequencyItemBuilder()
            .year(info.startYear)
            .month(half[0])
            .build(),
        )
        expect(component.endItem).toEqual(new FrequencyItemBuilder()
            .year(info.endYear)
            .month(half[3])
            .build(),
        )
        expect(component.headerInfoChange$.next).toHaveBeenCalled()
        expect(component.headerInfoChange$.next).toHaveBeenCalledTimes(1)
    })
    it('should display quarter view', (): void => {
        const curr = new Date(2020, 9, 1)
        const info = new HeaderInfoBuilder()
            .startYear(curr.getFullYear() - 1)
            .endYear(curr.getFullYear())
            .frequency(FrequencyEnum.QUARTER)
            .startMonth('Q1')
            .endMonth('Q2')
            .build()
        component.headerInfo = info
        fixture.detectChanges()
        expect(component).toBeDefined()
        const overs = fixture.debugElement
            .queryAll(By.css('.other-background.item-over'))
        expect(overs.length).toEqual(4)
        const right = fixture.debugElement
            .queryAll(By.css('.other-background.over-right'))
        expect(right.length).toEqual(1)
        const left = fixture.debugElement
            .queryAll(By.css('.other-background.over-left'))
        expect(left.length).toEqual(1)

        const quarter = ['Q1', 'Q2', 'Q3', 'Q4', 'Q1', 'Q2', 'Q3', 'Q4']
        const basicView = fixture.debugElement.queryAll(By.css('.other-view'))
        expect(basicView.length).toEqual(quarter.length)
        basicView.forEach((cell, index) => {
            expect(cell.nativeElement.textContent).toBe(quarter[index])
        })
        spyOn(component.headerInfoChange$, 'next')
        // tslint:disable-next-line: no-type-assertion
        const a = basicView[0].nativeElement as HTMLElement
        a.click()
        // tslint:disable-next-line: no-type-assertion
        const b = basicView[6].nativeElement as HTMLElement
        b.click()
        expect(component.startItem).toEqual(new FrequencyItemBuilder()
            .year(info.startYear)
            .month(quarter[0])
            .build(),
        )
        expect(component.endItem).toEqual(new FrequencyItemBuilder()
            .year(info.endYear)
            .month(quarter[6])
            .build(),
        )
        expect(component.headerInfoChange$.next).toHaveBeenCalled()
        expect(component.headerInfoChange$.next).toHaveBeenCalledTimes(1)
    })
})
