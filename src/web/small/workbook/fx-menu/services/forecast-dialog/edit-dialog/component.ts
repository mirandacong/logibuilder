import {ChangeDetectionStrategy, Component, Inject} from '@angular/core'
import {FormControl} from '@angular/forms'
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-edit-dialog',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class EditDialogComponent {
    public constructor(

        @Inject(MAT_DIALOG_DATA) private readonly _dialogData: Readonly<string>,
        private readonly _dialogRef: MatDialogRef<EditDialogComponent>,
    ) {}

    // tslint:disable-next-line: readonly-array
    public items = new FormControl(this._dialogData)

    public onCancel(): void {
        this._dialogRef.close()
    }

    public setForecast(): void {
        const itemNameList = this.items.value
            .split(/\n/gm)
            .filter((name: string): boolean =>
                name.trim().length !== 0)
        this._dialogRef.close(itemNameList)
        return
    }
}
