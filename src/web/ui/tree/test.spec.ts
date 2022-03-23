import {SelectionModel} from '@angular/cdk/collections'
import {HarnessLoader} from '@angular/cdk/testing'
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed'
import {Component, Type} from '@angular/core'
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {MatIconTestingModule} from '@angular/material/icon/testing'
import {MatTreeModule} from '@angular/material/tree'
import {LogiCheckboxModule} from '@logi/src/web/ui/checkbox'
import {CheckboxHarness} from '@logi/src/web/ui/checkbox/testing'

import {LogiTreeModule, TreeNode, TreeNodeBuilder} from './index'
import {TreeNodeHarness} from './testing'

// tslint:disable: no-magic-numbers
// tslint:disable: unknown-instead-of-any
// tslint:disable-next-line: max-func-body-length
describe('base ui tree test', () => {
    async function configTestingModule(
        declarations: Type<any>[],
    ): Promise<void> {
        await TestBed.configureTestingModule({
            declarations,
            imports: [
                LogiTreeModule,
                MatIconTestingModule,
                MatTreeModule,
                LogiCheckboxModule,
            ],
        })
    }

    let fixture: ComponentFixture<BasicTreeComponent>
    let component: BasicTreeComponent
    let loader: HarnessLoader
    beforeEach(async() => {
        await configTestingModule([BasicTreeComponent])
        fixture = TestBed.createComponent(BasicTreeComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
        loader = TestbedHarnessEnvironment.loader(fixture)
    })

    it('basic display', () => {
        const elements = getNodeElements()
        expect(elements.length).toBe(3)
    })
    it('should expand to show Emily in single select mode', async() => {
        const emily = component.data[0].children[1].children[0]
        const selection = new SelectionModel<TestNode>(false, [emily])
        component.selection = selection
        fixture.detectChanges()
        const nodes = await loader.getAllHarnesses(TreeNodeHarness)
        expect(nodes.length).toBe(7)
    })

    it('search', () => {
        component.filterKey = 'y'
        fixture.detectChanges()
        const textList = Array.from(getNodeElements()).map(e => e.textContent)
        expect(textList).toEqual(['April', 'Barry', 'Cade', 'Emily'])
    })
    it('clear search key', () => {
        component.filterKey = 'a'
        fixture.detectChanges()
        component.filterKey = ''
        fixture.detectChanges()
        const textList = Array.from(getNodeElements()).map(e => e.textContent)
        expect(textList).toEqual(['April', 'June', 'Ralap'])
    })
    it('should have checkbox when multi select', async() => {
        const selection = new SelectionModel<TestNode>(true)
        component.selection = selection
        fixture.detectChanges()
        const checkboxes = await loader.getAllHarnesses(CheckboxHarness)
        expect(checkboxes.length).toBe(3)
    })
    it('3,7,8 checked, 5 indeterminate', async() => {
        const checknodes1 = component.data[0].children[0]
        const checknodes2 = [component.data[2], ...component.data[2].children]
        const selection =
            new SelectionModel(true, [checknodes1, ...checknodes2])
        component.selection = selection
        fixture.detectChanges()
        const parents = await loader
            .getAllHarnesses(TreeNodeHarness.with({level: 1}))
        parents.forEach(async p => {
            await p.expand()
        })
        /**
         * TODO(minglong): Strange for twice calling here. If not call twice,
         * 'nodes' can not get expected data.
         */
        await loader.getAllHarnesses(TreeNodeHarness)
        const nodes = await loader.getAllHarnesses(TreeNodeHarness)
        const checkboxes = await loader.getAllHarnesses(CheckboxHarness)
        expect(await nodes[0].getText()).toBe('April')
        expect(await checkboxes[0].isIndeterminate()).toBe(true)
        expect(await nodes[3].getText()).toBe('June')
        expect(await checkboxes[3].isChecked()).toBe(false)
        expect(await nodes[4].getText()).toBe('Ralap')
        expect(await checkboxes[4].isChecked()).toBe(true)
        expect(await nodes[5].getText()).toBe('Kim')
        expect(await checkboxes[5].isChecked()).toBe(true)
    })
    it('click 5, 5 expand', async () => {
        const selection = new SelectionModel<TestNode>(true)
        component.selection = selection
        fixture.detectChanges()
        const parents = await loader.getAllHarnesses(TreeNodeHarness)
        await parents[0].hostClick()
        const checkboxes = await loader.getAllHarnesses(CheckboxHarness)
        expect(await parents[0].getText()).toBe('April')
        expect(await parents[0].isExpanded()).toBeTrue()
        expect(await checkboxes[0].isChecked()).toBeFalse()
    })
    it('click 6, 6 checked', async () => {
        const selection = new SelectionModel<TestNode>(true)
        component.selection = selection
        fixture.detectChanges()
        const parents = await loader.getAllHarnesses(TreeNodeHarness)
        await parents[1].hostClick()
        const checkboxes = await loader.getAllHarnesses(CheckboxHarness)
        expect(await parents[1].getText()).toBe('June')
        expect(await checkboxes[1].isChecked()).toBeTrue()
    })
    it('4,5 indeterminate, 1 checked', async() => {
        const selection = new SelectionModel<TestNode>(true)
        component.selection = selection
        fixture.detectChanges()
        let parents = await loader.getAllHarnesses(TreeNodeHarness)
        parents.forEach(async p => {
            await p.expand()
        })
        // TODO(minglong): remove calling twice below.
        await loader.getAllHarnesses(TreeNodeHarness)
        parents = await loader.getAllHarnesses(TreeNodeHarness)
        parents.forEach(async p => {
            await p.expand()
        })
        // TODO(minglong): remove calling twice below.
        await loader.getAllHarnesses(TreeNodeHarness)
        const nodes = await loader.getAllHarnesses(TreeNodeHarness)
        const checkboxes = await loader.getAllHarnesses(CheckboxHarness)
        expect(nodes.length).toBe(8)
        // emily
        expect(await nodes[3].getText()).toBe('Emily')
        await checkboxes[3].check()
        const checkboxesAfter = await loader.getAllHarnesses(CheckboxHarness)
        expect(await checkboxesAfter[2].isIndeterminate()).toBeTrue()
        expect(await checkboxesAfter[0].isIndeterminate()).toBeTrue()
        expect(await checkboxesAfter[3].isChecked()).toBeTrue()
    })
    it('7,8 checked and 7,8 disabled', async() => {
        const nodes = [component.data[2], component.data[2].children[0]]
        const selection = new SelectionModel<TestNode>(true, nodes)
        component.selection = selection
        fixture.detectChanges()
        const parents = await loader.getAllHarnesses(TreeNodeHarness)
        await parents[2].expand()
        const checkboxes = await loader.getAllHarnesses(CheckboxHarness)
        expect(await checkboxes[2].isDisabled()).toBe(true)
        expect(await checkboxes[2].isIndeterminate()).toBe(false)
        expect(await checkboxes[2].isChecked()).toBe(true)
        expect(await checkboxes[3].isDisabled()).toBe(true)
        expect(await checkboxes[3].isChecked()).toBe(true)
    })

    function getNodeElements(): NodeListOf<Element> {
        const root: HTMLElement = fixture.nativeElement
        return root.querySelectorAll('.mat-tree-node:not(.hidden)')
    }
})

// tslint:disable: codelyzer-template-property-should-be-public
// tslint:disable: readonly-array
export class TestNode {
    public constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly disabled: boolean,
        public readonly children: TestNode[],
    ) {}
}

