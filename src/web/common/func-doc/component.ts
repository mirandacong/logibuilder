import {FlatTreeControl} from '@angular/cdk/tree'
import {DOCUMENT} from '@angular/common'
import {HttpClient} from '@angular/common/http'
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Inject,
    OnInit,
    ViewChild,
} from '@angular/core'
import {MatDialogRef} from '@angular/material/dialog'
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree'

import {FuncCategoryNode, getFuncList, PREFIX} from './data'

interface FlatTreeNode {
    readonly expandable: boolean
    readonly name: string
    readonly url?: string
    readonly level: number
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-func-doc',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class FuncDocComponent implements OnInit {
    public constructor(
        private readonly _dialogRef: MatDialogRef<FuncDocComponent>,

        @Inject(DOCUMENT) private readonly _document: Document,
        private readonly _http: HttpClient,
    ) {
        this._initMatTreeDataSource()
    }
    public treeControl!: FlatTreeControl<FlatTreeNode>
    public dataSource!: MatTreeFlatDataSource<FuncCategoryNode, FlatTreeNode>

    public selectedNode: FlatTreeNode | undefined

    public ngOnInit (): void {
        this.dataSource.data = getFuncList()
        const all = this.treeControl.dataNodes
        const firstLeaf = all.find(n => !n.expandable)
        if (firstLeaf === undefined)
            return
        this.selectedNode = firstLeaf
        this._requestContent(firstLeaf)
    }

    public onClose (): void {
        this._dialogRef.close()
    }

    public onSelectFunc (node: FlatTreeNode): void {
        if (node === this.selectedNode)
            return
        this.selectedNode = node
        this._requestContent(node)
    }

    // tslint:disable-next-line: ter-max-len
    // tslint:disable-next-line: ext-variable-name naming-convention codelyzer-template-property-should-be-public
    public hasChild = (_: number, node: FlatTreeNode): boolean =>
        node.expandable

    @ViewChild('md_container')
    private readonly _mdContainerRef!: ElementRef<HTMLElement>

    private _requestContent (node: FlatTreeNode): void {
        this._http
            .get(`/${PREFIX}/${node.url}.html`, {responseType: 'text'})
            .subscribe(content => {
                const relativePath = node.url
                const container = this._mdContainerRef.nativeElement
                // tslint:disable-next-line: no-inner-html
                container.innerHTML = content

                /**
                 * Replace all image src.
                 * TODO (kai): Find a better way.
                 */
                const imgs = container.querySelectorAll('img')
                imgs.forEach((img: HTMLImageElement): void => {
                    const src = img.getAttribute('src') || ''
                    const prefix = PREFIX
                    const rightUrl = new URL(
                        `${prefix}/${relativePath}`,
                        this._document.location.origin)
                    img.src = new URL(src, rightUrl.href).pathname
                })
            },)
    }

    private _initMatTreeDataSource (): void {
        this.treeControl = new FlatTreeControl<FlatTreeNode>(
            (node: FlatTreeNode): number => node.level,
            (node: FlatTreeNode): boolean => node.expandable,
        )

        const treeFlattener =
            new MatTreeFlattener<FuncCategoryNode, FlatTreeNode>(
                (node: FuncCategoryNode, level: number): FlatTreeNode => {
                    return {
                        // tslint:disable-next-line: no-double-negation
                        expandable: !!node.group && node.group.length > 0,
                        level,
                        name: node.title,
                        url: node.url,
                    }
                },
                (node: FlatTreeNode): number => node.level,
                (node: FlatTreeNode): boolean => node.expandable,
                (node: FuncCategoryNode): FuncCategoryNode[] | undefined =>
                    node.group,
            )

        this.dataSource =
            new MatTreeFlatDataSource<FuncCategoryNode, FlatTreeNode>(
                this.treeControl, treeFlattener,
            )
    }
}
