// tslint:disable: no-non-null-assertion use-component-selector
// tslint:disable: codelyzer-template-use-track-by-function
import {Component} from '@angular/core'
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {MatIconTestingModule} from '@angular/material/icon/testing'
import {By} from '@angular/platform-browser'
import {
    LogiComboboxComponent,
    LogiComboboxModule,
    OptionPayload,
} from '@logi/src/web/ui/combobox'

const C_PLACEHOLDER = '.logi-combobox-placeholder'

describe('combobox test', () => {
    describe('single select', () => {
        let component: TestSingleSelectComponent
        let fixture: ComponentFixture<TestSingleSelectComponent>
        let host: HTMLElement
        beforeEach(() => {
            TestBed.configureTestingModule({
                declarations: [TestSingleSelectComponent],
                imports: [LogiComboboxModule, MatIconTestingModule],
            })
            fixture = TestBed.createComponent(TestSingleSelectComponent)
            component = fixture.componentInstance
            host = fixture.debugElement
                .query(By.directive(LogiComboboxComponent)).nativeElement
            fixture.detectChanges()
        })
        it('should have host class', () => {
            expect(host.classList).toContain('logi-combobox')
            expect(host.classList).toContain('logi-combobox-single')
        })
        it('placeholder work', () => {
            const before = host.querySelector(C_PLACEHOLDER)!.textContent
            expect(before).toBe('')
            component.placeholder = 'placeholder'
            fixture.detectChanges()
            const after = host.querySelector(C_PLACEHOLDER)!.textContent
            expect(after).toBe('placeholder')
        })
    })
})

@Component({
    template: `
    <logi-combobox [placeholder]='placeholder'>
        <logi-option *ngFor='let o of options' [value]='o.value' [label]='o.label'></logi-option>
    </logi-combobox>
`,
})
class TestSingleSelectComponent {
    options: readonly OptionPayload[] = []
    placeholder = ''
}
