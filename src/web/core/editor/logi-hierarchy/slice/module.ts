import {DragDropModule} from '@angular/cdk/drag-drop'
import {OverlayModule} from '@angular/cdk/overlay'
import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {MatAutocompleteModule} from '@angular/material/autocomplete'
import {MatButtonModule} from '@angular/material/button'
import {MatRippleModule} from '@angular/material/core'
import {MatDialogModule} from '@angular/material/dialog'
import {MatDividerModule} from '@angular/material/divider'
import {MatIconModule} from '@angular/material/icon'
import {MatMenuModule} from '@angular/material/menu'
import {EqualModule} from '@logi/src/web/core/editor/logi-hierarchy/equal'
import {FbTagModule} from '@logi/src/web/core/editor/logi-hierarchy/fb-tag'
import {
    SimpleEditorModule,
} from '@logi/src/web/core/editor/logi-hierarchy/simple-editor'
import {NodeFocusableModule} from '@logi/src/web/core/editor/node-focus/module'
import {LogiButtonModule} from '@logi/src/web/ui/button'
import {LogiInputModule} from '@logi/src/web/ui/input'

import {ColSliceNameModule} from './col-slice-name'
import {SliceComponent} from './component'
import {RowSliceNameModule} from './row-slice-name'

@NgModule({
    declarations: [SliceComponent],
    exports: [SliceComponent],
    imports: [
        ColSliceNameModule,
        CommonModule,
        DragDropModule,
        EqualModule,
        FbTagModule,
        FormsModule,
        LogiButtonModule,
        LogiInputModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatDialogModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        MatRippleModule,
        NodeFocusableModule,
        OverlayModule,
        ReactiveFormsModule,
        RowSliceNameModule,
        SimpleEditorModule,
    ],
})
export class SliceModule { }
