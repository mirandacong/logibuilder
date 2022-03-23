import {OverlayContainer} from '@angular/cdk/overlay'
import {HarnessLoader} from '@angular/cdk/testing'
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed'
import {Component} from '@angular/core'
import {ComponentFixture, inject, TestBed} from '@angular/core/testing'
import {ContextMenuModule} from '@logi/src/web/common/context-menu'
import {ContextMenuHarness} from '@logi/src/web/common/context-menu/testing'

// tslint:disable: no-null-keyword no-magic-numbers
describe('contextmenu test', (): void => {
    let fixture: ComponentFixture<TestComponent>
    let loader: HarnessLoader
    let component: TestComponent
    let overlayContainer: OverlayContainer
    beforeEach((): void => {
        TestBed.configureTestingModule({
            declarations: [TestComponent],
            imports: [ContextMenuModule.forRoot()],
        })
        fixture = TestBed.createComponent(TestComponent)
        fixture.detectChanges()
        component = fixture.componentInstance
        loader = TestbedHarnessEnvironment.loader(fixture)
        inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc
        })()
    })

    afterEach(() => {
        // tslint:disable-next-line: no-lifecycle-call
        overlayContainer.ngOnDestroy()
        // tslint:disable-next-line: no-non-null-assertion
        overlayContainer = null!
    })

    it('should load all contextmenu harness', async() => {
        const contextmenus = await loader.getAllHarnesses(ContextMenuHarness)
        expect(contextmenus.length).toBe(1)
    })

    it('get contextmenu items', async() => {
        const trigger = await loader.getHarness(ContextMenuHarness)
        await trigger.trigger()
        const items = await trigger.getItems()
        expect(items.length).toBe(2)
        expect(await items[1].getText()).toBe('bar')
    })

    it('contextmenu item click', async() => {
        const trigger = await loader.getHarness(ContextMenuHarness)
        await trigger.trigger()
        const items = await trigger.getItems()
        await items[0].click()
        expect(component.message).toBe('foo')
    })
})

// tslint:disable: codelyzer-template-property-should-be-public
// tslint:disable-next-line: use-component-selector
@Component({
    template: `
<div #test logi-context-menu [contextMenu]='menu' [contextMenuSubject]='subject'>row</div>
<logi-context-menu #menu='logiContextMenu'>
    <ng-template logi-context-menu-item (execute)='setMessage("foo")'>foo</ng-template>
    <ng-template logi-context-menu-item (execute)='setMessage("bar")'>bar</ng-template>
</logi-context-menu>
`,
})
class TestComponent {
    public subject = 'test'
    public message = ''

    public setMessage(message: string): void {
        this.message = message
    }
}
