import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core'
import {Node} from '@logi/src/lib/hierarchy/core'
import {NodeFocusService} from '@logi/src/web/core/editor/node-focus'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-drag-img',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class DragImgComponent implements OnInit {
    public constructor(
        private readonly _nodeFocusSvc: NodeFocusService,
    ) {}
    public node!: Readonly<Node>
    public draggingNodesLen!: number

    public ngOnInit(): void {
        const selNodes = this._nodeFocusSvc.getSelNodes()
        this.draggingNodesLen = selNodes.length
        this.node = selNodes[this.draggingNodesLen - 1]
    }
}
