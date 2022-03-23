// tslint:disable: no-magic-numbers no-type-assertion
import {HttpClientModule} from '@angular/common/http'
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {FormsModule} from '@angular/forms'
import {MatAutocompleteModule} from '@angular/material/autocomplete'
import {MatDialogModule} from '@angular/material/dialog'
import {MatIcon, MatIconModule} from '@angular/material/icon'
import {MatMenuModule} from '@angular/material/menu'
import {MatSnackBarModule} from '@angular/material/snack-bar'
import {By} from '@angular/platform-browser'
import {RouterTestingModule} from '@angular/router/testing'
import {RowBuilder} from '@logi/src/lib/hierarchy/core'
import {
    NAME_FOCUS_CLASS_NAME,
    SELECT_CLASS_NAME,
} from '@logi/src/web/core/editor/node-focus'
import {EditorTestModule} from '@logi/src/web/core/editor/test'
import {IconComponent} from '@logi/src/web/testing'

import {SeparatorComponent} from './component'

// tslint:disable: no-magic-numbers
describe('Separator component test: ', (): void => {
    let fixture: ComponentFixture<SeparatorComponent>
    let component: SeparatorComponent
    // tslint:disable-next-line: max-func-body-length
    beforeEach((): void => {
        TestBed
            .configureTestingModule({
                declarations: [
                    SeparatorComponent,
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
        fixture = TestBed.createComponent(SeparatorComponent)
        component = fixture.componentInstance
        const r = new RowBuilder().name('row').separator(true).build()
        component.fb = r
        fixture.detectChanges()
    })

    it('basic display', (): void => {
        fixture.whenRenderingDone().then(() => {
            const refNameInput = getElement('.input-name')
            expect(refNameInput.textContent).toBe('row')
        })
    })
    it('should show selected style', () => {
        const el = getElement('.fb-container')
        el.classList.add(SELECT_CLASS_NAME)
        const bgcolor = window.getComputedStyle(el).backgroundColor
        expect(bgcolor).toBe('rgba(65, 120, 184, 0.08)')
    })
    it('should show name focused style', () => {
        const el = getElement('.node-identifier')
        el.classList.add(NAME_FOCUS_CLASS_NAME)
        const style = window.getComputedStyle(el)
        expect(style.borderLeft).toBe('1px solid rgb(65, 120, 184)')
        expect(style.borderRight).toBe('1px solid rgb(65, 120, 184)')
        expect(style.backgroundColor).toBe('rgb(255, 255, 255)')
    })
    it('should have data-node attribute for contextmenu', () => {
        const container = getElement('.fb-container')
        expect(container).not.toBeNull()
        const uuid = container?.getAttribute('data-node')
        expect(uuid).toBe(component.node.uuid)
    })
    function getElement(selector: string): HTMLElement {
        return fixture.debugElement.query(By.css(selector)).nativeElement
    }
})
