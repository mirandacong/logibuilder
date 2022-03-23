import {OverlayContainer} from '@angular/cdk/overlay'
import {HarnessLoader} from '@angular/cdk/testing'
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed'
import {Component} from '@angular/core'
import {ComponentFixture, inject, TestBed} from '@angular/core/testing'
import {LogiMenuModule} from '@logi/src/web/ui/menu'
import {
    LogiContextMenuHarness,
    LogiMenuHarness,
} from '@logi/src/web/ui/menu/testing'

// tslint:disable: no-null-keyword no-magic-numbers
describe('menu test', (): void => {
    let fixture: ComponentFixture<TestMenuComponent>
    let loader: HarnessLoader
    let overlayContainer: OverlayContainer
    beforeEach((): void => {
        TestBed.configureTestingModule({
            declarations: [TestMenuComponent],
            imports: [LogiMenuModule],
        })
        fixture = TestBed.createComponent(TestMenuComponent)
        fixture.detectChanges()
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

    it('should load all menu harness', async() => {
        const menus = await loader.getAllHarnesses(LogiMenuHarness)
        expect(menus.length).toBe(2)
    })

    it('should get disabled state', async() => {
        // tslint:disable-next-line: typedef
        const [enabledMenu, disabledMenu] = await loader.getAllHarnesses(
            LogiMenuHarness,
        )
        expect(await enabledMenu.isDisabled()).toBe(false)
        expect(await disabledMenu.isDisabled()).toBe(true)
    })

    it('should get all items', async() => {
        const menu = await loader.getHarness(LogiMenuHarness.with({
            triggerText: 'settings',
        }))
        await menu.open()
        expect((await menu.getItems()).length).toBe(2)
    })
})

// tslint:disable: no-non-null-assertion
// tslint:disable-next-line: max-func-body-length
describe('multi-leve menu test', () => {
    let fixture: ComponentFixture<TestNestedMenuComponent>
    let loader: HarnessLoader
    let overlayContainer: OverlayContainer
    beforeEach((): void => {
        TestBed.configureTestingModule({
            declarations: [TestNestedMenuComponent],
            imports: [LogiMenuModule],
        })
        fixture = TestBed.createComponent(TestNestedMenuComponent)
        fixture.detectChanges()
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

    it('should get submenus', async() => {
        const menu1 = await loader
            .getHarness(LogiMenuHarness.with({triggerText: 'Menu 1'}))

        await menu1.open()
        let submenus = await menu1.getItems({hasSubmenu: true})
        expect(submenus.length).toBe(2)
        const menu2 = (await submenus[0].getSubmenu())!
        const menu3 = (await submenus[1].getSubmenu())!
        expect(await menu2.getTriggerText()).toBe('Menu 2')
        expect(await menu3.getTriggerText()).toBe('Menu 3')

        await menu2.open()
        expect((await menu2.getItems({hasSubmenu: true})).length).toBe(0)

        await menu3.open()
        submenus = await menu3.getItems({hasSubmenu: true})
        expect(submenus.length).toBe(1)
        const menu4 = (await submenus[0].getSubmenu())!
        expect(await menu4.getTriggerText()).toBe('Menu 4')

        await menu4.open()
        expect((await menu4.getItems({hasSubmenu: true})).length).toBe(0)
    })

    it('should select item in top-level menu', async() => {
        const menu1 = await loader
            .getHarness(LogiMenuHarness.with({triggerText: 'Menu 1'}))
        await menu1.clickItem({text: /Leaf/})
        expect(fixture.componentInstance.lastClickedLeaf).toBe(1)
    })

    it('should throw when item is not found', async() => {
        const menu1 = await loader
            .getHarness(LogiMenuHarness.with({triggerText: 'Menu 1'}))
        await expectAsync(menu1.clickItem({text: 'Fake Item'}))
            .toBeRejectedWithError(
                /Could not find item matching {"text":"Fake Item"}/,
            )
    })

    it('should select item in nested menu', async() => {
        const menu1 = await loader
            .getHarness(LogiMenuHarness.with({triggerText: 'Menu 1'}))
        await menu1
            .clickItem({text: 'Menu 3'}, {text: 'Menu 4'}, {text: /Leaf/})
        expect(fixture.componentInstance.lastClickedLeaf).toBe(3)
    })

    it('should throw when intermediate item does not have submenu', async() => {
        const menu1 = await loader
            .getHarness(LogiMenuHarness.with({triggerText: 'Menu 1'}))
        await expectAsync(menu1.clickItem({text: 'Leaf Item 1'}, {}))
            .toBeRejectedWithError(
                /Item matching {"text":"Leaf Item 1"} does not have a submenu/,
            )
    })
})

describe('contextmenu test', (): void => {
    let fixture: ComponentFixture<TestContextMenuComponent>
    let loader: HarnessLoader
    let overlayContainer: OverlayContainer
    beforeEach((): void => {
        TestBed.configureTestingModule({
            declarations: [TestContextMenuComponent],
            imports: [LogiMenuModule],
        })
        fixture = TestBed.createComponent(TestContextMenuComponent)
        fixture.detectChanges()
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

    it('should load all context menu harness', async() => {
        const menus = await loader.getAllHarnesses(LogiContextMenuHarness)
        expect(menus.length).toBe(1)
    })

    it('should get all items', async() => {
        const menu = await loader.getHarness(LogiContextMenuHarness.with({
            triggerText: 'settings',
        }))
        await menu.open()
        const items = await menu.getItems()
        expect(items.length).toBe(2)
        expect(await (items[0].getText())).toBe('foo:1')
    })
})

// tslint:disable: codelyzer-template-property-should-be-public
// tslint:disable: component-max-inline-declarations use-component-selector
@Component({
    template: `
<button [logiMenuTrigger]='menu'>settings</button>
<button disabled [logiMenuTrigger]='menu'>disabled menu</button>
<logi-menu #menu>
    <menu logi-menu-item>foo</menu>
    <menu logi-menu-item>bar</menu>
</logi-menu>
`,
})
class TestMenuComponent {}

@Component({
    template: `
<button [logiMenuTrigger]='menu1'>Menu 1</button>

<logi-menu #menu1>
    <button logi-menu-item [logiMenuTrigger]="menu2">Menu 2</button>
    <button logi-menu-item (click)="lastClickedLeaf = 1">Leaf Item 1</button>
    <button logi-menu-item [logiMenuTrigger]="menu3">Menu 3</button>
</logi-menu>

<logi-menu #menu2>
    <button logi-menu-item (click)="lastClickedLeaf = 2">Leaf Item 2</button>
</logi-menu>

<logi-menu #menu3>
    <button logi-menu-item [logiMenuTrigger]="menu4">Menu 4</button>
</logi-menu>

<logi-menu #menu4>
    <button logi-menu-item (click)="lastClickedLeaf = 3">Leaf Item 3</button>
</logi-menu>
`,
})
class TestNestedMenuComponent {
    public lastClickedLeaf = 0
}

@Component({
    template: `
<button [logiContextMenuTrigger]='menu' [menuData]='data'>settings</button>
<logi-menu #menu>
    <ng-template logi-menu-content let-data>
        <menu logi-menu-item>foo:{{data.foo}}</menu>
        <menu logi-menu-item>bar:{{data.bar}}</menu>
    </ng-template>
</logi-menu>
`,
})
class TestContextMenuComponent {
    public data = {
        bar: '2',
        foo: '1',
    }
}
