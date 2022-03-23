import {
    ChangeDetectionStrategy,
    Component,
    Injector,
    Input,
    OnDestroy,
    OnInit,
} from '@angular/core'
import {ColumnBlock, NodeType} from '@logi/src/lib/hierarchy/core'
import {Block} from '@logi/src/web/core/editor/logi-hierarchy/base'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-editor-column-block',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class ColumnBlockComponent extends Block implements OnInit, OnDestroy {
    public constructor(
        public readonly injector: Injector,
    ) {
        super(injector)
    }

    @Input() public set cb(cb: Readonly<ColumnBlock>) {
        if (cb === undefined)
            return
        this.node = cb
        this.name = cb.name
    }
    @Input() public lastNodeInParent!: boolean
    public dropZone: ReadonlyArray<string> = [NodeType.COLUMN_BLOCK.toString(),
        NodeType.COLUMN.toString()]

    // tslint:disable-next-line: max-func-body-length
    public ngOnInit(): void {
        this.name = this.node.name
        this.expandNodeState()
    }

    public ngOnDestroy(): void {
        this.destroyed$.next()
        this.destroyed$.complete()
    }
}
