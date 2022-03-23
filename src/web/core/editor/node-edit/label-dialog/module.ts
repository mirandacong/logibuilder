import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {MatButtonModule} from '@angular/material/button'
import {MatRippleModule} from '@angular/material/core'
import {MatDialogModule} from '@angular/material/dialog'
import {MatIconModule} from '@angular/material/icon'
import {LogiButtonModule} from '@logi/src/web/ui/button'
import {LogiFormFieldModule} from '@logi/src/web/ui/form-field'
import {LogiInputModule} from '@logi/src/web/ui/input'

import {LabelDialogComponent} from './component'
import {LabelDialogService} from './service'

@NgModule({
    declarations: [LabelDialogComponent],
    exports: [LabelDialogComponent],
    imports: [
        CommonModule,
        FormsModule,
        LogiButtonModule,
        LogiFormFieldModule,
        LogiInputModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatRippleModule,
        ReactiveFormsModule,
    ],
    providers: [LabelDialogService],
})
export class LabelDialogModule {}
