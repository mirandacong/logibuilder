import {ComponentFixture, TestBed} from '@angular/core/testing'

import {EmptyComponent} from './component'

describe('Empty component test: ', (): void => {
    let fixture: ComponentFixture<EmptyComponent >
    let component: EmptyComponent

    beforeEach((): void => {
        TestBed.configureTestingModule({
            declarations: [
                EmptyComponent,
            ],
        })
        fixture = TestBed.createComponent(EmptyComponent)
        component = fixture.componentInstance
    })
    it('have empty page', (): void => {
        expect(component).toBeDefined()
    })
})
