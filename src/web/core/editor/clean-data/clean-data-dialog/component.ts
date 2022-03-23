import {ChangeDetectionStrategy, Component, Inject} from '@angular/core'
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog'
import {ClearDataActionBuilder} from '@logi/src/lib/api'
import {Type} from '@logi/src/lib/hierarchy/core'
import {trackByFnReturnItem} from '@logi/src/web/base/track-by'
import {StudioApiService} from '@logi/src/web/global/api'

import {CleanType, typeList} from './clean_type'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-clean-data-dialog',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class CleanDataDialogComponent {
    public constructor(
        private readonly _dialogRef: MatDialogRef<CleanDataDialogComponent>,
        private readonly _studioApiSvc: StudioApiService,
        /**
         * [name:string,uuid:string]
         */
        @Inject(
            MAT_DIALOG_DATA,
        ) public readonly info: readonly [string, string],
    ) {}

    public typeList = typeList()

    public allComplete = true
    public trackBy = trackByFnReturnItem
    public setAll(completed: boolean): void {
        this.allComplete = completed
        this.typeList.forEach(t => t.updataComplated(completed))
    }

    public updateAllComplete(cleanType: CleanType, check: boolean): void {
        this.typeList.forEach(t => {
            if (t === cleanType)
                t.updataComplated(check)
        })
        this.allComplete = this.typeList.every(t => t.completed)
    }

    public onCancel(): void {
        this._dialogRef.close()
    }

    public clean(): void {
        let types: Type[] = []
        this.typeList.forEach(t => {
            if (t.completed)
                types = [...types, ...[t.type]]
        })
        const action = new ClearDataActionBuilder()
            .root(this.info[1])
            .types(types)
            .build()
        this._studioApiSvc.handleAction(action).subscribe(() => {
            this._dialogRef.close()
        })
    }
}
