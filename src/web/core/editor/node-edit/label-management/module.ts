import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule} from '@angular/forms'
import {MatButtonModule} from '@angular/material/button'
import {MatRippleModule} from '@angular/material/core'
import {MatDialogModule} from '@angular/material/dialog'
import {MatIconModule} from '@angular/material/icon'
import {LogiButtonModule} from '@logi/src/web/ui/button'
import {LogiDialogModule} from '@logi/src/web/ui/dialog'

import {LabelManageComponent} from './component'
import {LabelCellComponent} from './label-cell/component'

@NgModule({
    declarations: [
        LabelCellComponent,
        LabelManageComponent,
    ],
    exports: [LabelManageComponent],
    imports: [
        CommonModule,
        FormsModule,
        LogiButtonModule,
        LogiDialogModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatRippleModule,
    ],
})
export class LabelManagementModule {}
