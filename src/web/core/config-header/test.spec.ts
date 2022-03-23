// tslint:disable: no-magic-numbers no-type-assertion unknown-instead-of-any
import {HttpClientTestingModule} from '@angular/common/http/testing'
import {DebugElement} from '@angular/core'
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {FormsModule} from '@angular/forms'
import {MatNativeDateModule, MatRippleModule} from '@angular/material/core'
import {MatDatepickerModule} from '@angular/material/datepicker'
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog'
import {MatDividerModule} from '@angular/material/divider'
import {MatFormFieldModule} from '@angular/material/form-field'
import {MatIcon, MatIconModule} from '@angular/material/icon'
import {MatInputModule} from '@angular/material/input'
import {MatMenuModule} from '@angular/material/menu'
import {MatSelectModule} from '@angular/material/select'
import {MatSnackBarModule} from '@angular/material/snack-bar'
import {BrowserModule, By} from '@angular/platform-browser'
import {NoopAnimationsModule} from '@angular/platform-browser/animations'
import {UnitEnum} from '@logi-pb/src/saas/proto/basic/basic_pb'
import {
    Frequency as FrequencyEnum,
    HeaderInfoBuilder,
    ReportDateBuilder,
    StandardHeader,
    StandardHeaderBuilder,
    TemplateSet,
    TemplateSetBuilder,
} from '@logi/src/lib/template'
import {DateRangeModule} from '@logi/src/web/common/header-picker/date-range'
import {ReadonlyInputModule} from '@logi/src/web/common/readonly-input'
import {StudioApiService} from '@logi/src/web/global/api/service'
import {
    createMouseEvent,
    dispatchEvent,
    IconComponent,
} from '@logi/src/web/testing'
import {LogiButtonModule} from '@logi/src/web/ui/button'
import {of} from 'rxjs'

