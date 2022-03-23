import {DragDropModule} from '@angular/cdk/drag-drop'
import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {MatDialogModule} from '@angular/material/dialog'
import {LogiButtonModule} from '@logi/src/web/ui/button'
import {LogiInputModule} from '@logi/src/web/ui/input'

import {SelectRowDialogComponent} from './component'

@NgModule({
    declarations: [SelectRowDialogComponent],
    exports: [SelectRowDialogComponent],
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        LogiButtonModule,
        LogiInputModule,
        MatDialogModule,
        ReactiveFormsModule,
    ],
})
export class SelectRowDialogModule {}
