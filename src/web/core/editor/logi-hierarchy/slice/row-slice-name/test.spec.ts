import {HttpClientModule} from '@angular/common/http'
import {HttpClientTestingModule} from '@angular/common/http/testing'
import {DebugElement} from '@angular/core'
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {MatAutocompleteModule} from '@angular/material/autocomplete'
import {MatIconModule} from '@angular/material/icon'
import {By} from '@angular/platform-browser'
import {
    RowBuilder,
    SliceExprBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {NameService} from '@logi/src/web/core/editor/logi-hierarchy/slice/name'
import {
    OptionService,
} from '@logi/src/web/core/editor/logi-hierarchy/slice/option'
import {EditorTestModule} from '@logi/src/web/core/editor/test'
import {dispatchEvent} from '@logi/src/web/testing'

import {RowSliceNameComponent} from './component'
// tslint:disable-next-line: max-func-body-length
describe('Row selection component test: ', (): void => {
    let fixture: ComponentFixture<RowSliceNameComponent>
    let component: RowSliceNameComponent
    beforeEach((): void => {
        TestBed.configureTestingModule({
            declarations: [
                RowSliceNameComponent,
            ],
            imports: [
                MatAutocompleteModule,
                HttpClientModule,
                HttpClientTestingModule,
                MatIconModule,
                EditorTestModule,
            ],
            providers: [
                NameService,
                OptionService,
            ],
        })
        fixture = TestBed.createComponent(RowSliceNameComponent)
        component = fixture.componentInstance
        const slice = new SliceExprBuilder().name('slice').build()
        const row = new RowBuilder().name('').sliceExprs([slice]).build()
        new TableBuilder().name('').subnodes([row]).build()
        component.node = row
        component.slice = slice
        fixture.detectChanges()
    })

    it('basic display', (): void => {
        const fbtag = fixture.debugElement.query(By.css('.ref-name-input'))
        expect(fbtag).toBeDefined()
        expect(fbtag.nativeElement.textContent).toEqual('slice')
    })
    it('select right span ,right cursor', () => {
        component.openSuggest()
        const suggestion = fixture.debugElement
            .query(By.css('.slice-suggestion-panel'))
        expect(suggestion).toBeDefined()

        component.options = ['o1', 'o2']
        fixture.detectChanges()

        component.addBoolean()
        fixture.detectChanges()
        const options = document.querySelectorAll('mat-option')
        expect(options.length).toBe(2)
        expect(options[0].textContent).toBe('o1')
        expect(options[1].textContent).toBe('o2')
        dispatchEvent(options[0], new Event('click'))

        fixture.detectChanges()

        let offset = getOffset()
        expect(offset).toEqual(3)
        expect(offset).toEqual(component.getCursor())

        const spans = getAllElement('.spans-input span')
        dispatchEvent(spans[1], new Event('mousedown'))

        offset = getOffset()
        expect(offset).toEqual(2)
        expect(offset).toEqual(component.getCursor())
    })
    function getAllElement(selector: string): HTMLElement[] {
        return fixture.debugElement.queryAll(By.css(selector)).map(
            (el: DebugElement): HTMLElement => el.nativeElement,
        )
    }

    function getOffset(): number | undefined {
        const selObj = window.getSelection()
        const range = selObj?.getRangeAt(0)
        return range?.startOffset
    }
})
