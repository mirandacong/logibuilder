import {
    ChangeDetectionStrategy,
    Component,
    Injector,
    Input,
    OnDestroy,
    OnInit,
} from '@angular/core'
import {NodeType, RowBlock} from '@logi/src/lib/hierarchy/core'
import {Block} from '@logi/src/web/core/editor/logi-hierarchy/base'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-editor-row-block',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class RowBlockComponent extends Block implements OnInit, OnDestroy {
    public constructor(
        public readonly injector: Injector,
    ) {
        super(injector)
    }
    @Input() public set cb(cb: Readonly<RowBlock>) {
        if (cb === undefined)
            return
        this.node = cb
        this.name = cb.name
    }

    public dropZone: ReadonlyArray<string> = [NodeType.ROW_BLOCK.toString(),
        NodeType.ROW.toString()]

    public node!: Readonly<RowBlock>
    @Input() public lastNodeInParent!: boolean
    // tslint:disable-next-line: max-func-body-length
    public ngOnInit(): void {
        this.name = this.node.name
        this.expandNodeState()
    }

    public ngOnDestroy(): void {
        this.destroyed$.next()
        this.destroyed$.complete()
    }

    public nameChange(): void {
        this.renameNode()
    }
}
