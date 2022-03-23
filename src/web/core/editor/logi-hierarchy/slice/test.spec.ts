// tslint:disable:no-magic-numbers no-type-assertion
import {HttpClientModule} from '@angular/common/http'
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {MatAutocompleteModule} from '@angular/material/autocomplete'
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog'
import {MatIconModule} from '@angular/material/icon'
import {MatMenuModule} from '@angular/material/menu'
import {MatSnackBarModule} from '@angular/material/snack-bar'
import {By} from '@angular/platform-browser'
import {NoopAnimationsModule} from '@angular/platform-browser/animations'
import {RouterTestingModule} from '@angular/router/testing'
import {
    ColumnBuilder,
    RowBuilder,
    SliceExprBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {EditorTestModule} from '@logi/src/web/core/editor/test'

import {SliceComponent} from './component'
// tslint:disable-next-line: max-func-body-length
describe('Row selection component test: ', (): void => {
    let fixture: ComponentFixture<SliceComponent>
    let component: SliceComponent
    // tslint:disable-next-line: max-func-body-length
    beforeEach((): void => {
        TestBed.configureTestingModule({
            declarations: [
                SliceComponent,
            ],
            imports: [
                RouterTestingModule,
                FormsModule,
                ReactiveFormsModule,
                HttpClientModule,
                MatAutocompleteModule,
                MatDialogModule,
                MatIconModule,
                MatMenuModule,
                MatSnackBarModule,
                NoopAnimationsModule,
                EditorTestModule,
            ],
            providers: [
                {
                    provide: MatDialogRef,
                    // tslint:disable-next-line: no-empty
                    useValue: {close: (): void => { }},
                },
            ],
        })
        fixture = TestBed.createComponent(SliceComponent)
        component = fixture.componentInstance
        const col = new ColumnBuilder().name('col').labels(['l1', 'l2']).build()
        const slice = new SliceExprBuilder().name('l1').build()
        const slice1 = new SliceExprBuilder().name('l2').build()
        const row = new RowBuilder()
            .name('')
            .sliceExprs([slice, slice1])
            .build()
        new TableBuilder().name('').subnodes([col, row]).build()
        component.node = row
        component.slice = slice
        spyOn(component._studioApiSvc, 'suggestSliceNames').and
            .returnValue(['l1', 'col'])
        fixture.detectChanges()
    })

    it('basic display', (): void => {
        const fbtag = fixture.debugElement.query(By.css('.fb-tag'))
        expect(fbtag).toBeDefined()

        const editor = fixture.debugElement.query(By.css('logi-simple-editor'))
        expect(editor).toBeDefined()
    })
    it('should show selected style', () => {
        const el = getElement('.slice-container')
        el.classList.add('selected')
        const bgcolor = window.getComputedStyle(el).backgroundColor
        expect(bgcolor).toBe('rgba(65, 120, 184, 0.08)')
    })
    it('should show focus style', () => {
        const el = getElement('logi-simple-editor')
        el.classList.add('expr-focused')
        const border = window.getComputedStyle(el).border
        expect(border).toBe('1px solid rgb(65, 120, 184)')
    })
    function getElement (selector: string): HTMLElement {
        return fixture.debugElement.query(By.css(selector)).nativeElement
    }
})
