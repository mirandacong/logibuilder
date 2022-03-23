import {ChangeDetectionStrategy, Component, Inject} from '@angular/core'
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog'
import {LogiCheckboxChange} from '@logi/src/web/ui/checkbox'

export interface DialogData {
    readonly rowNames: readonly string[]
    readonly isScalar: boolean
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-batch-add-dialog',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class BatchAddDialogComponent {
    public constructor(
        private readonly _dialogRef: MatDialogRef<BatchAddDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public readonly showScalar: boolean,
    ) {}

    public newNames = ''

    public disabled = true

    public cancel(): void {
        this._dialogRef.close()
    }

    public checkName(context: string): void {
        this.disabled = context === ''
    }

    public onConfirm(): void {
        this._dialogRef.close({
            isScalar: this._isScalar,
            rowNames: this._getName(),
        })
    }

    public changed(event: LogiCheckboxChange): void {
        this._isScalar = event.checked
    }
    private _isScalar = false

    private _getName(): readonly string[] {
        return this.newNames
            .split(/\n/gm)
            .map((name: string): string =>
                name.trim())
            .filter((name: string): boolean =>
                name.length !== 0)
    }
}
