import {DragDropModule} from '@angular/cdk/drag-drop'
import {OverlayModule} from '@angular/cdk/overlay'
import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {MatAutocompleteModule} from '@angular/material/autocomplete'
import {MatIconModule} from '@angular/material/icon'
import {LogiButtonModule} from '@logi/src/web/ui/button'
import {LogiInputModule} from '@logi/src/web/ui/input'

import {RowSliceNameComponent} from './component'

@NgModule({
    declarations: [RowSliceNameComponent],
    exports: [RowSliceNameComponent],
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        LogiButtonModule,
        LogiInputModule,
        MatAutocompleteModule,
        MatIconModule,
        OverlayModule,
        ReactiveFormsModule,
    ],
})
export class RowSliceNameModule {}
