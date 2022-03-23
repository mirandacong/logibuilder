// tslint:disable: max-file-line-count no-magic-numbers
import {OverlayContainer} from '@angular/cdk/overlay'
import {HttpClientModule} from '@angular/common/http'
import {HttpClientTestingModule} from '@angular/common/http/testing'
import {DebugElement} from '@angular/core'
import {ComponentFixture, inject, TestBed} from '@angular/core/testing'
import {FormsModule} from '@angular/forms'
import {MatAutocompleteModule} from '@angular/material/autocomplete'
import {MatButtonModule} from '@angular/material/button'
import {MatRippleModule} from '@angular/material/core'
import {MatDialogModule} from '@angular/material/dialog'
import {MatIcon, MatIconModule} from '@angular/material/icon'
import {MatMenuModule} from '@angular/material/menu'
import {MatSelectModule} from '@angular/material/select'
import {MatSnackBarModule} from '@angular/material/snack-bar'
import {By} from '@angular/platform-browser'
import {RouterTestingModule} from '@angular/router/testing'
import {
    ColumnBuilder,
    RowBlockBuilder,
    RowBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {assertIsHTMLInputElement} from '@logi/src/web/base/utils'
import {
    ContextMenuModule,
    ContextMenuService,
} from '@logi/src/web/common/context-menu'
import {CleanDataService} from '@logi/src/web/core/editor/clean-data'
import {EditorTestModule} from '@logi/src/web/core/editor/test'
import {
    createMouseEvent,
    dispatchEvent,
    IconComponent,
} from '@logi/src/web/testing'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {TableComponent} from './component'

// tslint:disable-next-line: max-func-body-length
describe('Table component test: ', (): void => {
    let fixture: ComponentFixture<TableComponent>
    let component: TableComponent
    // tslint:disable-next-line: max-func-body-length
    beforeEach(async (): Promise<void> => {
        TestBed
            .configureTestingModule({
                declarations: [
                    TableComponent,
                ],
                imports: [
                    EditorTestModule,
                    RouterTestingModule,
                    LogiButtonModule,
                    ContextMenuModule,
                    FormsModule,
                    HttpClientModule,
                    HttpClientTestingModule,
                    MatAutocompleteModule,
                    MatDialogModule,
                    MatIconModule,
                    MatMenuModule,
                    MatRippleModule,
                    MatSelectModule,
                    MatSnackBarModule,
                    MatButtonModule,
                ],
                providers: [
                    ContextMenuService,
                    RouterTestingModule,
                    CleanDataService,
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
        fixture = TestBed.createComponent(TableComponent)
        component = fixture.componentInstance
        component.collapse = false
        const table = new TableBuilder()
            .name('table table')
            .headerStub('stub stub')
            .subnodes([
                new RowBuilder().name('').build(),
                new RowBuilder().name('sep row').separator(true).build(),
                new ColumnBuilder().name('').build(),
                new ColumnBuilder().name('sep col').separator(true).build(),
            ])
            .build()
        component.node = table
        fixture.detectChanges()
    })
    afterEach(inject(
        [OverlayContainer],
        (currentOverlayContainer: OverlayContainer): void => {
            /**
             * Reference from material autocomplete unit test.
             */
            // tslint:disable-next-line: no-lifecycle-call
            currentOverlayContainer.ngOnDestroy()
        },
    ))

    it('basic test', (): void => {
        fixture.whenRenderingDone().then(() => {
            const nameInput = getElement('.block-name-input')
            assertIsHTMLInputElement(nameInput)
            expect(nameInput.value).toBe('table table')
            const stubInput = getElement('.stub-name')
            assertIsHTMLInputElement(stubInput)
            expect(stubInput.value).toBe('stub stub')
        })
        const columnTab = getElement('.column-row-tab.column-tab')
        expect(columnTab.textContent).toBe('编辑列')
        const rowTab = getElement('.column-row-tab.row-tab')
        expect(rowTab.textContent).toBe('编辑行')
    })
    it('should have selected style', () => {
        const el = getElement('.table-block-title')
        el.classList.add('selected')
        const bgcolor = window.getComputedStyle(el).backgroundColor
        expect(bgcolor).toBe('rgba(65, 120, 184, 0.08)')
    })
    it('should have data-node attribute for contextmenu', () => {
        const target = getElement('.table-block-title')
        const uuid = target?.getAttribute('data-node')
        expect(uuid).toBe(component.node.uuid)
    })
    it('should set iscolumntab', () => {
        const target = getElement('.column-row-tab.column-tab')
        const click = createMouseEvent('click')
        dispatchEvent(target, click)
        fixture.detectChanges()
        expect(component.isColumnTab).toBe(true)
    })
    it('has addBtn', () => {
        const el = component.addBtn.el.nativeElement
        expect(el).toBeDefined()
    })
    // tslint:disable-next-line: max-func-body-length
    describe('row tab test', (): void => {
        it('should have 1 row', () => {
            const rows = getAllElement('logi-editor-row')
            expect(rows.length).toBe(1)
        })
        it('should have 1 separated row', () => {
            const rows = getAllElement('logi-editor-separator')
            expect(rows.length).toBe(1)
        })
        it('should add row', (): void => {
            const oldTable = new TableBuilder()
                .name('table')
                .subnodes([new RowBuilder().name('').build()])
                .build()
            component.node = oldTable
            component.cd.detectChanges()
            const rowsBefore = getAllElement('logi-editor-row')
            expect(rowsBefore.length).toBe(1)
            const newTable = new TableBuilder()
                .name(oldTable.name)
                .subnodes([...oldTable.rows, new RowBuilder().name('').build()])
                .build()
            component.node = newTable
            component.cd.detectChanges()
            const rowsAfter = getAllElement('logi-editor-row')
            expect(rowsAfter.length).toBe(2)
        })
        it('should emit add row block payload', (): void => {
            const oldTable = new TableBuilder()
                .name('table')
                .subnodes([new RowBlockBuilder().name('').build()])
                .build()
            component.node = oldTable
            component.cd.detectChanges()
            const rowsBefore = getAllElement('logi-editor-row-block')
            expect(rowsBefore.length).toBe(1)
            const newTable = new TableBuilder()
                .name(oldTable.name)
                .subnodes([...oldTable.rows, new RowBlockBuilder()
                    .name('')
                    .build()])
                .build()
            component.node = newTable
            component.cd.detectChanges()
            const rowsAfter = getAllElement('logi-editor-row-block')
            expect(rowsAfter.length).toBe(2)
        })
    })
    // tslint:disable-next-line: max-func-body-length
    describe('column tab test', (): void => {
        beforeEach((): void => {
            component.isColumnTab = true
            component.cd.detectChanges()
        })
        it('should have one separated row', () => {
            const col = getAllElement('logi-editor-separator')
            expect(col.length).toBe(1)
        })
        it('should add column', (): void => {
            const oldTable = new TableBuilder()
                .name('table')
                .subnodes([new ColumnBuilder().name('').build()])
                .build()
            component.node = oldTable
            component.cd.detectChanges()
            const colsBefore = getAllElement('logi-editor-column')
            expect(colsBefore.length).toBe(1)
            const newTable = new TableBuilder()
                .name(oldTable.name)
                .uuid(oldTable.uuid)
                .subnodes([...oldTable.cols, new ColumnBuilder()
                    .name('')
                    .build()])
                .build()
            component.node = newTable
            component.cd.detectChanges()
            const colsAfter = getAllElement('logi-editor-column')
            expect(colsAfter.length).toBe(2)
        })
        it('should del column', (): void => {
            const oldTable = new TableBuilder()
                .name('table')
                .subnodes([new ColumnBuilder().name('').build()])
                .build()
            component.node = oldTable
            component.cd.detectChanges()
            const colsBefore = getAllElement('logi-editor-column')
            expect(colsBefore.length).toBe(1)
            const newTable = new TableBuilder()
                .name(oldTable.name)
                .uuid(oldTable.uuid)
                .subnodes([])
                .build()
            component.node = newTable
            component.cd.detectChanges()
            const colsAfter = getAllElement('logi-editor-column')
            expect(colsAfter.length).toBe(0)
        })
    })
    function getElement (selector: string): HTMLElement {
        return fixture.debugElement.query(By.css(selector)).nativeElement
    }

    function getAllElement (selector: string): HTMLElement[] {
        return fixture.debugElement
            .queryAll(By.css(selector))
            .map((el: DebugElement): HTMLElement =>
                el.nativeElement)
    }
})