/**
 *  | -- April 5
 *  |      | -- Barry 3
 *  |      | -- Cade 4
 *  |      |     | -- Emily 1
 *  |      |     | -- Benjamin 2
 *  |
 *  | -- June 6
 *  | -- Ralap 8
 *  |      | -- Kim 7
 */
function mockTestNodes(): TestNode[] {
    const node1 = new TestNode('1', 'Emily', false, [])
    const node2 = new TestNode('2', 'Benjamin', false, [])
    const node3 = new TestNode('3', 'Barry', false, [])
    const node4 = new TestNode('4', 'Cade', false, [node1, node2])
    const node5 = new TestNode('5', 'April', false, [node3, node4])
    const node6 = new TestNode('6', 'June', false, [])
    const node7 = new TestNode('7', 'Kim', true, [])
    const node8 = new TestNode('8', 'Ralap', true, [node7])
    return [node5, node6, node8]
}

// tslint:disable: use-component-selector component-max-inline-declarations
@Component({
    template: `
<logi-tree [data]='data'
    [getChildren]='getChildren'
    [transform]='transform'
    [selection]='selection'
    [filterKey]='filterKey'
></logi-tree>
`,
})
class BasicTreeComponent {
    public data = mockTestNodes()
    public filterKey = ''
    public selection = new SelectionModel<TestNode>()
    public getChildren = (node: TestNode) => node.children
    public transform = (node: TestNode, level: number): TreeNode<TestNode> =>
        new TreeNodeBuilder<TestNode>()
            .dataNode(node)
            .expandable(this.getChildren(node).length > 0)
            .id(node.id)
            .level(level)
            .disabled(node.disabled)
            .name(node.name)
            .build()
}
