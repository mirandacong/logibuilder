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
import {MatSelectModule} from '@angular/material/select'
import {MatSnackBarModule} from '@angular/material/snack-bar'
import {By} from '@angular/platform-browser'
import {TitleBuilder} from '@logi/src/lib/hierarchy/core'
import {EditorTestModule} from '@logi/src/web/core/editor/test'
import {IconComponent} from '@logi/src/web/testing'

import {TitleComponent} from './component'

describe('Title component test: ', (): void => {
    let fixture: ComponentFixture<TitleComponent>
    let component: TitleComponent
    // tslint:disable-next-line: max-func-body-length
    beforeEach((): void => {
        TestBed
            .configureTestingModule({
                declarations: [
                    TitleComponent,
                ],
                imports: [
                    FormsModule,
                    HttpClientModule,
                    HttpClientTestingModule,
                    MatAutocompleteModule,
                    EditorTestModule,
                    MatDialogModule,
                    MatIconModule,
                    MatMenuModule,
                    MatSelectModule,
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
        fixture = TestBed.createComponent(TitleComponent)
        component = fixture.componentInstance
        const title = new TitleBuilder()
            .name('title1')
            .tree([new TitleBuilder().name('').build()])
            .build()
        component.node = title
        component.collapse = false
        fixture.detectChanges()
    })

    it('should display name and children', (): void => {
        fixture.whenRenderingDone().then(() => {
            const nameInput = fixture.debugElement.query(
                By.css('.title-name-input'),
            )
            expect(nameInput.nativeElement.value).toBe('title1')
        })
        const subnodes = getAllElement()
        expect(subnodes.length).toBe(1)
    })
    it('should add title', (): void => {
        const oldTitle = new TitleBuilder()
            .name('title')
            .tree([new TitleBuilder().name('').build()])
            .build()
        component.node = oldTitle
        component.cd.detectChanges()
        const titlesBefore = getAllElement()
        expect(titlesBefore.length).toBe(1)
        const newTitle = new TitleBuilder(oldTitle)
            .tree([...oldTitle.tree, new TitleBuilder().name('').build()])
            .build()
        component.node = newTitle
        component.cd.detectChanges()
        const titlesAfter = getAllElement()
        expect(titlesAfter.length).toBe(2)
    })
    it('should have selected style', () => {
        const el = getElement('.title-block-header')
        el.classList.add('selected')
        const bgcolor = window.getComputedStyle(el).backgroundColor
        expect(bgcolor).toBe('rgba(117, 117, 117, 0.08)')
    })
    it('should have data-node attribute for contextmenu', () => {
        const input = getElement('.title-name-input')
        const parent = input.parentElement
        expect(parent).not.toBeNull()
        const uuid = parent?.getAttribute('data-node')
        expect(uuid).toBe(component.node.uuid)
    })
    function getElement(selector: string): HTMLElement {
        return fixture.debugElement.query(By.css(selector)).nativeElement
    }

    function getAllElement(
        selector = 'logi-editor-title.title-children',
    ): DebugElement[] {
        return fixture.debugElement.queryAll(By.css(selector))
    }
})
