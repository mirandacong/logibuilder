import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
} from '@angular/core'
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog'
import {Action} from '@logi/src/web/ui/common/action'
import {Subject} from 'rxjs'
import {takeUntil} from 'rxjs/operators'

import {assertIsTextDialogData, TextDialogData} from './dialog_data'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-text-dialog',
    styleUrls: ['./text.style.scss'],
    templateUrl: './text.template.html',
})
export class TextDialogComponent implements OnDestroy {
    public constructor(
        private readonly _cd: ChangeDetectorRef,

        @Inject(MAT_DIALOG_DATA)
        public readonly data: TextDialogData,
        private readonly _dialogRef: MatDialogRef<TextDialogComponent>,
    ) {
        assertIsTextDialogData(this.data)
        this.primaryAction = this.data.buttonGroup.primary
        this.secondaryActions = this.data.buttonGroup.secondary
    }

    public primaryAction?: Action
    public secondaryActions: readonly Action[] = []
    public loading = false

    public ngOnDestroy(): void {
        this._destroyed$.next()
        this._destroyed$.complete()
    }

    public onClickPrimary(action: Action): void {
        this.loading = true
        action.run().pipe(takeUntil(this._destroyed$)).subscribe(res => {
            this.loading = false
            this._cd.markForCheck()
            this._dialogRef.close(res)
        })
    }

    public onClickSecondary(action: Action): void {
        action.run().pipe(takeUntil(this._destroyed$)).subscribe(res => {
            this._dialogRef.close(res)
        })
    }

    private readonly _destroyed$ = new Subject<void>()
}
