// tslint:disable:no-magic-numbers
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {By} from '@angular/platform-browser'

import {LabelComponent} from './component'

// tslint:disable-next-line: max-func-body-length
describe('Label content component test: ', (): void => {
    let fixture: ComponentFixture<LabelComponent>
    let component: LabelComponent
    beforeEach((): void => {
        TestBed.configureTestingModule({
            declarations: [LabelComponent],
        })
        fixture = TestBed.createComponent(LabelComponent)
        component = fixture.componentInstance
    })

    it('should display tags', (): void => {
        component.label = 'tag'
        fixture.detectChanges()
        const tags = fixture.debugElement.queryAll(By.css('.label-tags'))
        expect(tags.length).toBe(1)
        expect(tags[0].nativeElement.textContent).toBe('tag')
        const attrs = fixture.debugElement.queryAll(By.css('.label-attrs'))
        expect(attrs.length).toBe(0)
    })
})
