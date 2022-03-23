// tslint:disable:no-magic-numbers
import { HttpClientModule } from '@angular/common/http'
import { DebugElement } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormsModule } from '@angular/forms'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatDialogModule } from '@angular/material/dialog'
import { MatIcon, MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatSelectModule } from '@angular/material/select'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { By } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterTestingModule } from '@angular/router/testing'
import {
    SheetBuilder,
    TableBuilder,
    TitleBuilder,
} from '@logi/src/lib/hierarchy/core'
import { ContextMenuService } from '@logi/src/web/common/context-menu'
import { CleanDataService } from '@logi/src/web/core/editor/clean-data'
import {
    ContextMenuActionService,
} from '@logi/src/web/core/editor/contextmenu-action'
import { EditorTestModule } from '@logi/src/web/core/editor/test'
import { IconComponent } from '@logi/src/web/testing'

import { SheetComponent } from './component'

// tslint:disable-next-line: max-func-body-length
describe('Sheet with subnodes test: ', (): void => {
    let fixture: ComponentFixture<SheetComponent>
    let component: SheetComponent
    // tslint:disable-next-line: max-func-body-length
    beforeEach((): void => {
        TestBed
            .configureTestingModule({
                declarations: [SheetComponent],
                imports: [
                    RouterTestingModule,
                    BrowserAnimationsModule,
                    FormsModule,
                    HttpClientModule,
                    MatAutocompleteModule,
                    MatDialogModule,
                    MatIconModule,
                    MatMenuModule,
                    MatSelectModule,
                    MatSnackBarModule,
                    EditorTestModule,
                ],
                providers: [
                    ContextMenuActionService,
                    ContextMenuService,
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
        fixture = TestBed.createComponent(SheetComponent)
        component = fixture.componentInstance
        const sheet = new SheetBuilder()
            .name('sheet sheet')
            .tree([
                new TitleBuilder().name('').build(),
                new TitleBuilder().name('').build(),
                new TableBuilder().name('').build(),
            ])
            .build()
        component.node = sheet
        fixture.detectChanges()
    })

    it('should display title and table', (): void => {
        const titles = getAllElement('logi-editor-title')
        expect(titles.length).toBe(2)
        const tables = getAllElement('logi-editor-table')
        expect(tables.length).toBe(1)
    })
    it('should show empty view', () => {
        const sheet = new SheetBuilder().name('').build()
        component.node = sheet
        component.cd.detectChanges()
        const initblock = getElement('.init-create-block')
        expect(initblock).toBeDefined()
    })

    it('should add table', (): void => {
        const sheet = new SheetBuilder(component.node)
            .tree([
                ...component.node.tree,
                new TableBuilder().name('').build(),
            ])
            .build()
        component.node = sheet
        component.cd.detectChanges()
        const tables = getAllElement('logi-editor-table')
        expect(tables.length).toBe(2)
    })
    it('should add title', (): void => {
        const sheet = new SheetBuilder(component.node)
            .tree([
                ...component.node.tree,
                new TitleBuilder().name('').build(),
            ])
            .build()
        component.node = sheet
        component.cd.detectChanges()
        const tables = getAllElement('logi-editor-title')
        expect(tables.length).toBe(3)
    })

    function getElement (selector: string): HTMLElement {
        return fixture.debugElement.query(By.css(selector)).nativeElement
    }

    function getAllElement (selector: string): HTMLElement[] {
        return fixture.debugElement.queryAll(By.css(selector)).map(
            (el: DebugElement): HTMLElement => el.nativeElement,
        )
    }
})
