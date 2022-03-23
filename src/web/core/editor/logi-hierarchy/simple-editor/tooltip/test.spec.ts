import {OverlayModule} from '@angular/cdk/overlay'
import {CommonModule} from '@angular/common'
import {Component, ElementRef, NgModule, ViewChild} from '@angular/core'
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {By} from '@angular/platform-browser'

import {TooltipModule} from './module'
import {TooltipService} from './service'

// tslint:disable: template-i18n
@Component({
    selector: 'logi-tooltip-test',
    template: `
    <div class='msg'>message</div>
    `,
})
// tslint:disable-next-line: no-unnecessary-class
export class TooltipTestComponent {}

@Component({
    selector: 'logi-sample-test',
    template: `
    <div> Sample Test</div>
    <div #target id='target'>Target Element</div>
    <div class='hover' (mouseenter)='onShowTooltip()'
        (mouseleave)='onCloseTooltip()'> hover
    </div>
    `,
})
class SampleComponent {
    public constructor(private readonly _service: TooltipService) {}

    public onShowTooltip(): void {
        this._service.show(this._target, 'message')
    }

    public onCloseTooltip(): void {
        this._service.hide()
    }
    @ViewChild(
        'target',
        {static: true},
    ) private _target!: ElementRef<HTMLElement>
}

@NgModule({
    declarations: [
        TooltipTestComponent,
    ],
    entryComponents: [
        TooltipTestComponent,
    ],
})
// tslint:disable-next-line: no-unnecessary-class
export class SampleModule {}

describe('Test tooltip directive', () => {
    let fixture: ComponentFixture<SampleComponent>
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                SampleComponent,
                TooltipTestComponent,
            ],
            imports: [
                CommonModule,
                OverlayModule,
                TooltipModule,
            ],
            providers: [TooltipService],
        })
        fixture = TestBed.createComponent(SampleComponent)
        fixture.detectChanges()
    })

    it('Should show correct meaasge on the tooltip ', (): void => {
        const hoverElement = fixture.debugElement
            .query(By.css('.hover')).nativeElement as HTMLDivElement
        hoverElement.dispatchEvent(new Event('mouseenter'))
        fixture.detectChanges()
        const msg = document.querySelector('.msg') as HTMLElement
        const text = msg.textContent
        expect(text).not.toBeNull()
        if (text === null)
            return
        expect(text.trim()).toBe('message')
    })
})