import {ConfigHeaderComponent} from './component'
// tslint:disable-next-line: max-func-body-length
describe('Source test: ', (): void => {
    let fixture: ComponentFixture<ConfigHeaderComponent>
    let component: ConfigHeaderComponent
    let date: Date
    let apiSvc: StudioApiService
    let set: TemplateSet
    // tslint:disable-next-line: max-func-body-length
    beforeEach((): void => {
        TestBed
            .configureTestingModule({
                declarations: [ConfigHeaderComponent],
                imports: [
                    BrowserModule,
                    NoopAnimationsModule,
                    FormsModule,
                    MatIconModule,
                    MatInputModule,
                    MatDividerModule,
                    MatSnackBarModule,
                    MatSelectModule,
                    MatFormFieldModule,
                    MatDatepickerModule,
                    HttpClientTestingModule,
                    DateRangeModule,
                    MatNativeDateModule,
                    MatDialogModule,
                    LogiButtonModule,
                    MatMenuModule,
                    MatRippleModule,
                    ReadonlyInputModule,
                ],
                providers: [
                    StudioApiService,
                    {
                        provide: MatDialogRef,
                        // tslint:disable-next-line: no-empty
                        useValue: {close: (): void => {}},
                    },
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
        fixture = TestBed.createComponent(ConfigHeaderComponent)
        component = fixture.componentInstance
        apiSvc = TestBed.inject(StudioApiService)
        date = new Date(2020, 9, 1)
        set = new TemplateSetBuilder()
            .standardHeaders(initStandardHeader(3, date))
            .build()
        const newSet = new TemplateSetBuilder()
            .standardHeaders(initStandardHeader(3, date, 1, 'rename'))
            .build()
        spyOn(apiSvc, 'currTemplateSet').and.returnValues(set, newSet)
        fixture.detectChanges()
    })
    // tslint:disable-next-line: max-func-body-length
    it('should display config-header', (): void => {
        let active: DebugElement[]
        expect(component).toBeDefined()
        const headers = fixture.debugElement
            .queryAll(By.css('.change-name-input'))
        expect(headers.length).toBe(3)
        headers.forEach((h, index) => {
            expect(h.nativeElement.value).toBe(`${index}`)
        })
        active = fixture.debugElement
            .queryAll(By.css('.standard-headers.active'))
        expect(active.length).toBe(1)
        active.forEach((h, index) => {
            expect(h.nativeElement.innerText).toBe(`${index}`)
        })

        /**
         * test input date change is enough
         * date range test will in data range component
         */
        const clickIndex = 2
        const header = headers[clickIndex].nativeElement
        const clientX1 = header.getBoundingClientRect().left
        const clientY1 = header.getBoundingClientRect().top
        const click = createMouseEvent('click', clientX1, clientY1)
        dispatchEvent(header, click)
        fixture.detectChanges()
        expect(component.inputDate).toEqual(getInitInfo(clickIndex, date))
        active = fixture.debugElement
            .queryAll(By.css('.standard-headers.active'))
        expect(active.length).toBe(1)
        active.forEach(h => {
            expect(h.nativeElement.innerText).toBe(`${clickIndex}`)
        })

        /**
         * test preview
         */
        const preview = fixture.debugElement.query(By.css('.preview'))
        expect(preview).not.toBeNull()

        const blocks = fixture.debugElement.queryAll(By.css('.column-block'))
        expect(blocks.length).toBe(3)

        const columns = fixture.debugElement.queryAll(By.css('.column'))
        expect(columns.length).toBe(2)
    })
    it('should have mat menu', (): void => {
        expect(component).toBeDefined()
        const mores = fixture.debugElement.queryAll(By.css('.icon-button.more'))
        expect(mores.length).toBe(3)
        const clickIndex = 1
        let clientX1: any
        let clientY1: any
        let click: MouseEvent
        const more = mores[clickIndex].nativeElement
        clientX1 = more.getBoundingClientRect().left
        clientY1 = more.getBoundingClientRect().top
        click = createMouseEvent('click', clientX1, clientY1)
        dispatchEvent(more, click)
        const menus = fixture.debugElement.queryAll(By.css('.mat-menu-item'))
        expect(menus.length).toBe(3)
        const text = ['设为默认', '重命名', '删除']
        menus.forEach((menu, i) => {
            expect(menu.nativeElement.innerText).toBe(text[i])
        })
    })
    it('should call setcurr after rename', (): void => {
        spyOn<any>(apiSvc, 'handleAction').and.returnValue(of(true))
        spyOn(component, 'setCurr')
        expect(component).toBeDefined()
        const rename = 'rename'
        component.renameHeader(rename, component.standardHeaders[1])
        expect(apiSvc.handleAction).toHaveBeenCalled()
        expect(component.setCurr).toHaveBeenCalledTimes(1)
    })
    it('should call setcurr after delete', (): void => {
        spyOn<any>(apiSvc, 'handleAction').and.returnValue(of(true))
        spyOn(component, 'setCurr')
        expect(component).toBeDefined()
        component.deleteHeader(component.standardHeaders[1])
        expect(apiSvc.handleAction).toHaveBeenCalled()
        expect(component.setCurr).toHaveBeenCalledTimes(1)
    })
})

function initStandardHeader(
    // tslint:disable-next-line: max-params
    i = 3,
    curr: Date,
    index?: number,
    newName?: string,
// tslint:disable-next-line: readonly-array
): StandardHeader[] {
    const headers: StandardHeader[] = []
    let j = 0
    while (j < i) {
        let name = `${j}`
        if (index !== undefined && newName !== undefined && j === index)
            name = newName
        const info = getInitInfo(j, curr)
        headers.push(new StandardHeaderBuilder()
            .name(name)
            .headerInfos(info.headerInfos)
            .reportDate(info.reportDate)
            .unit(info.unit)
            .build())
        j += 1
    }
    return headers
}

function getInitInfo(j: number, curr: Date): StandardHeader {
    return new StandardHeaderBuilder()
        .name(j.toString())
        .headerInfos([
            new HeaderInfoBuilder()
                .startYear(curr.getFullYear() - 1 - j)
                .endYear(curr.getFullYear() + 5)
                .startMonth('H1')
                .endMonth('H1')
                .frequency(FrequencyEnum.YEAR)
                .build(),
            new HeaderInfoBuilder()
                .startYear(curr.getFullYear() - 3 - j)
                .endYear(curr.getFullYear() + 1)
                .startMonth('H1')
                .endMonth('H2')
                .frequency(FrequencyEnum.HALF_YEAR)
                .build(),
            new HeaderInfoBuilder()
                .startYear(curr.getFullYear() - 1 - j)
                .endYear(curr.getFullYear() + 1)
                .startMonth('Q1')
                .endMonth('Q1')
                .frequency(FrequencyEnum.QUARTER)
                .build(),
        ])
        .reportDate(new ReportDateBuilder()
            .year(curr.getFullYear())
            .month(curr.getMonth())
            .day(curr.getDay())
            .build())
        .unit(UnitEnum.TEN_THOUSAND)
        .build()
}
