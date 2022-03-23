// tslint:disable: no-magic-numbers remove-import-comment
import {HttpClientModule} from '@angular/common/http'
// tslint:disable-next-line: import-line-length
import {
    ComponentFixture,
    discardPeriodicTasks,
    fakeAsync,
    TestBed,
    tick,
} from '@angular/core/testing'
import {MatDialogModule} from '@angular/material/dialog'
import {MatIcon, MatIconModule} from '@angular/material/icon'
import {MatSnackBarModule} from '@angular/material/snack-bar'
import {By} from '@angular/platform-browser'
import {KeyboardEventKeyCode} from '@logi/base/ts/common/key_code'
import {
    Book,
    BookBuilder,
    ColumnBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {
    ItemBuilder,
    ManualSourceBuilder,
    SourceManager,
} from '@logi/src/lib/source'
import {EditorTestModule} from '@logi/src/web/core/editor/test'
import {StudioApiService} from '@logi/src/web/global/api/service'
import {dispatchEvent, IconComponent} from '@logi/src/web/testing'
import {NotificationService} from '@logi/src/web/ui/notification'

import {ExcelPreviewComponent} from './component'
import {ExcelService} from './excel/service'
import {LegendModule} from './legend'
import {OperateService} from './operator/service'

// tslint:disable-next-line: max-func-body-length
describe('Test spreadjs', (): void => {
    let fixture: ComponentFixture<ExcelPreviewComponent>
    let component: ExcelPreviewComponent
    let apiSvc: StudioApiService
    let spyServiceMsg: jasmine.SpyObj<NotificationService>
    beforeEach((): void => {
        spyServiceMsg = jasmine.createSpyObj(
            'NotificationService',
            ['showError'],
        )
        TestBed
            .configureTestingModule({
                declarations: [ExcelPreviewComponent],
                imports: [
                    HttpClientModule,
                    MatDialogModule,
                    MatSnackBarModule,
                    LegendModule,
                    MatIconModule,
                    EditorTestModule,
                ],
                providers: [
                    OperateService,
                    ExcelService,
                    {
                        provide: NotificationService,
                        useValue: spyServiceMsg,
                    },
                ],
            })
            .overrideModule(MatIconModule, {
                add: {
                    declarations: [IconComponent],
                    exports: [IconComponent],
                },
                remove : {
                    declarations: [MatIcon],
                    exports: [MatIcon],
                },
            })
        fixture = TestBed.createComponent(ExcelPreviewComponent)
        apiSvc = TestBed.inject(StudioApiService)
        const data = mockData()
        spyOn(apiSvc, 'currBook').and.returnValue(data.book)
        component = fixture.componentInstance
    })
    it('should set workbook to backend after init', (): void => {
        spyServiceMsg.showError.and.returnValue(undefined)
        fixture.detectChanges()
        expect(component.workbook).toBeDefined()
        expect(apiSvc.workbook()).toBe(component.workbook)
    })

    it('should init workbook after renderBook', fakeAsync((): void => {
        spyServiceMsg.showError.and.returnValue(undefined)
        spyOn(apiSvc, 'handleAction')
        fixture.detectChanges()
        component.renderBook()
        expect(apiSvc.handleAction).toHaveBeenCalled()
        discardPeriodicTasks()
    }))

    it('should send action after cell change event', fakeAsync((): void => {
        spyServiceMsg.showError.and.returnValue(undefined)
        spyOn(apiSvc, 'handleAction')
        fixture.detectChanges()
        component.renderBook()
        fixture.detectChanges()
        spyServiceMsg.showError.and.returnValue(undefined)
        tick(50)
        const sheet = component.workbook.getActiveSheet()
        sheet.getCell(4, 1).value(2)
        expect(apiSvc.handleAction).toHaveBeenCalled()

        sheet.getCell(4, 0).value('new name')
        expect(apiSvc.handleAction).toHaveBeenCalled()
        discardPeriodicTasks()
    }))
    it('should call crtl_s saveEvent next event', ((): void => {
        spyOn(component.saveEvent$, 'next')
        fixture.detectChanges()
        const el = fixture.debugElement
            .query(By.css('.csf-sheet-container')).nativeElement
        const saveEvent = new KeyboardEvent('keydown', {keyCode: KeyboardEventKeyCode.KEY_S, ctrlKey: true})
        dispatchEvent(el, saveEvent)
        expect(component.saveEvent$.next).toHaveBeenCalled()
    }))
})

function mockData(
): {readonly book: Readonly<Book>, readonly sourceMgr: SourceManager} {
    const col = new ColumnBuilder().name('col').uuid('col').build()
    const row1 = new RowBuilder().name('row1').uuid('row1').build()
    const row2 = new RowBuilder().name('row2').uuid('row2').build()
    const row3 = new RowBuilder()
        .name('row3')
        .expression('{row1}+{row2}')
        .build()
    const table = new TableBuilder()
        .name('table')
        .subnodes([col, row1, row2, row3])
        .build()
    const sheet = new SheetBuilder().name('sheet').tree([table]).build()

    const item1 = new ItemBuilder()
        .row(row1.uuid)
        .col(col.uuid)
        .source(new ManualSourceBuilder().value(1).build())
        .build()
    const item2 = new ItemBuilder()
        .row(row2.uuid)
        .col(col.uuid)
        .source(new ManualSourceBuilder().value(2).build())
        .build()
    const manager = new SourceManager([item1, item2])
    const book = new BookBuilder().name('book').sheets([sheet]).build()
    return {book, sourceMgr: manager}
}
