// tslint:disable:ext-variable-name variable-name component-selector
// tslint:disable:codelyzer-template-property-should-be-public
// tslint:disable: no-inputs-metadata-property no-host-metadata-property
// tslint:disable: use-component-view-encapsulation
import {SelectionModel} from '@angular/cdk/collections'
import {FlatTreeControl} from '@angular/cdk/tree'
import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnInit,
    ViewEncapsulation,
} from '@angular/core'
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree'
import {isHTMLInputElement} from '@logi/src/web/base/utils'
import {Observable} from 'rxjs'

import {setHierarchy, toInteranlNode, TreeNode} from './tree_node'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'logi-tree-host',
    },
    selector: 'logi-tree',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class LogiTreeComponent<T extends {}> implements OnInit {
    /**
     * TODO (zengkai): should replace `any[]` with `T[]` but it will get a
     * template type checking error in app-sample/tree.
     */
    // tslint:disable-next-line: unknown-instead-of-any
    @Input() public set data(d: readonly any[]) {
        if (d === this._data)
            return
        // tslint:disable-next-line: unknown-instead-of-any no-type-assertion
        const data = d as any[]
        this._data = data
        if (this.dataSource)
            this._initDataSource()
    }

    /**
     * Only single-selected should expand to selected node.
     */
    @Input() public set selection(sel: SelectionModel<T> | undefined) {
        if (sel === undefined)
            return
        this.sel = sel
        this._setSelected()
    }

    @Input() public set filterKey(key: string) {
        this._filterWithKey(key)
    }
    public sel = new SelectionModel<T>(true)
    @Input() public transform!: (node: T, level: number) => TreeNode<T>
    @Input() public getChildren!: (node: T) =>
        // tslint:disable-next-line: readonly-array
        Observable<T[]> | T[] | undefined | null

    @Input() public getIcon?: (node: TreeNode<T>) => string
    @Input() public showSearch = true
    public treeControl!: FlatTreeControl<TreeNode<T>>
    public treeFlattener!: MatTreeFlattener<T, TreeNode<T>>
    public dataSource!: MatTreeFlatDataSource<T, TreeNode<T>>

    public getLines = getLines

    // tslint:disable-next-line: naming-convention
    public hasChild = (_: number, nodeData: TreeNode<T>) => nodeData.expandable

    public someSelected(node: TreeNode<T>): boolean {
        const children = this.treeControl.getDescendants(node)
        const selecteds = children.filter(n => this.sel.isSelected(n.dataNode))
        return selecteds.length > 0 && selecteds.length !== children.length
    }

    public onClick(node: TreeNode<T>): void {
        if(node.disabled)
            return
        this.sel.toggle(node.dataNode)
        if(this.sel.isMultipleSelection())
            this._multiSelectToggle(node)
    }

    public groupToggle(node: TreeNode<T>): void {
        const checked = !this._isAllSelected(node)
        this._setNodeSelState(node, checked)
    }

    public onSearch(event: Event): void {
        const input = event.target
        if (!isHTMLInputElement(input))
            return
        const key = input.value
        this._filterWithKey(key)
    }

    public ngOnInit(): void {
        this.treeControl = new FlatTreeControl<TreeNode<T>>((
            node: TreeNode<T>,
        ): number => node.level, (n: TreeNode<T>): boolean => n.expandable)

        this.treeFlattener = new MatTreeFlattener<T, TreeNode<T>>(
            this.transform,
            getLevel,
            isExpandable,
            this.getChildren,
        )

        this.dataSource = new MatTreeFlatDataSource<T, TreeNode<T>>(
            this.treeControl, this.treeFlattener)
        this._initDataSource()
    }
    // tslint:disable-next-line: readonly-array
    private _data: T[] = []

    private _multiSelectToggle(node: TreeNode<T>): void {
        const parent = toInteranlNode(node).parent
        if (parent)
            this._parentToggle(parent)
    }

    private _parentToggle(parent: TreeNode<T>): void {
        const state = this._isAllSelected(parent)
        const dataNode = parent.dataNode
        state ? this.sel.select(dataNode) : this.sel.deselect(dataNode)
        const p = toInteranlNode(parent).parent
        if (p)
            this._parentToggle(p)
    }

    private _isAllSelected(node: TreeNode<T>): boolean {
        return toInteranlNode(node).children.every(n =>
            this.sel.isSelected(n.dataNode))
    }

    private _setSelected(): void {
        if (this.sel.isMultipleSelection()
            || this.sel.selected.length !== 1
            || !this.dataSource)
            return
        const node = this.sel.selected[0]
        const target = this.treeControl.dataNodes.find(d => d.dataNode === node)
        if (target === undefined)
            return
        toInteranlNode(target).getParents().forEach(p => {
            this.treeControl.expand(p)
        })
    }

    private _setNodeSelState(node: TreeNode<T>, checked: boolean): void {
        const dataNode = node.dataNode
        if (!node.disabled)
            checked ? this.sel.select(dataNode) : this.sel.deselect(dataNode)
        toInteranlNode(node).children.forEach(n => {
            this._setNodeSelState(n, checked)
        })
    }

    private _initDataSource(): void {
        this.dataSource.data = this._data
        setHierarchy(this.treeControl.dataNodes, this.getChildren)
        this._setSelected()
    }

    private _filterWithKey(key: string): void {
        if (!this.treeControl)
            return
        if (key.trim().length === 0) {
            /**
             * Set all nodes visible.
             */
            this.treeControl.dataNodes.forEach(n => {
                const node = toInteranlNode(n)
                node.show()
            })
            this.treeControl.collapseAll()
            return
        }
        this.treeControl.expandAll()
        this.treeControl.dataNodes.forEach(n => {
            const node = toInteranlNode(n)
            const keep = n.name.toLowerCase().includes(key.toLowerCase())
            keep ? node.show() : node.hidden()
            if (!keep)
                return
            node.getParents().forEach(p => {
                const visibles = p.children.filter(c => c.visible)
                visibles.length === 0 ? p.hidden() : p.show()
            })
        })
    }
}

function getLevel<T>(node: TreeNode<T>): number {
    return node.level
}

function isExpandable<T>(node: TreeNode<T>): boolean {
    return node.expandable
}

function getLines<T>(node: TreeNode<T>): readonly number[] {
    const lis: number[] = []
    for (let i = 0; i < node.level; i += 1)
        lis.push(i)
    return lis
}
