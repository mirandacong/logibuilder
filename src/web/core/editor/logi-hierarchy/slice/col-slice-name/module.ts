import {DragDropModule} from '@angular/cdk/drag-drop'
import {OverlayModule} from '@angular/cdk/overlay'
import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {MatAutocompleteModule} from '@angular/material/autocomplete'
import {MatIconModule} from '@angular/material/icon'
import {LogiInputModule} from '@logi/src/web/ui/input'

import {ColSliceNameComponent} from './component'

@NgModule({
    declarations: [ColSliceNameComponent],
    exports: [ColSliceNameComponent],
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        LogiInputModule,
        MatAutocompleteModule,
        MatIconModule,
        OverlayModule,
        ReactiveFormsModule,
    ],
})
export class ColSliceNameModule {}
