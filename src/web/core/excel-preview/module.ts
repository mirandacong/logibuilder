import {CommonModule} from '@angular/common'
import {HttpClientModule} from '@angular/common/http'
import {NgModule, Provider} from '@angular/core'
import {MatDialogModule} from '@angular/material/dialog'
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner'
import {MatSnackBarModule} from '@angular/material/snack-bar'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {ExcelPreviewComponent} from './component'
import {ExcelService as ExcelPreviewService} from './excel/service'
import {LegendModule} from './legend'
import {OperateService} from './operator/service'

// tslint:disable-next-line: readonly-array
export const PROVIDERS: Provider[] =
    [ExcelPreviewService, OperateService]

@NgModule({
    bootstrap: [ExcelPreviewComponent],
    declarations: [ExcelPreviewComponent],
    exports: [ExcelPreviewComponent],
    imports: [
        CommonModule,
        HttpClientModule,
        LegendModule,
        LogiButtonModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
    ],
    providers: PROVIDERS,
})
export class ExcelPreviewModule { }
