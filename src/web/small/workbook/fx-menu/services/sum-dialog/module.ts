import {DragDropModule} from '@angular/cdk/drag-drop'
import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {MatDialogModule} from '@angular/material/dialog'
import {MatIconModule} from '@angular/material/icon'
import {MatTooltipModule} from '@angular/material/tooltip'
import {LogiButtonModule} from '@logi/src/web/ui/button'
import {LogiInputModule} from '@logi/src/web/ui/input'

import {SumDialogComponent} from './component'
import {SumSnippetService} from './service'

@NgModule({
    declarations: [SumDialogComponent],
    exports: [SumDialogComponent],
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        LogiButtonModule,
        LogiInputModule,
        MatDialogModule,
        MatIconModule,
        MatTooltipModule,
        ReactiveFormsModule,
    ],
    providers: [SumSnippetService],
})
export class SumDialogModule {}
