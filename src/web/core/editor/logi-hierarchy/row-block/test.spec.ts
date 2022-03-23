// tslint:disable: no-magic-numbers no-type-assertion
import {HttpClientModule} from '@angular/common/http'
import {DebugElement} from '@angular/core'
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {FormsModule} from '@angular/forms'
import {MatAutocompleteModule} from '@angular/material/autocomplete'
import {MatDialogModule} from '@angular/material/dialog'
import {MatIcon, MatIconModule} from '@angular/material/icon'
import {MatMenuModule} from '@angular/material/menu'
import {MatSnackBarModule} from '@angular/material/snack-bar'
import {By} from '@angular/platform-browser'
import {RouterTestingModule} from '@angular/router/testing'
import {RowBlockBuilder, RowBuilder} from '@logi/src/lib/hierarchy/core'
import {assertIsHTMLInputElement} from '@logi/src/web/base/utils'
import {EditorTestModule} from '@logi/src/web/core/editor/test'
import {
    createMouseEvent,
    dispatchEvent,
    IconComponent,
} from '@logi/src/web/testing'

import {RowBlockComponent} from './component'

// tslint:disable: no-magic-numbers
describe('Row block component test: ', (): void => {
    let fixture: ComponentFixture<RowBlockComponent>
    let component: RowBlockComponent
    // tslint:disable-next-line: max-func-body-length
    beforeEach((): void => {
        TestBed
            .configureTestingModule({
                declarations: [
                    RowBlockComponent,
                ],
                imports: [
                    RouterTestingModule,
                    FormsModule,
                    HttpClientModule,
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
                remove : {
                    declarations: [MatIcon],
                    exports: [MatIcon],
                },
            })
        fixture = TestBed.createComponent(RowBlockComponent)
        component = fixture.componentInstance
        const rb = new RowBlockBuilder()
            .name('rb rb')
            .tree([
                new RowBlockBuilder().name('sub row').build(),
                new RowBuilder().name('sub row').build(),
                new RowBuilder().name('sub row').build(),
                new RowBuilder().name('sep row').separator(true).build(),
            ])
            .build()
        component.node = rb
        fixture.detectChanges()
    })

    it('basic display', (): void => {
        const collapseBtn = getElement('.collapsed-btn')
        expect(collapseBtn).toBeDefined()
        const subrow = getAllElement('logi-editor-row')
        expect(subrow.length).toBe(2)
        const subrb = getAllElement('.dropzone logi-editor-row-block')
        expect(subrb.length).toBe(1)
        const subSepRow = getAllElement('logi-editor-separator')
        expect(subSepRow.length).toBe(1)

        fixture.whenRenderingDone().then(() => {
            const refNameInput = getElement('.ref-name-input')
            assertIsHTMLInputElement(refNameInput)
            expect(refNameInput.value).toBe('rb rb')
        })
    })

    it('should show or hide subrows after click collpase btn', (): void => {
        const subRbs = getAllElement('logi-editor-row-block')
        expect(subRbs.length).toBe(1)
        const subRows = getAllElement('logi-editor-row')
        const subrowCount = 2
        expect(subRows.length).toBe(subrowCount)

        const collpaseBtn = getElement('.collapsed-btn')
        const mousedownEvent = createMouseEvent('mousedown')
        dispatchEvent(collpaseBtn, mousedownEvent)
        fixture.detectChanges()

        const collapsedNodes = getAllElement('.collapsed')
        const collapsedCount = 4
        expect(collapsedNodes.length).toBe(collapsedCount)
        collapsedNodes.forEach((e: HTMLElement): void => {
            const value = getComputedStyle(e).getPropertyValue('display')
            expect(value).toBe('none')
        })
    })
    it('should change name', (): void => {
        // tslint:disable-next-line: no-type-assertion
        const input = getElement('.ref-name-input') as HTMLInputElement
        dispatchEvent(input, new Event('focusin'))
        input.value = 'r'
        dispatchEvent(input, new Event('input'))
        dispatchEvent(input, new Event('blur'))
        const nameInput = getElement('.ref-name-input') as HTMLInputElement
        expect(nameInput.value).toBe('r')
    })
    it('should add sub row', (): void => {
        const oldRb = new RowBlockBuilder()
            .name('rb')
            .tree([new RowBuilder().name('').build()])
            .build()
        component.node = oldRb
        component.cd.detectChanges()
        const subnodeBefore = getAllElement('logi-editor-row')
        expect(subnodeBefore.length).toBe(1)
        const newRb = new RowBlockBuilder()
            .name('rb')
            .uuid(oldRb.uuid)
            .tree([...oldRb.tree, new RowBuilder().name('').build()])
            .build()
        component.node = newRb
        component.cd.detectChanges()
        const subnodeAfter = getAllElement('logi-editor-row')
        expect(subnodeAfter.length).toBe(2)
    })
    it('should add sub rowblock', (): void => {
        const oldRb = new RowBlockBuilder()
            .name('rb')
            .tree([new RowBlockBuilder().name('').build()])
            .build()
        component.node = oldRb
        component.cd.detectChanges()
        const subnodeBefore = getAllElement('.dropzone logi-editor-row-block')
        expect(subnodeBefore.length).toBe(1)
        const newRb = new RowBlockBuilder()
            .name('rb')
            .uuid(oldRb.uuid)
            .tree([...oldRb.tree, new RowBlockBuilder().name('').build()])
            .build()
        component.node = newRb
        component.cd.detectChanges()
        const subnodeAfter = getAllElement('.dropzone logi-editor-row-block')
        expect(subnodeAfter.length).toBe(2)
    })
    it('should show empty wrapper', () => {
        const emptyblock = fixture.debugElement.query(By.css('.empty-block'))
        expect(emptyblock).toBeDefined()
    })
    it('should show selected style', () => {
        const el = getElement('.row-block')
        el.classList.add('selected')
        const bgcolor = window.getComputedStyle(el).backgroundColor
        expect(bgcolor).toBe('rgba(19, 172, 89, 0.08)')
    })
    it('should have data-node attribute for contextmenu', () => {
        const collapseBtn = getElement('.collapsed-btn')
        const parent = collapseBtn.parentElement
        expect(parent).not.toBeNull()
        const uuid = parent?.getAttribute('data-node')
        expect(uuid).toBe(component.node.uuid)
    })
    function getElement(selector: string): HTMLElement {
        return fixture.debugElement.query(By.css(selector)).nativeElement
    }

    function getAllElement(selector: string): HTMLElement[] {
        return fixture.debugElement
            .queryAll(By.css(selector))
            .map((el: DebugElement): HTMLElement => el.nativeElement)
    }
})
