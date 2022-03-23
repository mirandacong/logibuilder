import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatDialogModule} from '@angular/material/dialog'
import {MatIconModule} from '@angular/material/icon'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {CustomSheetComponent} from './component'

@NgModule({
    declarations: [CustomSheetComponent],
    exports: [CustomSheetComponent],
    imports: [
        CommonModule,
        LogiButtonModule,
        MatDialogModule,
        MatIconModule,
    ],
})
export class CustomSheetModule {}
