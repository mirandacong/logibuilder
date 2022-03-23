import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core'
import {MatDialogRef} from '@angular/material/dialog'
import {
    getEditbleLabels,
    RemoveLabelActionBuilder,
    RenameLabelActionBuilder,
} from '@logi/src/lib/api'
import {Label} from '@logi/src/lib/hierarchy/core'
import {StudioApiService} from '@logi/src/web/global/api'
import {
    ActionBuilder,
    ButtonGroupBuilder,
    DialogService,
    TextDialogBuilder,
    TextLineBuilder,
    TextSpanBuilder,
    TextSpanType,
} from '@logi/src/web/ui/dialog'
import {Observable, of, Subject} from 'rxjs'
import {takeUntil} from 'rxjs/operators'

import {CellChange} from './label-cell/component'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-label-manage-dialog',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class LabelManageComponent implements OnInit, OnDestroy {
    public constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _dialogRef: MatDialogRef<LabelManageComponent>,
        private readonly _dialogSvc: DialogService,
        private readonly _studioApiSvc: StudioApiService,
    ) {}
    public count = 0
    public showFootText = false
    public footText = ''
    public colLabels: readonly Label[] = []
    // tslint:disable-next-line: readonly-array
    public colSelected: boolean[] = []

    // tslint:disable-next-line: ter-max-len
    // tslint:disable-next-line: prefer-function-over-method ext-variable-name naming-convention codelyzer-template-property-should-be-public
    public trackByFnReturnItem(_: number, item: unknown): unknown {
        return item
    }

    public onColClick(i: number): void {
        this.showFootText = true
        this._initSlected()
        this.colSelected[i] = true

        const label = this.colLabels[i]
        const targets = this._nodeLabelmaps[1].get(label)
        if (targets === undefined)
            return
        this.count = targets.length
        this.footText = '使用该标签的列数'
    }

    public onColCellChange(change: CellChange): void {
        this._onCellChange(
            this._nodeLabelmaps[1],
            change,
            '将从所有带有此标签的列中删除，确定删除？',
        )
    }

    public ngOnInit(): void {
        this._initLabel()
        this._studioApiSvc
            .hierarchyChange()
            .pipe(takeUntil(this._destroyed$))
            .subscribe((): void => {
                this._initLabel()
                this._cd.detectChanges()
            },
            )
    }

    public hasScrollbar(): boolean {
        if (this._container === undefined)
            return false
        const el = this._container.nativeElement
        return el?.scrollHeight > el.clientHeight + 1
    }

    public ngOnDestroy(): void {
        this._destroyed$.next()
        this._destroyed$.complete()
    }

    public close(): void {
        this._dialogRef.close()
    }
    private _nodeLabelmaps!: readonly Map<Label, readonly string[]>[]
    private _destroyed$ = new Subject<void>()
    @ViewChild('setlabel') private _container!: ElementRef<HTMLDivElement>

    private _onCellChange(
        map: Map<Label, readonly string[]>,
        change: CellChange,
        message: string,
    ): void {
        this.showFootText = false
        const targets = map.get(change.oldLabel)
        if (targets === undefined)
            return
        if (change.isRemove) {
            this._openRemove(targets, change, message)
            return
        }
        const isSame = Array.from(map.keys()).find((sub: Label): boolean =>
            sub === change.newLabel,
        ) !== undefined
        if (!isSame) {
            this._modified(targets, change.newLabel, change.oldLabel)
            return
        }
        this._openMerge(targets, change)
    }

    private _openMerge(targets: readonly string[], change: CellChange): void {
        const onConfirm = (): Observable<boolean> =>
            new Observable(sub => {
                this._modified(targets, change.newLabel, change.oldLabel)
                sub.next(true)
                sub.complete()
            })
        const onCancel = () => of(true)
        const buttonGroup = new ButtonGroupBuilder()
            .secondary([new ActionBuilder().text('取消').run(onCancel).build()])
            .primary(new ActionBuilder().text('合并').run(onConfirm).build())
            .build()
        const lines = [
            new TextLineBuilder()
                .spans([new TextSpanBuilder()
                    .type(TextSpanType.BASIC)
                    .text('标签名称已经存在，是否合并？')
                    .build(),
                ])
                .build(),
        ]
        const dialogData = new TextDialogBuilder()
            .title('标签重名')
            .lines(lines)
            .buttonGroup(buttonGroup)
            .build()
        this._dialogSvc.openTextDialog(dialogData)
    }

    private _openRemove(
        targets: readonly string[],
        change: CellChange,
        message: string,
    ): void {
        const onConfirm = (): Observable<boolean> =>
            new Observable(sub => {
                this._removeLabel(targets, change.oldLabel)
                sub.next(true)
                sub.complete()
            })
        const onCancel = () => of(true)
        const buttonGroup = new ButtonGroupBuilder()
            .secondary([new ActionBuilder().text('取消').run(onCancel).build()])
            .primary(new ActionBuilder().text('删除').run(onConfirm).build())
            .build()
        const lines = [
            new TextLineBuilder()
                .spans([new TextSpanBuilder()
                    .type(TextSpanType.BASIC)
                    .text(message)
                    .build(),
                ])
                .build(),
        ]
        const dialogData = new TextDialogBuilder()
            .title('删除标签')
            .lines(lines)
            .buttonGroup(buttonGroup)
            .build()
        this._dialogSvc.openTextDialog(dialogData)
    }

    private _initLabel(): void {
        this._nodeLabelmaps = getEditbleLabels(this._studioApiSvc.currBook())
        this.colLabels = Array.from(this._nodeLabelmaps[1].keys())
        this._initSlected()
        this.showFootText = false
        this._cd.detectChanges()
    }

    private _initSlected(): void {
        this.colSelected = this.colLabels.map((): boolean => false)
    }

    private _removeLabel(targets: readonly string[], old: Label): void {
        const action = new RemoveLabelActionBuilder()
            .label(old)
            .targets(targets)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    private _modified(
        targets: readonly string[],
        newLabel: Label,
        oldLabel: Label,
    ): void {
        const action = new RenameLabelActionBuilder()
            .newLabel(newLabel)
            .oldLabel(oldLabel)
            .formulabearers(targets)
            .build()
        this._studioApiSvc.handleAction(action)
    }
}
