// tslint:disable: no-magic-numbers
import {HttpClientModule} from '@angular/common/http'
import {HttpClientTestingModule} from '@angular/common/http/testing'
import {DebugElement} from '@angular/core'
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {FormsModule} from '@angular/forms'
import {MatAutocompleteModule} from '@angular/material/autocomplete'
import {MatDialogModule} from '@angular/material/dialog'
import {MatIcon, MatIconModule} from '@angular/material/icon'
import {MatMenuModule} from '@angular/material/menu'
import {MatSnackBarModule} from '@angular/material/snack-bar'
import {By} from '@angular/platform-browser'
import {NoopAnimationsModule} from '@angular/platform-browser/animations'
import {RouterTestingModule} from '@angular/router/testing'
import {
    AnnotationKey,
    Row,
    RowBuilder,
    SliceExprBuilder,
} from '@logi/src/lib/hierarchy/core'
import {EditorTestModule} from '@logi/src/web/core/editor/test'
import {dispatchEvent, IconComponent} from '@logi/src/web/testing'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {RowComponent} from './component'
import {SlicePartComponent} from './slice/component'

describe('Row component test: ', (): void => {
    let fixture: ComponentFixture<RowComponent>
    let component: RowComponent
    // tslint:disable-next-line: max-func-body-length
    beforeEach((): void => {
        TestBed
            .configureTestingModule({
                declarations: [
                    RowComponent,
                    SlicePartComponent,
                ],
                imports: [
                    RouterTestingModule,
                    LogiButtonModule,
                    FormsModule,
                    HttpClientModule,
                    NoopAnimationsModule,
                    HttpClientTestingModule,
                    MatAutocompleteModule,
                    MatDialogModule,
                    MatIconModule,
                    MatMenuModule,
                    MatSnackBarModule,
                    EditorTestModule,
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
        fixture = TestBed.createComponent(RowComponent)
        component = fixture.componentInstance
        const row = mockRow()
        component.row = row
        fixture.detectChanges()
    })
    it('basic display', (): void => {
        const input = getElement('.input-name')
        expect(input.textContent).toBe('test row')

        const scalar = fixture.debugElement.query(By.css('.scalar-label'))
        expect(scalar).toBeDefined()

        const modifier = fixture.debugElement
            .query(By.css('logi-editor-modifier'))
        expect(modifier).toBeDefined()

        const slices = getAllElement('logi-editor-slice')
        // tslint:disable-next-line: no-magic-numbers
        expect(slices.length).toBe(2)
    })
    it('show label style', () => {
        const labels = getAllElement('logi-editor-label')
        expect(labels.length).toBe(3)
    })
    it('no slice basic display', () => {
        const annotation = new Map()
        annotation.set(AnnotationKey.LINK_CODE, 'code')
        annotation.set(AnnotationKey.LINK_NAME, 'name')
        const row = new RowBuilder().name('').annotations(annotation).build()
        component.row = row
        component.cd.detectChanges()
        const formulaPart = fixture.debugElement.query(By.css('.formula'))
        expect(formulaPart).toBeDefined()
        const fbtag = fixture.debugElement.query(By.css('.fb-tag'))
        expect(fbtag).toBeDefined()
    })
    it('should change name', (): void => {
        // tslint:disable-next-line: no-type-assertion
        const input = getElement('.input-name')
        dispatchEvent(input, new Event('focusin'))
        input.textContent = 'r'
        dispatchEvent(input, new Event('input'))
        dispatchEvent(input, new Event('blur'))
        const nameInput = getElement('.input-name')
        expect(nameInput.textContent).toBe('r')
    })
    it('should add slice', (): void => {
        const oldSlices = getAllElement('logi-editor-slice')
        expect(oldSlices.length).toBe(2)
        const newRow = new RowBuilder(component.node)
            .sliceExprs([
                ...component.node.sliceExprs,
                new SliceExprBuilder().name('').build(),
            ])
            .build()
        component.row = newRow
        component.cd.detectChanges()
        const newSlices = getAllElement('logi-editor-slice')
        expect(newSlices.length).toBe(3)
    })
    it('should delete slice', (): void => {
        const oldSlices = getAllElement('logi-editor-slice')
        expect(oldSlices.length).toBe(2)
        const newRow = new RowBuilder(component.node)
            .sliceExprs([component.node.sliceExprs[0]])
            .build()
        component.row = newRow
        component.cd.detectChanges()
        const newSlices = getAllElement('logi-editor-slice')
        expect(newSlices.length).toBe(1)
    })
    it('should cancel slice', (): void => {
        const oldSlices = getAllElement('logi-editor-slice')
        expect(oldSlices.length).toBe(2)
        const newRow = new RowBuilder(component.node).sliceExprs([]).build()
        component.row = newRow
        component.cd.detectChanges()
        const newSlices = getAllElement('logi-editor-slice')
        expect(newSlices.length).toBe(0)
    })
    it('should have selected style', () => {
        const el = getElement('.fb-container')
        el.classList.add('selected')
        const bgcolor = window.getComputedStyle(el).backgroundColor
        expect(bgcolor).toBe('rgba(65, 120, 184, 0.08)')
    })
    it('should have data-node attribute for contextmenu', () => {
        const row = new RowBuilder().name('').build()
        component.row = row
        component.cd.detectChanges()
        const collapseBtn = getElement('.formula')
        const parent = collapseBtn.parentElement
        expect(parent).not.toBeNull()
        const uuid = parent?.getAttribute('data-node')
        expect(uuid).toBe(component.node.uuid)
    })
    it('should have invalid color', () => {
        const row = new RowBuilder().name('').valid(false).build()
        component.row = row
        component.cd.detectChanges()
        const el = getElement('.input-name')
        const color = window.getComputedStyle(el).color
        expect(color).toBe('rgb(218, 41, 71)')
    })

    function getElement (selector: string): HTMLElement {
        return fixture.debugElement.query(By.css(selector)).nativeElement
    }

    function getAllElement (selector: string): HTMLElement[] {
        return fixture.debugElement.queryAll(By.css(selector)).map((
            el: DebugElement,
        ): HTMLElement =>
            el.nativeElement,)
    }
})

function mockRow (): Readonly<Row> {
    const slices = [
        new SliceExprBuilder().name('s1').build(),
        new SliceExprBuilder().name('s2').build(),
    ]
    return new RowBuilder()
        .name('test row')
        .labels(['tag', 'tag2'])
        .sliceExprs(slices)
        .expression('{row1}+{row2}')
        .isDefScalar(true)
        .build()
}
