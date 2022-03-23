import {Injectable} from '@angular/core'
import {MatDialog} from '@angular/material/dialog'

import {CleanDataDialogComponent} from './clean-data-dialog'

@Injectable()
/**
 * Service for external.
 */
export class CleanDataService {
    public constructor(
        private readonly _dialog: MatDialog,
    ) {}
    public openCleanDialog(name: string, root: string): void {
        this._dialog.open(
            CleanDataDialogComponent,
            {data: [name, root], autoFocus: false, width: '540px'},
        )
    }
}
