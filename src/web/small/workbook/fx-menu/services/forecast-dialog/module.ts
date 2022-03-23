import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {MatRippleModule} from '@angular/material/core'
import {MatDialogModule} from '@angular/material/dialog'
import {MatIconModule} from '@angular/material/icon'
import {
    EditDialogModule,
} from '@logi/src/web/small/workbook/fx-menu/services/forecast-dialog/edit-dialog'
import {LogiButtonModule} from '@logi/src/web/ui/button'
import {LogiInputModule} from '@logi/src/web/ui/input'

import {ForecastDialogComponent} from './component'

@NgModule({
    declarations: [ForecastDialogComponent],
    exports: [ForecastDialogComponent],
    imports: [
        CommonModule,
        EditDialogModule,
        FormsModule,
        LogiButtonModule,
        LogiInputModule,
        MatDialogModule,
        MatIconModule,
        MatRippleModule,
        ReactiveFormsModule,
    ],
})
// tslint:disable-next-line: no-unnecessary-class
export class ForecastDialogModule { }
