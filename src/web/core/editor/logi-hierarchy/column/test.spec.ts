// tslint:disable: max-file-line-count no-magic-numbers
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
import {RouterModule} from '@angular/router'
import {RouterTestingModule} from '@angular/router/testing'
import {
    ColumnBuilder,
    SliceExprBuilder,
    Type as TagType,
} from '@logi/src/lib/hierarchy/core'
import {
    SimpleEditorComponent,
} from '@logi/src/web/core/editor/logi-hierarchy/simple-editor'
import {NodeFocusableModule} from '@logi/src/web/core/editor/node-focus'
import {EditorTestModule} from '@logi/src/web/core/editor/test'
import {IconComponent} from '@logi/src/web/testing'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {FbTagModule} from '../fb-tag/module'
import {LabelComponent} from '../label/component'

import {ColumnComponent} from './component'
import {SlicePartComponent} from './slice/component'

describe('Column component (with no slice) test: ', (): void => {
    let fixture: ComponentFixture<ColumnComponent>
    let component: ColumnComponent
    // tslint:disable-next-line: max-func-body-length
    beforeEach((): void => {
        TestBed
            .configureTestingModule({
                declarations: [
                    ColumnComponent,
                    LabelComponent,
                    SimpleEditorComponent,
                    SlicePartComponent,
                ],
                imports: [
                    EditorTestModule,
                    CommonModule,
                    RouterTestingModule,
                    LogiButtonModule,
                    FbTagModule,
                    FormsModule,
                    HttpClientModule,
                    HttpClientTestingModule,
                    MatAutocompleteModule,
                    MatDialogModule,
                    MatIconModule,
                    MatMenuModule,
                    MatSnackBarModule,
                    NodeFocusableModule,
                    RouterModule,
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
        fixture = TestBed.createComponent(ColumnComponent)
        component = fixture.componentInstance
        const basicCol = new ColumnBuilder().name('').build()
        component.col = basicCol
        fixture.detectChanges()
    })

    it('basic display', (): void => {
        const col = new ColumnBuilder()
            .name('col col')
            .labels(['label1', 'label2'])
            .sliceExprs([
                new SliceExprBuilder()
                    .name('slice1')
                    .expression('{row1}')
                    .build(),
                new SliceExprBuilder()
                    .name('slice2')
                    .expression('{row1}')
                    .build(),
            ])
            .type(TagType.ASSUMPTION)
            .build()
        component.col = col
        component.cd.detectChanges()
        const input = getElement('.input-name')
        expect(input.textContent).toBe(col.name)

        const slices = getAllElement('logi-editor-slice')
        expect(slices.length).toBe(2)
        const labels = getAllElement('logi-editor-label')
        expect(labels.length).toBe(2)
    })
    it('should add slice', (): void => {
        const oldCol = new ColumnBuilder()
            .name('col')
            .sliceExprs([new SliceExprBuilder().name('slice').build()])
            .build()
        component.col = oldCol
        component.cd.detectChanges()
        const slicesBefore = getAllElement('logi-editor-slice')
        expect(slicesBefore.length).toBe(1)
        const newCol = new ColumnBuilder()
            .name(oldCol.name)
            .sliceExprs([...oldCol.sliceExprs,
                new SliceExprBuilder().name('').build()],
            )
            .build()
        component.col = newCol
        component.cd.detectChanges()
        const slicesAfter = getAllElement('logi-editor-slice')
        expect(slicesAfter.length).toBe(2)
        const editor = getAllElement('logi-simple-editor')
        expect(editor.length).toBe(0)
    })
    it('should delete slice', (): void => {
        const oldCol = new ColumnBuilder()
            .name('col')
            .sliceExprs([new SliceExprBuilder().name('slice').build()])
            .build()
        component.col = oldCol
        component.cd.detectChanges()
        const slicesBefore = getAllElement('logi-editor-slice')
        expect(slicesBefore.length).toBe(1)
        const newCol = new ColumnBuilder().name(oldCol.name).build()
        component.col = newCol
        component.cd.detectChanges()
        const slicesAfter = getAllElement('logi-editor-slice')
        expect(slicesAfter.length).toBe(0)
    })

    it('should change tagType', (): void => {
        const oldCol = new ColumnBuilder().name('').type(TagType.FX).build()
        component.col = oldCol
        component.cd.detectChanges()
        const fxTag = fixture.debugElement.query(By.css('.fb-tag'))
        expect(fxTag.nativeElement.textContent).toBe('计算')

        const newCol = new ColumnBuilder()
            .uuid(oldCol.uuid)
            .name('')
            .type(TagType.FACT)
            .build()
        component.col = newCol
        component.cd.detectChanges()
        const factTag = fixture.debugElement.query(By.css('.fb-tag'))
        expect(factTag.nativeElement.textContent).toBe('事实')
    })
    it('should have data-node attribute for contextmenu', () => {
        const input = getElement('.formula')
        const parent = input.parentElement
        expect(parent).not.toBeNull()
        const uuid = parent?.getAttribute('data-node')
        expect(uuid).toBe(component.node.uuid)
    })
    function getElement(selector: string): HTMLElement {
        return fixture.debugElement.query(By.css(selector)).nativeElement
    }

    function getAllElement(selector: string): DebugElement[] {
        return fixture.debugElement.queryAll(By.css(selector))
    }
})
