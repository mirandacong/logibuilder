// tslint:disable: no-magic-numbers no-type-assertion
import {CommonModule} from '@angular/common'
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
import {ColumnBlockBuilder, ColumnBuilder} from '@logi/src/lib/hierarchy/core'
import {assertIsHTMLInputElement} from '@logi/src/web/base/utils'
import {EditorTestModule} from '@logi/src/web/core/editor/test'
import {IconComponent} from '@logi/src/web/testing'

import {ColumnBlockComponent} from './component'

describe('Column block component test: ', (): void => {
    let fixture: ComponentFixture<ColumnBlockComponent>
    let component: ColumnBlockComponent
    // tslint:disable-next-line: max-func-body-length
    beforeEach((): void => {
        TestBed
            .configureTestingModule({
                declarations: [
                    ColumnBlockComponent,
                ],
                imports: [
                    EditorTestModule,
                    CommonModule,
                    FormsModule,
                    HttpClientModule,
                    HttpClientTestingModule,
                    MatAutocompleteModule,
                    MatDialogModule,
                    MatIconModule,
                    MatMenuModule,
                    MatSnackBarModule,
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
        fixture = TestBed.createComponent(ColumnBlockComponent)
        component = fixture.componentInstance
        const cb = new ColumnBlockBuilder()
            .name('cb cb')
            .tree([
                new ColumnBlockBuilder().name('sub cb').build(),
                new ColumnBuilder().name('sub col').build(),
                new ColumnBuilder().name('sep col').separator(true).build(),
            ])
            .build()
        component.node = cb
        fixture.detectChanges()
    })

    it('basic display', (): void => {
        /**
         * Can run in `bazel test`, but not in `bazel run`.
         */
        fixture.whenRenderingDone().then(() => {
            const input = getElement('.column-refname-input')
            assertIsHTMLInputElement(input)
            expect(input.value).toBe('cb cb')
        })
        const subCbs = getAllElement('logi-editor-column-block.subnode')
        expect(subCbs.length).toBe(1)
        const subCols = getAllElement('logi-editor-column.subnode')
        expect(subCols.length).toBe(1)
        const subSepCol = getAllElement('logi-editor-separator')
        expect(subSepCol.length).toBe(1)
    })
    it('should add col', (): void => {
        const oldCb = new ColumnBlockBuilder()
            .name('')
            .tree([new ColumnBuilder().name('old old col').build()])
            .build()
        component.node = oldCb
        component.cd.detectChanges()
        const columnsBefore = getAllElement('logi-editor-column.subnode')
        expect(columnsBefore.length).toBe(1)
        const newCb = new ColumnBlockBuilder()
            .name(oldCb.name)
            .uuid(oldCb.uuid)
            .tree([...oldCb.tree, new ColumnBuilder()
                .name('new new col')
                .build()])
            .build()
        component.node = newCb
        component.cd.detectChanges()
        const columnsAfter = getAllElement('logi-editor-column')
        expect(columnsAfter.length).toBe(2)
    })

    it('should add block', (): void => {
        const oldCb = new ColumnBlockBuilder()
            .name('cb')
            .tree([new ColumnBlockBuilder().name('').build()])
            .build()
        component.node = oldCb
        component.cd.detectChanges()
        const columnsBefore = getAllElement('logi-editor-column-block.subnode')
        expect(columnsBefore.length).toBe(1)
        const newCb = new ColumnBlockBuilder()
            .name(oldCb.name)
            .uuid(oldCb.uuid)
            .tree([...oldCb.tree, new ColumnBlockBuilder()
                .name('new new col')
                .build()])
            .build()
        component.node = newCb
        component.cd.detectChanges()
        const columnsAfter = getAllElement('logi-editor-column-block.subnode')
        expect(columnsAfter.length).toBe(2)
    })
    it('have selected style', () => {
        getElement('.column-block-title').classList.add('selected')
        const el = getElement('.column-block-title.selected')
        const bgColor = window.getComputedStyle(el).backgroundColor
        expect(bgColor).toBe('rgba(19, 172, 89, 0.08)')
    })
    it('should have data-node attribute for contextmenu', () => {
        const input = getElement('.column-refname-input')
        const parent = input.parentElement
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
            .map((el: DebugElement): HTMLElement =>
                el.nativeElement)
    }
})
