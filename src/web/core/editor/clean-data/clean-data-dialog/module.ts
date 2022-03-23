import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatDialogModule} from '@angular/material/dialog'
import {LogiButtonModule} from '@logi/src/web/ui/button'
import {LogiCheckboxModule} from '@logi/src/web/ui/checkbox'

import {CleanDataDialogComponent} from './component'

@NgModule({
    declarations: [CleanDataDialogComponent],
    exports: [CleanDataDialogComponent],
    imports: [
        CommonModule,
        LogiButtonModule,
        LogiCheckboxModule,
        MatDialogModule,
    ],
})
// tslint:disable-next-line: no-unnecessary-class
export class CleanDataDialogModule {}
