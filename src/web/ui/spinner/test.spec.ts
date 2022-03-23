import {ComponentFixture, TestBed} from '@angular/core/testing'

import {SpinnerComponent} from './component'

describe('Spinner component test: ', (): void => {
    let fixture: ComponentFixture<SpinnerComponent>
    let component: SpinnerComponent

    beforeEach((): void => {
        TestBed.configureTestingModule({
            declarations: [
                SpinnerComponent,
            ],
        })
        fixture = TestBed.createComponent(SpinnerComponent)
        component = fixture.componentInstance
    })

    it('component has a message filed', (): void => {
        expect(component).toBeDefined()
    })
})
