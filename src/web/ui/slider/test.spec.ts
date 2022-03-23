import {Component, Type} from '@angular/core'
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {By} from '@angular/platform-browser'

import {LogiSliderComponent, LogiSliderModule} from './index'

// tslint:disable: no-magic-numbers
// tslint:disable: unknown-instead-of-any
// tslint:disable-next-line: max-func-body-length
describe('base ui slider test: ', (): void => {
    function configTestingModule(declarations: Type<any>[]): void {
        TestBed.configureTestingModule({
            declarations,
            imports: [LogiSliderModule],
        })
    }

    let fixture: ComponentFixture<BasicSliderComponent>
    let sliderInstance: LogiSliderComponent

    beforeEach((): void => {
        configTestingModule([BasicSliderComponent])
        fixture = TestBed.createComponent(BasicSliderComponent)
        const sliderDebugElement = fixture.debugElement.query(
            By.directive(LogiSliderComponent),
        )
        sliderInstance = sliderDebugElement.componentInstance
        fixture.detectChanges()
    })

    it('should set default values', (): void => {
        expect(sliderInstance.value).toBe(30)
    })
})

// tslint:disable-next-line: use-component-selector
@Component({
    template: `
<logi-slider
    [value]='30'
    [tooltipFormatter]='tooltipFormatter'
></logi-slider>
`,
})
class BasicSliderComponent {
    public tooltipFormatter = (v: number) => `${v}Q`
}
