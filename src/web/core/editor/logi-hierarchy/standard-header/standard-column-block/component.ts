import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit,
} from '@angular/core'
import {
    ColumnBlock,
    isColumn,
    isColumnBlock,
} from '@logi/src/lib/hierarchy/core'
import {trackByFnReturnItem} from '@logi/src/web/base/track-by'
import {NodeExpandService} from '@logi/src/web/core/editor/node-expand'
import {
    NodeFocusService,
    SelConfigBuilder,
} from '@logi/src/web/core/editor/node-focus'
import {Subject} from 'rxjs'
import {takeUntil} from 'rxjs/operators'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-standard-column-block',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class StandardColumnBlockComponent implements OnInit, OnDestroy {
    public constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _nodeExpandSvc: NodeExpandService,
        private readonly _nodeFocusSvc: NodeFocusService,
    ) { }
    public collapse = false

    public isColumn = isColumn
    public trackBy = trackByFnReturnItem
    public isColumnBlock = isColumnBlock

    @Input() public node!: Readonly<ColumnBlock>
    @Input() public lastNodeInParent!: boolean
    @Input() public inDialog!: boolean
    public name = ''
    public ngOnInit (): void {
        this.name = this.node.name
        this._expandNodeState()
    }

    public collapseNode (collapse: boolean, e: Event): void {
        this.collapse = collapse
        e.stopPropagation()
        const config = new SelConfigBuilder()
            .multiSelect(false)
            .isExpand(!collapse)
            .build()
        this._nodeFocusSvc.setSelNodes([this.node.uuid], undefined, config)
    }

    public ngOnDestroy (): void {
        this._destroyed$.next()
        this._destroyed$.complete()
    }
    private _destroyed$ = new Subject<void>()

    private _expandNodeState (): void {
        this._nodeExpandSvc
            .listenStateChange()
            .pipe(takeUntil(this._destroyed$))
            .subscribe((uuids: string[]): void => {
                if (!this.collapse || !uuids.includes(this.node.uuid))
                    return
                this.collapse = false
                this._cd.markForCheck()
            })
    }
}
