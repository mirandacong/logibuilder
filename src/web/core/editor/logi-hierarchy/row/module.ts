import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule} from '@angular/forms'
import {MatAutocompleteModule} from '@angular/material/autocomplete'
import {MatButtonModule} from '@angular/material/button'
import {MatRippleModule} from '@angular/material/core'
import {MatDialogModule} from '@angular/material/dialog'
import {MatDividerModule} from '@angular/material/divider'
import {MatIconModule} from '@angular/material/icon'
import {MatMenuModule} from '@angular/material/menu'
import {ContextMenuModule} from '@logi/src/web/common/context-menu'
import {DndModule} from '@logi/src/web/core/editor/drag-drop'
import {EqualModule} from '@logi/src/web/core/editor/logi-hierarchy/equal'
import {
    SimpleEditorModule,
} from '@logi/src/web/core/editor/logi-hierarchy/simple-editor'
import {NodeFocusableModule} from '@logi/src/web/core/editor/node-focus/module'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {FbTagModule} from '../fb-tag/module'
import {LabelModule} from '../label/module'
import {SliceModule} from '../slice/module'

import {RowComponent} from './component'
import {SlicePartComponent} from './slice/component'
import {TooltipModule} from './tooltip'

@NgModule({
    declarations: [RowComponent, SlicePartComponent],
    exports: [RowComponent],
    imports: [
        CommonModule,
        ContextMenuModule,
        DndModule,
        EqualModule,
        FbTagModule,
        FormsModule,
        LabelModule,
        LogiButtonModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatDialogModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        MatRippleModule,
        NodeFocusableModule,
        SimpleEditorModule,
        SliceModule,
        TooltipModule,
    ],
})
export class RowModule { }
