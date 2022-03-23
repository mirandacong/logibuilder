// tslint:disable: no-magic-numbers no-type-assertion
import {HttpClientTestingModule} from '@angular/common/http/testing'
import {DebugElement} from '@angular/core'
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {FormsModule} from '@angular/forms'
import {MatRippleModule} from '@angular/material/core'
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog'
import {MatIconModule} from '@angular/material/icon'
import {MatSnackBarModule} from '@angular/material/snack-bar'
import {MatTooltipModule} from '@angular/material/tooltip'
import {By} from '@angular/platform-browser'
import {NoopAnimationsModule} from '@angular/platform-browser/animations'
import {
    Book,
    BookBuilder,
    ColumnBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {StudioApiService} from '@logi/src/web/global/api'
import {LogiDialogModule} from '@logi/src/web/ui/dialog'

import {LabelManageComponent} from './component'
import {LabelCellComponent} from './label-cell/component'

// tslint:disable-next-line: max-func-body-length
describe('Label dialog component test: ', (): void => {
    let apiSvc: StudioApiService
    let fixture: ComponentFixture<LabelManageComponent>
    let component: LabelManageComponent
    // tslint:disable-next-line: max-func-body-length
    beforeEach(async(): Promise<void> => {
        await TestBed.configureTestingModule({
            declarations: [
                LabelManageComponent,
                LabelCellComponent,
            ],
            imports: [
                FormsModule,
                HttpClientTestingModule,
                LogiDialogModule,
                MatDialogModule,
                MatIconModule,
                MatRippleModule,
                MatSnackBarModule,
                MatTooltipModule,
                NoopAnimationsModule,
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
        const book = mockBook()
        apiSvc = TestBed.inject(StudioApiService)
        spyOn(apiSvc, 'currBook').and.returnValue(book)
        fixture = TestBed.createComponent(LabelManageComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should display rowlabel and collabel', (): void => {
        const colLabels = ['1', '2']

        expect(component.colLabels).toEqual(colLabels)

        const curLabel = fixture.debugElement.queryAll(By.css('.input-label'))
        expect(curLabel.length).toBe(2)
        curLabel.forEach((label: DebugElement, i: number): void => {
            expect(label.nativeElement.textContent).toBe(colLabels[i])
        })
    })
})

function mockBook(): Readonly<Book> {
    const table1 = new TableBuilder()
        .name('table1')
        .subnodes([
            new RowBuilder().name('row1').build(),
            new RowBuilder().name('row2').build(),
            new RowBuilder().name('row3').build(),
        ])
        .build()
    const table2 = new TableBuilder()
        .name('table2')
        .subnodes([
            new ColumnBuilder().name('col1').labels(['1']).build(),
            new ColumnBuilder().name('col2').labels(['2']).build(),
            new RowBuilder().name('row4').build(),
        ])
        .build()
    const sheet = new SheetBuilder()
        .name('sheet')
        .tree([table1, table2])
        .build()
    return new BookBuilder().name('book').sheets([sheet]).build()
}
