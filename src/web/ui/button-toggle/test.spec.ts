import {Component, Type} from '@angular/core'
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {By} from '@angular/platform-browser'

import {
    LogiButtonToggleComponent,
    LogiButtonToggleGroupDirective,
    LogiButtonToggleModule,
} from './index'

// tslint:disable: max-func-body-length unknown-instead-of-any no-magic-numbers
describe('base ui button toggle test: ', () => {
    function configTestingModule(declarations: Type<any>[]): void {
        TestBed.configureTestingModule({
            declarations,
            imports: [LogiButtonToggleModule],
        })
    }

    describe('basic display', () => {
        let fixture: ComponentFixture<BasicDisplayComponent>
        let groupInstance: LogiButtonToggleGroupDirective<any>
        let buttonInstances: LogiButtonToggleComponent<any>[]

        beforeEach(() => {
            configTestingModule([BasicDisplayComponent])
            fixture = TestBed.createComponent(BasicDisplayComponent)
            const debugGroup = fixture.debugElement.query(
                By.directive(LogiButtonToggleGroupDirective),
            )
            const debugButtons = fixture.debugElement.queryAll(
                By.directive(LogiButtonToggleComponent),
            )
            groupInstance = debugGroup.injector
                .get(LogiButtonToggleGroupDirective)
            buttonInstances = debugButtons.map(d => d.componentInstance)
            fixture.detectChanges()
        })

        it('set default value', () => {
            expect(buttonInstances.length).toBe(2)
            expect(buttonInstances[1].value).toBe('bar')
            expect(groupInstance.isPreselected(buttonInstances[1])).toBe(true)
        })
    })
})

// tslint:disable: use-component-selector template-i18n
@Component({
    template: `
<logi-button-toggle-group [value]='value'>
    <logi-button-toggle value='foo'>foo</logi-button-toggle>
    <logi-button-toggle value='bar'>bar</logi-button-toggle>
</logi-button-toggle-group>
`,
})
class BasicDisplayComponent {
    public value = 'bar'
}
